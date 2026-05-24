# Gemini CLI Instructions

## Canonical Reference

**`AGENTS.md` is the canonical source of truth** for architecture, conventions, commands, and constraints. Read it before making any changes.

## Task-Specific Playbooks

Before executing a recurring workflow, read the relevant skill file under `.ai/skills/`:

| Task | Skill |
|---|---|
| Create a new module | `.ai/skills/create-module.md` |
| Add an EF Core migration | `.ai/skills/add-ef-migration.md` |
| Add a new API endpoint | `.ai/skills/add-api-endpoint.md` |
| Update OpenAPI / TypeScript clients | `.ai/skills/update-openapi-client.md` |
| Write tests | `.ai/skills/add-test.md` |

## Gemini-Specific Notes

- The solution uses `.slnx` format — use `src/ReadAloud.slnx` for all `dotnet` CLI commands.
- EF Core migrations must always be generated with `dotnet ef migrations add`. Never write migration files manually.
- Generated TypeScript clients are gitignored and auto-produced. Never edit them manually.
- Keep code simple and minimal — only add what the task requires.
