---
name: debug-email-sync
description: "[debugging] Debug Email Sync - You are debugging Gmail sync issues in the email system."
argument-hint: Optional input or selection
---

# Debug Email Sync

You are debugging Gmail sync issues in the email system.

## TASK

Identify and fix problems with Gmail email synchronization.

## STEPS

1) Understand the issue:
   - Check error logs
   - Identify sync failures
   - Note which emails are affected
   - Check sync frequency

2) Review email sync code:
   - Check `server/email-monitor.ts`
   - Review `server/email-*.ts` files
   - Check Gmail API integration
   - Review sync logic

3) Check Gmail API:
   - Verify OAuth tokens are valid
   - Check API quota usage
   - Review rate limiting
   - Test API connectivity

4) Check database:
   - Verify email storage
   - Check for duplicates
   - Review sync state
   - Check for data corruption

5) Test the fix:
   - Trigger manual sync
   - Verify emails sync correctly
   - Check error handling
   - Monitor for issues

## OUTPUT

Provide:
- Issue identified
- Root cause
- Fix implemented
- Files modified
- Test results
- Prevention measures

