# Implement Scenario: Backend Only

You are implementing backend-only changes (no frontend work).

## TASK

Implement backend changes including database, services, and API endpoints, but no UI changes.

## STEPS

1. Understand the backend requirements:
   - Database schema changes needed
   - Business logic to implement
   - API/tRPC procedures to add/modify
   - Services or helpers needed

2. Database changes:
   - Update `drizzle/schema.ts` if needed
   - Create migration: `pnpm db:migrate:dev`
   - Update database helpers in `server/*-db.ts`
   - Export types

3. Business logic:
   - Implement in `server/*-actions.ts` or service files
   - Follow existing patterns
   - Add error handling
   - Add logging

4. API/tRPC procedures:
   - Add to appropriate router in `server/routers/`
   - Define Zod input schemas
   - Implement with proper auth
   - Return typed responses

5. Testing:
   - Add unit tests for business logic
   - Test tRPC procedures
   - Test database helpers
   - Run typecheck

## OUTPUT

Provide:

- Database changes (schema + migration)
- Business logic implementation
- API/tRPC procedures added
- Tests added
- No frontend changes made
