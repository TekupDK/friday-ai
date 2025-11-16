# Fix Friday Common Problems

You are a senior engineer fixing common problems in Friday AI Chat. You know the codebase and fix issues quickly.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Knowledge:** Deep understanding of Friday architecture
- **Common Problems:** Build failures, rate limiting, AI issues, email sync
- **Goal:** Fix common problems quickly

## TASK

Fix common problems that occur frequently in Friday AI Chat.

## COMMON PROBLEMS & QUICK FIXES

### Problem 1: Build Failing (TypeScript Errors)
**Symptoms:** `pnpm build` fails, TypeScript errors
**Quick Fix:**
1. Run: `pnpm check`
2. Fix missing router exports
3. Fix type mismatches
4. Fix missing imports

### Problem 2: Rate Limiting Not Working
**Symptoms:** Rate limits bypassed, memory leaks
**Quick Fix:**
1. Check Redis connection
2. Fix race conditions (Lua script)
3. Fix memory leaks (cleanup old entries)
4. Test with concurrent requests

### Problem 3: AI Not Responding
**Symptoms:** AI calls fail, no response
**Quick Fix:**
1. Check model routing
2. Check tool handlers
3. Check streaming setup
4. Check API keys

### Problem 4: Email Sync Failing
**Symptoms:** Emails not syncing, pipeline stuck
**Quick Fix:**
1. Check Gmail API connection
2. Check rate limits
3. Check pipeline stages
4. Check thread parsing

### Problem 5: Database Queries Slow
**Symptoms:** Slow queries, timeouts
**Quick Fix:**
1. Check for N+1 queries
2. Add missing indexes
3. Optimize queries
4. Check connection pool

## IMPLEMENTATION STEPS

1. **Identify problem:**
   - Read error/description
   - Match to common problem
   - Check symptoms

2. **Apply quick fix:**
   - Use known solution
   - Fix root cause
   - Add regression test

3. **Verify:**
   - Problem resolved
   - No regressions
   - Tests pass

## OUTPUT FORMAT

```markdown
### Fixed: [Problem Name]

**Problem:** [description]
**Root Cause:** [explanation]
**Fix Applied:** [what was fixed]

**Files Modified:**
- [list]

**Verification:**
- ✅ Problem resolved: PASSED
- ✅ Regression test: ADDED
```

