# Skill: Update OpenAPI / TypeScript API Client

## When to Use

After any backend change to:
- A controller action (added, removed, renamed, route/method changed)
- A DTO in `*.Contracts/DTOs/`
- An enum in `*.Contracts/Enums/`
- A `[ProducesResponseType]` declaration

## Prerequisites

- `dotnet build src/ReadAloud.slnx` passes
- Node 20+ and frontend deps: `cd src/frontend && npm install`
- Local PostgreSQL running

## Steps

### 1. Start the backend

```bash
cd src/backend/Host && dotnet run
```

Wait until healthy:
```bash
curl -sf http://localhost:5001/health
```

### 2. Generate specs and TypeScript clients

```bash
cd src/frontend
npm run generate
```

This runs:
- `generate:openapi` — fetches `http://localhost:5001/swagger/readaloud/swagger.json`
- `generate:clients` — runs nswag on each spec

The generated file exports the `{Module}ApiClient` class and TypeScript interfaces for DTOs.

### 3. Use generated types in frontend code

Do not redefine types that now exist in the generated client. Import them:
```typescript
import type { UploadDocumentRequest } from './generated/api-client'
```

### 4. Verify no TypeScript errors

```bash
cd src/frontend && npm run build
```

## Related Skills

- `.ai/skills/add-api-endpoint.md`
