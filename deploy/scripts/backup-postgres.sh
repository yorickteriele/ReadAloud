#!/usr/bin/env bash
# Backs up the production PostgreSQL database to the Hetzner volume.
# Cron: 0 3 * * * /opt/readaloud/backup-postgres.sh >> /var/log/readaloud-backup.log 2>&1

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/mnt/HC_Volume/backups/postgres}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
POSTGRES_SERVICE="${POSTGRES_SERVICE:-}"
KEEP_DAYS="${KEEP_DAYS:-14}"

DB_NAME="${DB_NAME:-ReadAloudDb}"
DB_USER="${DB_USER:-postgres}"

if [[ -z "$POSTGRES_SERVICE" ]]; then
  echo "ERROR: POSTGRES_SERVICE must be set (Dokploy-assigned container name, e.g. readaloud-postgres-xxxxxxx)" >&2
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

mkdir -p "$BACKUP_DIR"

echo "[$(date -Iseconds)] Starting backup of $DB_NAME from $CONTAINER..."

BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.dump"
docker exec "$CONTAINER" pg_dump \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --format=custom \
  --no-owner \
  --file=/tmp/readaloud-backup.dump
docker cp "$CONTAINER:/tmp/readaloud-backup.dump" "$BACKUP_FILE"
docker exec "$CONTAINER" rm -f /tmp/readaloud-backup.dump

SIZE="$(du -sh "$BACKUP_FILE" | cut -f1)"
echo "[$(date -Iseconds)] Backup written: $BACKUP_FILE ($SIZE)"

find "$BACKUP_DIR" -name "*.dump" -mtime "+${KEEP_DAYS}" -delete
REMAINING="$(find "$BACKUP_DIR" -name "*.dump" | wc -l)"
echo "[$(date -Iseconds)] Retention: keeping ${KEEP_DAYS} days (${REMAINING} backups remaining)"
