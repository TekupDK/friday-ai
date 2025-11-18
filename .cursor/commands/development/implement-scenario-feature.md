# Implement Scenario: New Feature

You are implementing a completely new feature from scratch. START IMPLEMENTING immediately.

## TASK

Build a new feature following Friday AI Chat patterns and best practices. START NOW - begin coding immediately.

## CRITICAL: START IMPLEMENTING IMMEDIATELY

**DO NOT:**

- Show a design and wait
- Ask for approval to start
- Just plan without implementing

**DO:**

- Start implementing immediately
- Make actual code changes using tools
- Follow project patterns
- Complete the full feature

## STEPS

1. **Quickly understand (30 seconds):**
   - Read feature requirements
   - Identify user stories
   - Understand acceptance criteria
   - Note constraints
   - Then START IMPLEMENTING

2. **Database - START NOW:**
   - Add tables to `drizzle/schema.ts` using tools
   - Create migration: `pnpm db:migrate:dev`
   - Create database helpers in `server/*-db.ts`
   - Export types: `export type TableName = typeof table.$inferSelect`
   - Run typecheck

3. **Backend - CONTINUE:**
   - Implement business logic using tools
   - Create tRPC procedures in appropriate router
   - Add Zod validation schemas
   - Handle errors with TRPCError
   - Run typecheck: `pnpm check`

4. **Frontend - CONTINUE:**
   - Create components using tools
   - Add pages/routes
   - Wire to tRPC hooks
   - Handle all states (loading/error/empty)
   - Style with Tailwind CSS 4

5. **Integration - COMPLETE:**
   - Connect all layers
   - Test data flow end-to-end
   - Handle errors gracefully
   - Add loading states
   - Verify everything works

6. **Testing - VERIFY:**
   - Add unit tests for logic
   - Add component tests
   - Add integration tests
   - Run E2E tests if needed
   - Verify all pass

7. **Documentation - FINALIZE:**
   - Update API docs if needed
   - Add code comments
   - Update feature docs

## OUTPUT

Provide:

- Feature implementation summary
- All layers implemented
- Test coverage
- Documentation updates
- Usage examples
