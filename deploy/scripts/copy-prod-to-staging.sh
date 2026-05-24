#!/usr/bin/env bash
# Replaces staging data with a fresh copy of production.

set -euo pipefail

PROD_POSTGRES_SERVICE="${PROD_POSTGRES_SERVICE:-}"
STAGING_POSTGRES_SERVICE="${STAGING_POSTGRES_SERVICE:-}"
PROD_DB_NAME="${PROD_DB_NAME:-ReadAloudDb}"
PROD_DB_USER="${PROD_DB_USER:-postgres}"
STAGING_DB_NAME="${STAGING_DB_NAME:-ReadAloudDb}"
STAGING_DB_USER="${STAGING_DB_USER:-postgres}"

if [[ -z "$PROD_POSTGRES_SERVICE" ]]; then
  echo "ERROR: PROD_POSTGRES_SERVICE must be set (Dokploy-assigned container name)" >&2
  exit 1
fi

if [[ -z "$STAGING_POSTGRES_SERVICE" ]]; then
  echo "ERROR: STAGING_POSTGRES_SERVICE must be set (Dokploy-assigned container name)" >&2
  exit 1
fi

resolve_container() {
  local service="$1"
  docker ps --format '{{.Names}}' \
    | awk -v service="$service" '$0 == service || index($0, service ".") == 1 { print; exit }'
}

PROD_CONTAINER="$(resolve_container "$PROD_POSTGRES_SERVICE")"
STAGING_CONTAINER="$(resolve_container "$STAGING_POSTGRES_SERVICE")"

if [[ -z "$PROD_CONTAINER" ]]; then
  echo "ERROR: no running production container found for service '$PROD_POSTGRES_SERVICE'" >&2
  exit 1
fi

if [[ -z "$STAGING_CONTAINER" ]]; then
  echo "ERROR: no running staging container found for service '$STAGING_POSTGRES_SERVICE'" >&2
  exit 1
fi

echo "[$(date -Iseconds)] Copying production database into staging..."

docker exec "$STAGING_CONTAINER" psql -U "$STAGING_DB_USER" -d postgres -v ON_ERROR_STOP=1 \
  -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$STAGING_DB_NAME' AND pid <> pg_backend_pid();"

docker exec "$PROD_CONTAINER" pg_dump \
  -U "$PROD_DB_USER" \
  -d "$PROD_DB_NAME" \
  --format=custom \
  --no-owner \
  | docker exec -i "$STAGING_CONTAINER" pg_restore \
      -U "$STAGING_DB_USER" \
      -d "$STAGING_DB_NAME" \
      --clean \
      --if-exists \
      --no-owner

echo "[$(date -Iseconds)] Staging database copy complete."
