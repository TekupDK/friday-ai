# Handle AI Rate Limits

You are fixing rate limiting issues with AI/LLM API calls.

## TASK

Identify and resolve rate limiting problems with AI model APIs.

## STEPS

1) Identify the rate limit:
   - Check error messages (429 errors)
   - Identify which model/provider
   - Check rate limit headers
   - Review API documentation

2) Review current implementation:
   - Check `server/model-router.ts`
   - Review retry logic
   - Check rate limiting handling
   - Look for burst patterns

3) Implement fixes:
   - Add exponential backoff
   - Implement request queuing
   - Add rate limit tracking
   - Distribute requests over time
   - Use multiple API keys if available

4) Add monitoring:
   - Log rate limit events
   - Track retry attempts
   - Monitor queue depth
   - Alert on high usage

5) Test the fix:
   - Test with realistic load
   - Verify retries work
   - Check queue behavior
   - Ensure no data loss

## OUTPUT

Provide:
- Rate limit issue identified
- Fixes implemented
- Retry/queue logic added
- Monitoring improvements
- Test results

