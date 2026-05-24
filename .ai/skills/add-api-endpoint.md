# Skill: Add a New API Endpoint

## When to Use

When adding a new capability to the backend that needs to be exposed to the frontend or external callers.

## Steps

### 1. Define DTOs in Contracts

Add request/response DTOs to `<Module>.Contracts/DTOs/`. Use `record` or `class` with properties.

### 2. Define Service Interface

Add or update an interface in `<Module>.Contracts/Services/` (or directly in the project if no interface folder exists).

### 3. Implement in Application

Implement the logic in `<Module>.Application/Services/`.

### 4. Create/Update Controller

In `<Module>.Api/Controllers/v1/`, add a new action method to an existing controller or create a new one.

- Use `[ProducesResponseType]` for all outcomes (200, 201, 204, 400, 404).
- Inject the application service.

### 5. Update Swagger / API Client

Follow the `.ai/skills/update-openapi-client.md` skill to regenerate the frontend client.

## Validation Checklist

- [ ] Controller action has `[ProducesResponseType]` for all possible status codes
- [ ] Logic is in the Application service, not the Controller
- [ ] DTOs are defined in the Contracts project
- [ ] Frontend client regenerated and verified
