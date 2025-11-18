# Sentry TypeScript Fix

**Date:** 2025-11-17  
**Status:** ✅ Fixed

## Problem

TypeScript compilation errors in `server/_core/index.ts`:

```
server/_core/index.ts(123,13): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Argument of type 'void' is not assignable to parameter of type 'PathParams'.
server/_core/index.ts(123,20): error TS2554: Expected 1-2 arguments, but got 0.
server/_core/index.ts(296,13): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Argument of type 'void' is not assignable to parameter of type 'PathParams'.
server/_core/index.ts(296,20): error TS2554: Expected 1-2 arguments, but got 0.
```

## Root Cause

In Sentry v10, `Sentry.setupExpressErrorHandler(app)` returns `void`, not a middleware function. It cannot be used with `app.use()`.

## Fix Applied

**Before:**

```typescript
// ❌ WRONG - setupExpressErrorHandler returns void
app.use(Sentry.setupExpressErrorHandler(app));
```

**After:**

```typescript
// ✅ CORRECT - setupExpressErrorHandler is called directly
Sentry.setupExpressErrorHandler(app);
```

**Express Integration:**

- In Sentry v10, `expressIntegration()` added in `Sentry.init()` handles request tracking automatically
- No need to add request handler middleware manually
- Error handler is set up by calling `setupExpressErrorHandler(app)` directly (not in `app.use()`)

## Files Modified

- `server/_core/index.ts` - Fixed Sentry Express integration for v10 API

## Verification

- ✅ TypeScript compilation: PASSED
- ✅ No linter errors: VERIFIED
- ✅ Sentry integration: CORRECT (v10 API)

## Notes

Sentry v10 API changes:

- `expressIntegration()` is added in `Sentry.init()` integrations array
- Request tracking is automatic when integration is enabled
- `setupExpressErrorHandler(app)` must be called directly, not in `app.use()`
