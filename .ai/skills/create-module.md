# Skill: Create a New Backend Module

## When to Use

When adding a new bounded context to ReadAloud (a new feature domain with its own API surface).

## Steps

### 1. Run the scaffolding script

```bash
tools/create-backend-module.sh MyModuleName
```

`MyModuleName` must be PascalCase.

This creates:
- `src/backend/Modules/MyModuleName/{Api,Application,Contracts,Domain,Infrastructure,Tests}/`
- Registers projects in `src/ReadAloud.slnx`
- Adds a Host reference

### 2. Create the initial migration

```bash
dotnet ef migrations add Initial \
  --project src/backend/Modules/ReadAloud/MyModuleName.Infrastructure \
  --startup-project src/backend/Host
```

### 3. Verify everything builds and tests pass

```bash
dotnet build src/ReadAloud.slnx
dotnet test src/ReadAloud.slnx
```

## Related Skills

- `.ai/skills/add-ef-migration.md`
- `.ai/skills/add-api-endpoint.md`
