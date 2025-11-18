---
name: debug-rate-limiting
description: "[debugging] Debug Rate Limiting - You are debugging rate limiting issues."
argument-hint: Optional input or selection
---

# Debug Rate Limiting

You are debugging rate limiting issues.

## TASK

Identify and fix rate limiting problems in the application.

## STEPS

1) Identify the rate limit issue:
   - Check error logs for 429 errors
   - Identify which API/service is rate limiting
   - Review rate limit configuration
2) Review rate limit implementation:
   - Check `server/rate-limiter*.ts` files
   - Review Redis configuration if used
   - Check API-specific rate limits (Gmail, etc.)
3) Analyze the problem:
   - Determine if limits are too strict
   - Check for burst traffic patterns
   - Identify if retry logic is working
4) Implement fixes:
   - Adjust rate limit thresholds if appropriate
   - Implement exponential backoff
   - Add request queuing if needed
   - Improve caching to reduce API calls
5) Add monitoring:
   - Add logging for rate limit events
   - Track rate limit usage
   - Set up alerts for high usage
6) Test the fix:
   - Test with realistic load
   - Verify retry logic works
   - Check that limits are respected

## OUTPUT

Provide:
- Root cause analysis
- Fixes implemented
- Rate limit configuration changes
- Monitoring improvements
- Test results

