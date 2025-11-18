# Setup Google Integration

You are setting up a new Google Workspace integration.

## TASK

Add a new Google API integration (Gmail, Calendar, Drive, etc.).

## STEPS

1) Review existing integrations in `server/integrations/google/`:
   - Follow existing patterns
   - Use `server/google-api.ts` helpers
2) Set up OAuth scopes:
   - Add required scopes to OAuth config
   - Update `server/_core/oauth.ts` if needed
3) Implement API client:
   - Use `googleapis` library
   - Create service class or helper functions
   - Handle rate limiting (Gmail has strict limits)
   - Implement error handling and retries
4) Add to tRPC router:
   - Create procedures for integration operations
   - Use `protectedProcedure` with OAuth checks
   - Handle token refresh automatically
5) Add error handling:
   - Handle rate limit errors (429)
   - Handle quota exceeded errors
   - Implement exponential backoff
6) Test the integration:
   - Test with real Google account
   - Verify OAuth flow
   - Test error scenarios

## OUTPUT

Provide:
- Integration implementation
- OAuth scope configuration
- tRPC procedures added
- Error handling strategy
- Test results

