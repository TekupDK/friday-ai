# Fix Email Rate Limits

You are fixing Gmail API rate limiting issues.

## TASK

Resolve rate limiting problems with Gmail API calls.

## STEPS

1) Identify the rate limit:
   - Check for 429 errors
   - Review Gmail API quota
   - Check current usage
   - Identify burst patterns

2) Review email code:
   - Check `server/google-api.ts`
   - Review email fetching logic
   - Check batch operations
   - Look for inefficient patterns

3) Implement fixes:
   - Add exponential backoff
   - Implement request queuing
   - Batch operations efficiently
   - Add caching where possible
   - Distribute requests over time

4) Optimize API usage:
   - Reduce unnecessary calls
   - Use batch requests
   - Cache responses
   - Use webhooks if available

5) Add monitoring:
   - Track API usage
   - Log rate limit events
   - Alert on high usage
   - Monitor queue depth

6) Test the fix:
   - Test with realistic load
   - Verify retries work
   - Check queue behavior
   - Ensure no data loss

## OUTPUT

Provide:
- Rate limit issue identified
- Optimizations implemented
- Retry/queue logic added
- Monitoring improvements
- Test results

