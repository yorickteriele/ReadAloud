#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Usage: tools/create-backend-module.sh <ModuleName> [--help]
EOF
}

fail() {
  printf 'Error: %s\n' "$1" >&2
  exit 1
}

MODULE_NAME=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help|-h)
      usage
      exit 0
      ;;
    --*)
      fail "Unknown option: $1"
      ;;
    *)
      [[ -z "${MODULE_NAME}" ]] || fail "Only one module name can be provided."
      MODULE_NAME="$1"
      shift
      ;;
  esac
done

[[ -n "${MODULE_NAME}" ]] || {
  usage
  fail "Module name is required."
}

[[ "${MODULE_NAME}" =~ ^[A-Z][A-Za-z0-9]*$ ]] || fail "Module name must be PascalCase."

cd -- "$(dirname "${BASH_SOURCE[0]}")/.." || exit 1

TEMPLATE_DIR="tools/templates/backend-module"
TARGET_DIR="src/backend/Modules/${MODULE_NAME}"
MODULE_SCHEMA="${MODULE_NAME,,}"
SOLUTION_PATH="src/ReadAloud.slnx"
FRONTEND_TEMPLATE_PROJECT="tools/templates/frontend-module-presentation/__MODULE_NAME__.Presentation.esproj"
FRONTEND_MODULE_DIR="src/frontend/src/modules/${MODULE_SCHEMA}"
FRONTEND_PRESENTATION_PROJECT="${FRONTEND_MODULE_DIR}/${MODULE_NAME}.Presentation.esproj"

[[ -f "${FRONTEND_TEMPLATE_PROJECT}" ]] || fail "Frontend presentation template not found."
[[ -f "${SOLUTION_PATH}" ]] || fail "Solution file '${SOLUTION_PATH}' not found."

[[ -d "${TEMPLATE_DIR}" ]] || fail "Template directory not found."
[[ ! -d "${TARGET_DIR}" ]] || fail "Module '${MODULE_NAME}' already exists."

mkdir -p "${TARGET_DIR}"
cp -R "${TEMPLATE_DIR}/." "${TARGET_DIR}/"

find "${TARGET_DIR}" -depth -name '*__MODULE_NAME__*' -print0 | while IFS= read -r -d '' path; do
  parent_dir=$(dirname "${path}")
  base_name=$(basename "${path}")
  mv "${path}" "${parent_dir}/${base_name//__MODULE_NAME__/${MODULE_NAME}}"
done

find "${TARGET_DIR}" -type f -print0 | while IFS= read -r -d '' file; do
  sed -i \
    -e "s/__MODULE_NAME__/${MODULE_NAME}/g" \
    -e "s/__MODULE_SCHEMA__/${MODULE_SCHEMA}/g" \
    "${file}"
done

mapfile -t API_PROJECTS < <(find "${TARGET_DIR}" -type f -name '*.Api.csproj' | sort)
[[ "${#API_PROJECTS[@]}" -eq 1 ]] || fail "Expected exactly one Api project in the template."

mapfile -t PROJECTS < <(find "${TARGET_DIR}" -type f -name '*.csproj' | sort)
[[ "${#PROJECTS[@]}" -gt 0 ]] || fail "No projects found in the copied template."

mkdir -p "${FRONTEND_MODULE_DIR}"

if [[ ! -f "${FRONTEND_PRESENTATION_PROJECT}" ]]; then
  sed \
    -e "s/__MODULE_NAME__/${MODULE_NAME}/g" \
    -e "s/__MODULE_SCHEMA__/${MODULE_SCHEMA}/g" \
    "${FRONTEND_TEMPLATE_PROJECT}" \
    > "${FRONTEND_PRESENTATION_PROJECT}"
fi

mkdir -p "${FRONTEND_MODULE_DIR}/api/generated"
touch "${FRONTEND_MODULE_DIR}/api/generated/.gitkeep"

dotnet add "src/backend/Host/Host.csproj" reference "${API_PROJECTS[0]}"
dotnet sln "${SOLUTION_PATH}" add "${PROJECTS[@]}" "${FRONTEND_PRESENTATION_PROJECT}" --solution-folder "Modules/${MODULE_NAME}"

printf "Module '%s' scaffolded successfully.\n" "${MODULE_NAME}"
