# 🔴 Critical Fixes - Setup Guide

**Date:** 2025-11-08
**Status:** Implementation Complete
**Priority:** HIGH

---

## ✅ **WHAT WAS FIXED**

### **1. Rate Limiting (Redis-based)** ✅

**Before:**

- In-memory rate limiting
- Lost on server restart
- No distributed support
- Memory leak potential

**After:**

- Redis-based rate limiting
- Persistent across restarts
- Distributed support
- Automatic cleanup
- Fallback to in-memory if Redis unavailable

**Files Changed:**

- ✅ Created: `server/rate-limiter-redis.ts`
- ✅ Updated: `server/routers.ts`

---

### **2. Input Validation** ✅

**Before:**

- No length limits
- DoS attack vector
- Potential high costs

**After:**

- Min: 1 character
- Max: 10,000 characters
- Clear error messages

**Files Changed:**

- ✅ Updated: `server/routers.ts` (line 93-95)

---

## 🚀 **SETUP INSTRUCTIONS**

### **Step 1: Install Redis Package**

````bash
pnpm add @upstash/redis

```text

---

### **Step 2: Setup Upstash Redis (Free Tier)**

1. Go to [<https://upstash.com/](https://upstash.com>/)
1. Sign up (free tier: 10,000 requests/day)
1. Create new Redis database
1. Copy credentials

---

### **Step 3: Add Environment Variables**

Add to `.env.dev` and `.env.prod`:

```bash
# Redis Rate Limiting (Upstash)
UPSTASH_REDIS_REST_URL=<https://your-redis-url.upstash.io>
UPSTASH_REDIS_REST_TOKEN=your-token-here

```text

---

### **Step 4: Test Rate Limiting**

```bash
# Start dev server
pnpm dev

# Test in browser console
# Send 11 messages quickly - 11th should be rate limited

```text

---

## 📋 **VERIFICATION CHECKLIST**

- [ ] `@upstash/redis` installed
- [ ] Environment variables added
- [ ] Server starts without errors
- [ ] Rate limiting works (test with 11 messages)
- [ ] Fallback works (test without Redis env vars)
- [ ] Input validation works (test with empty/long message)

---

## 🎯 **FEATURES**

### **Rate Limiting:**

- **Limit:** 10 messages per minute per user
- **Window:** Sliding window (60 seconds)
- **Storage:** Redis (persistent)
- **Fallback:** In-memory (if Redis unavailable)
- **Error Message:** Shows wait time

**Example Error:**

```text
Rate limit exceeded. Please wait 45s before sending more messages.

```text

---

### **Input Validation:**

- **Min Length:** 1 character
- **Max Length:** 10,000 characters
- **Validation:** Zod schema
- **Error Messages:** Clear and user-friendly

**Example Errors:**

```text
"Message cannot be empty"
"Message too long (max 10,000 characters)"

```text

---

## 🔧 **CONFIGURATION**

### **Adjust Rate Limits:**

Edit `server/routers.ts` (line 107-110):

```typescript
const rateLimit = await checkRateLimitUnified(ctx.user.id, {
  limit: 20, // Change limit
  windowMs: 120000, // Change window (2 minutes)
});

```text

---

### **Adjust Input Limits:**

Edit `server/routers.ts` (line 93-95):

```typescript
content: z.string()
  .min(1, "Message cannot be empty")
  .max(20000, "Message too long (max 20,000 characters)"), // Change max

```text

---

## 🧪 **TESTING**

### **Test Rate Limiting:**

```typescript
// In browser console or test file:
const sendMessages = async () => {
  for (let i = 0; i < 12; i++) {
    try {
      await sendMessage(`Test message ${i}`);
      console.log(`✅ Message ${i} sent`);
    } catch (error) {
      console.error(`❌ Message ${i} failed:`, error.message);
    }
  }
};

sendMessages();
// Expected: First 10 succeed, 11th and 12th fail with rate limit error

```text

---

### **Test Input Validation:**

```typescript
// Empty message
await sendMessage("");
// Expected: "Message cannot be empty"

// Too long message
await sendMessage("a".repeat(10001));
// Expected: "Message too long (max 10,000 characters)"

```text

---

## 📊 **MONITORING**

### **Redis Dashboard:**

- View rate limit data in Upstash dashboard
- Monitor request counts
- Check for abuse patterns

### **Logs:**

```bash
# Monitor rate limit events
pnpm logs | grep "Rate limit"

# Monitor validation errors
pnpm logs | grep "validation"

```text

---

## 🐛 **TROUBLESHOOTING**

### **Issue: Rate limiting not working**

**Solution:**

1. Check Redis env vars are set
1. Verify Upstash dashboard shows database
1. Check server logs for Redis connection errors
1. Fallback should work automatically

---

### **Issue: "Cannot find module '@upstash/redis'"**

**Solution:**

```bash
pnpm install
# or
pnpm add @upstash/redis

```text

---

### **Issue: Rate limit too strict**

**Solution:**
Adjust limits in `server/routers.ts`:

```typescript
limit: 20,        // Increase limit
windowMs: 120000, // Increase window

```text

---

## 🎯 **NEXT STEPS**

### **Completed:** ✅

- [x] Redis-based rate limiting
- [x] Input validation
- [x] Fallback mechanism
- [x] Better error messages

### **Recommended Next:**

1. **Message History Limit** - Prevent unbounded growth
1. **Pagination UI** - Add "Load More" button
1. **Caching** - Add Redis caching for responses
1. **Monitoring** - Add request logging middleware

---

## 📈 **IMPACT**

### **Before:**

- ❌ Rate limits reset on deploy
- ❌ No distributed support
- ❌ Memory leak potential
- ❌ No input validation
- ❌ DoS attack vector

### **After:**

- ✅ Persistent rate limiting
- ✅ Distributed support
- ✅ Automatic cleanup
- ✅ Input validation
- ✅ DoS protection
- ✅ Better error messages

---

## 🚀 **DEPLOYMENT**

### **Development:**

```bash
# Add env vars to .env.dev
pnpm dev

```text

### **Production:**

```bash
# Add env vars to .env.prod
pnpm build
pnpm start

````

---

## ✅ **SUCCESS CRITERIA**

- [x] Code implemented
- [ ] Package installed
- [ ] Env vars configured
- [ ] Tests passing
- [ ] Rate limiting works
- [ ] Input validation works
- [ ] Deployed to staging
- [ ] Monitored for 24h
- [ ] Deployed to production

---

## 📝 **NOTES**

**Redis Free Tier:**

- 10,000 requests/day
- 256 MB storage
- Enough for ~100 users

**Upgrade if needed:**

- Pay-as-you-go: $0.20 per 100K requests
- Pro: $10/month (1M requests)

**Alternative:**

- Use existing database for rate limiting
- Less performant but no extra cost

---

## 🎉 **DONE!**

Critical fixes implemented. Ready to install package and configure Redis.

**Next:** Run `pnpm add @upstash/redis` and configure env vars.
