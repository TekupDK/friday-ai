# Setup Billy Integration

You are setting up or extending Billy.dk accounting integration.

## TASK

Add or modify Billy.dk API integration functionality.

## STEPS

1. Review existing Billy integration:
   - Check `server/billy.ts` and `server/billy-*.ts` files
   - Understand current API usage patterns
   - Review authentication and rate limiting
2. Implement new functionality:
   - Use existing Billy API client helpers
   - Follow existing error handling patterns
   - Handle rate limits appropriately
3. Add tRPC procedures if needed:
   - Create procedures for Billy operations
   - Use `protectedProcedure` for authenticated endpoints
   - Return properly typed responses
4. Handle sync operations:
   - Implement sync logic if syncing data
   - Handle conflicts and errors
   - Add logging for sync operations
5. Test the integration:
   - Test with Billy API (sandbox if available)
   - Verify error handling
   - Test rate limiting behavior

## OUTPUT

Provide:

- Integration implementation
- tRPC procedures (if added)
- Error handling strategy
- Test results
