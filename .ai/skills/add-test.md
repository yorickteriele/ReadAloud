# Skill: Add a Test

## When to Use

When adding new logic or fixing a bug. Every significant change should have an accompanying test.

## Steps

### 1. Identify the Target Project

- Backend logic: `<Module>.Tests`
- Frontend components/logic: `src/frontend/src/modules/<module>/__tests__` (if exists) or sibling `.test.tsx` files.

### 2. Backend (NUnit + Moq)

- Create a new test class or add to an existing one.
- Mock dependencies using `new Mock<IService>()`.
- Use `Assert.That(actual, Is.EqualTo(expected))`.

### 3. Run Tests

```bash
# Backend
dotnet test src/ReadAloud.slnx

# Frontend
cd src/frontend && npm test
```

## Validation Checklist

- [ ] Test covers the new logic or the bug fix
- [ ] Test follows the naming convention `Method_ExpectedBehavior_State`
- [ ] All tests pass
