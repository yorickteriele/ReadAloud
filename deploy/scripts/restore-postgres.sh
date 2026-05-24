#!/usr/bin/env bash
# Restores a PostgreSQL custom-format dump into the selected Dokploy PostgreSQL service.
# Usage: /opt/readaloud/restore-postgres.sh /mnt/HC_Volume/backups/postgres/ReadAloudDb_YYYYmmdd_HHMMSS.dump

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <backup.dump>" >&2
  exit 1
fi

BACKUP_FILE="$1"
POSTGRES_SERVICE="${POSTGRES_SERVICE:-}"
DB_NAME="${DB_NAME:-ReadAloudDb}"
DB_USER="${DB_USER:-postgres}"

if [[ -z "$POSTGRES_SERVICE" ]]; then
  echo "ERROR: POSTGRES_SERVICE must be set (Dokploy-assigned container name, e.g. readaloud-postgres-xxxxxxx)" >&2
  exit 1
fi

if [[ ! -f "$BACKUP_FILE" ]]; then
  echo "ERROR: backup file does not exist: $BACKUP_FILE" >&2
  exit 1
fi

resolve_container() {
  local service="$1"
  docker ps --format '{{.Names}}' \
    | awk -v service="$service" '$0 == service || index($0, service ".") == 1 { print; exit }'
}

CONTAINER="$(resolve_container "$POSTGRES_SERVICE")"
if [[ -z "$CONTAINER" ]]; then
  echo "ERROR: no running container found for service '$POSTGRES_SERVICE'" >&2
  exit 1
fi

echo "[$(date -Iseconds)] Restoring $BACKUP_FILE into $DB_NAME on $CONTAINER..."

docker cp "$BACKUP_FILE" "$CONTAINER:/tmp/readaloud-restore.dump"
docker exec "$CONTAINER" psql -U "$DB_USER" -d postgres -v ON_ERROR_STOP=1 \
  -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();"
docker exec "$CONTAINER" pg_restore \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --clean \
  --if-exists \
  --no-owner \
  /tmp/readaloud-restore.dump
docker exec "$CONTAINER" rm -f /tmp/readaloud-restore.dump

echo "[$(date -Iseconds)] Restore complete."
