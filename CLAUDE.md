# Claude Code Instructions

## Canonical Reference

**`AGENTS.md` is the canonical source of truth** for architecture, conventions, commands, and constraints. Read it before making substantive changes to this repository.

## Claude-Specific Behavior

- Before starting a major workflow task (creating a module, adding a migration, updating API clients, adding endpoints, writing tests), read the relevant skill file under `.ai/skills/` for the step-by-step playbook.
- Keep changes simple and minimal. Only add what the task requires.
- Never hand-write EF Core migration files — always use `dotnet ef migrations add`.
- On the frontend, import types and enums from the nswag-generated clients rather than redefining them.
- Claude-specific overrides belong in this file, not in `AGENTS.md`.
