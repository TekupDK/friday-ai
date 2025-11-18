# Refactor to tRPC

You are refactoring REST endpoints to tRPC procedures.

## TASK

Convert existing REST API endpoints to tRPC procedures.

## STEPS

1) Identify REST endpoints to convert:
   - Check `server/routes/` or Express routes
   - Review API usage in frontend
   - Identify endpoints that should be tRPC
2) Create tRPC procedures:
   - Define input schema with Zod
   - Implement procedure logic
   - Maintain same functionality
   - Use `protectedProcedure` or `publicProcedure` appropriately
3) Update frontend:
   - Replace fetch/axios calls with tRPC hooks
   - Update error handling
   - Update loading states
   - Remove old API client code
4) Update types:
   - Remove manual TypeScript types if now inferred
   - Use tRPC type inference
5) Test the migration:
   - Verify functionality works the same
   - Test error cases
   - Verify type safety
6) Clean up:
   - Remove old REST endpoint code
   - Remove unused API client code
   - Update documentation

## OUTPUT

Provide:
- tRPC procedures created
- Frontend migration changes
- Old code removed
- Test results

