#!/usr/bin/env bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Starting database reset...${NC}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

if ! command -v dotnet &> /dev/null; then
    echo -e "${RED}Error: dotnet is not installed.${NC}"
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: psql is not installed.${NC}"
    exit 1
fi

read_env_value() {
    local key="$1"
    local default_value="$2"

    if [ -f .env ]; then
        local value
        value=$(grep "^${key}=" .env | tail -n 1 | cut -d '=' -f 2- || true)
        if [ -n "$value" ]; then
            printf '%s' "$value"
            return
        fi
    fi

    printf '%s' "$default_value"
}

DB_HOST=$(read_env_value "DB_HOST" "localhost")
DB_PORT=$(read_env_value "DB_PORT" "5432")
DB_USER=$(read_env_value "DB_USER" "postgres")
DB_PASSWORD=$(read_env_value "DB_PASSWORD" "postgres")
DB_NAME=$(read_env_value "DB_NAME" "ReadAloudDb")

export PGPASSWORD="$DB_PASSWORD"
export ConnectionStrings__DefaultConnection="Host=$DB_HOST;Port=$DB_PORT;Database=$DB_NAME;Username=$DB_USER;Password=$DB_PASSWORD;"

echo -e "${BLUE}Resetting database '$DB_NAME' on $DB_HOST:$DB_PORT...${NC}"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres \
    -v ON_ERROR_STOP=1 \
    -v db_name="$DB_NAME" \
    -v db_user="$DB_USER" <<'SQL'
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = :'db_name'
  AND pid <> pg_backend_pid();

DROP DATABASE IF EXISTS :"db_name";
CREATE DATABASE :"db_name" OWNER :"db_user";
SQL

echo -e "${GREEN}Database reset successfully!${NC}"

echo -e "${BLUE}Applying migrations...${NC}"
dotnet build src/backend/MigrationRunner/MigrationRunner.csproj -c Debug
dotnet run --project src/backend/MigrationRunner/MigrationRunner.csproj

echo -e "${GREEN}Database reset and migrations applied successfully!${NC}"
