# Skill: Add an EF Core Migration

## When to Use

When a Domain entity is created or changed in a way that affects the database schema (add/remove/rename column or table, add index, change constraint type, change nullability).

## Core Rule

**Always generate migrations with `dotnet ef migrations add`. Never write migration files by hand.**

## Prerequisites

- `dotnet-ef` installed globally: `dotnet tool install --global dotnet-ef`
- `dotnet build src/ReadAloud.slnx` passes
- Local PostgreSQL running with `.env` connection string

## Steps

### 1. Make domain and DbContext changes first

Edit the entity in `<Module>.Domain/<Entity>.cs`. If adding a new entity, add a `DbSet<T>` to the DbContext and configure it in `OnModelCreating`.

### 2. Generate the migration

```bash
# From the repository root
dotnet ef migrations add YourMigrationName \
  --project src/backend/Modules/ReadAloud/ReadAloud.Infrastructure \
  --startup-project src/backend/Host
```

Replace:
- `YourMigrationName` with a PascalCase description of the change

### 3. Review the generated migration

Open `<Module>.Infrastructure/Migrations/<timestamp>_<Name>.cs`. Verify:
- `Up()` makes the correct changes
- `Down()` correctly reverts them

### 4. Apply locally and verify

```bash
cd src/backend/MigrationRunner && dotnet run
```

### 5. Commit migration + snapshot together

All three files must be committed:
- `<timestamp>_<Name>.cs`
- `<timestamp>_<Name>.Designer.cs`
- `ApplicationDbContextModelSnapshot.cs`

## Related Skills

- `.ai/skills/update-database-schema.md`
