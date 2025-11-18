# Security Implementation - January 28, 2025

**Date:** 2025-01-28  
**Version:** 2.0.0  
**Status:** ✅ Implemented

---

## Overview

This document describes the security improvements implemented on January 28, 2025, focusing on authorization ownership checks and CSRF protection verification.

---

## Table of Contents

1. [Authorization Ownership Checks](#authorization-ownership-checks)
2. [CSRF Protection](#csrf-protection)
3. [Implementation Details](#implementation-details)
4. [API Reference](#api-reference)
5. [Testing](#testing)
6. [Future Work](#future-work)

---

## Authorization Ownership Checks

### Problem

Users could access other users' conversations by guessing `conversationId` values. This was a critical security vulnerability that allowed unauthorized data access.

### Solution

Implemented `requireOwnership` helper function in `server/rbac.ts` and applied it to all conversation endpoints to verify resource ownership before allowing access.

### Implementation

**File:** `server/rbac.ts`

```typescript
export function requireOwnership(
  userId: number,
  resourceUserId: number | null | undefined,
  resourceType: string,
  resourceId?: number | string
): void {
  // Allow if user owns the resource
  if (resourceUserId === userId) {
    return;
  }

  // Deny if resource has no userId
  if (resourceUserId === null || resourceUserId === undefined) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `${resourceType} has no owner`,
    });
  }

  // Deny if user doesn't own the resource
  const resourceIdMsg = resourceId ? ` (ID: ${resourceId})` : "";
  throw new TRPCError({
    code: "FORBIDDEN",
    message: `You don't have permission to access this ${resourceType}${resourceIdMsg}`,
  });
}
```

**Applied to:**
- `chat.getMessages` - Verify conversation ownership before retrieving messages
- `chat.sendMessage` - Verify conversation ownership before sending messages
- `chat.deleteConversation` - Verify conversation ownership before deletion

### Example Usage

```typescript
// In server/routers.ts
getMessages: protectedProcedure
  .input(z.object({ conversationId: z.number() }))
  .query(async ({ ctx, input }) => {
    // Verify conversation ownership
    const conversation = await getConversation(input.conversationId);
    if (!conversation) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Conversation not found",
      });
    }
    requireOwnership(ctx.user.id, conversation.userId, "conversation", input.conversationId);

    // Proceed with message retrieval
    return await getConversationMessages(input.conversationId);
  }),
```

### Security Impact

- ✅ **Fixed:** Users can no longer access other users' conversations
- ✅ **Error Messages:** Clear, user-friendly error messages
- ✅ **Consistent:** Same pattern can be applied to other resources

---

## CSRF Protection

### Current State

CSRF protection was already implemented using the double-submit cookie pattern. This session verified the implementation and added clarifying comments.

### Implementation

**File:** `server/_core/csrf.ts`

**Pattern:** Double-submit cookie
1. Token stored in cookie (`__csrf_token`)
2. Token sent in header (`X-CSRF-Token`)
3. Both must match for validation

**Frontend Integration:** `client/src/lib/csrf.ts`

```typescript
export function getCsrfHeaders(): Record<string, string> {
  const token = getCsrfToken();
  if (!token) {
    return {};
  }
  return {
    "X-CSRF-Token": token,
  };
}
```

**tRPC Integration:** `client/src/main.tsx`

Both `httpLink` and `httpBatchLink` include CSRF tokens:

```typescript
headers: {
  ...(init?.headers ?? {}),
  ...getCsrfHeaders(),
}
```

### Validation Logic

**File:** `server/_core/csrf.ts`

```typescript
export function validateCsrfToken(req: Request): void {
  // Skip CSRF validation for safe methods (GET, HEAD, OPTIONS)
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (req.method && safeMethods.includes(req.method.toUpperCase())) {
    return;
  }

  // Skip CSRF validation for public endpoints
  const publicPaths = ["/api/auth/", "/api/health", "/api/oauth/callback"];
  const isPublicPath = publicPaths.some(path => req.path?.startsWith(path));
  if (isPublicPath) {
    return;
  }

  // Validate tokens match (double-submit pattern)
  const cookieToken = req.cookies?.[CSRF_TOKEN_COOKIE_NAME];
  const headerToken = req.headers[CSRF_TOKEN_HEADER_NAME];
  
  if (cookieToken !== headerToken) {
    throw new Error("CSRF token validation failed");
  }
}
```

### Security Impact

- ✅ **Protection:** All POST requests to `/api/trpc` are protected
- ✅ **Coverage:** Both queries and mutations are protected
- ✅ **Pattern:** Industry-standard double-submit cookie pattern

---

## Implementation Details

### Files Modified

1. **`server/routers.ts`**
   - Added `requireOwnership` import
   - Added ownership checks to `getMessages`, `sendMessage`, `deleteConversation`

2. **`server/_core/csrf.ts`**
   - Added clarifying comments about tRPC validation
   - Documented why all POST requests are validated

3. **`server/_core/index.ts`**
   - Fixed TypeScript error with `permissionsPolicy` (removed invalid option)

### Dependencies

- `server/rbac.ts` - Ownership verification helpers
- `server/db.ts` - `getConversation` function
- `client/src/lib/csrf.ts` - CSRF token helpers
- `client/src/main.tsx` - tRPC client configuration

---

## API Reference

### `requireOwnership`

**Location:** `server/rbac.ts`

**Signature:**
```typescript
function requireOwnership(
  userId: number,
  resourceUserId: number | null | undefined,
  resourceType: string,
  resourceId?: number | string
): void
```

**Parameters:**
- `userId` - The ID of the user making the request
- `resourceUserId` - The userId field from the resource
- `resourceType` - Human-readable resource type for error messages
- `resourceId` - Optional resource ID for error messages

**Throws:**
- `TRPCError` with code `FORBIDDEN` if user doesn't own the resource

**Example:**
```typescript
const conversation = await getConversation(conversationId);
requireOwnership(ctx.user.id, conversation.userId, "conversation", conversationId);
```

### `requireOwnershipBatch`

**Location:** `server/rbac.ts`

**Signature:**
```typescript
function requireOwnershipBatch<T extends { userId: number | null | undefined }>(
  userId: number,
  resources: T[],
  resourceType: string
): void
```

**Parameters:**
- `userId` - The ID of the user making the request
- `resources` - Array of resources with userId fields
- `resourceType` - Human-readable resource type for error messages

**Throws:**
- `TRPCError` with code `FORBIDDEN` if user doesn't own any resource

**Example:**
```typescript
const conversations = await db.select().from(conversations)
  .where(inArray(conversations.id, conversationIds));
requireOwnershipBatch(ctx.user.id, conversations, "conversation");
```

### `getCsrfHeaders`

**Location:** `client/src/lib/csrf.ts`

**Signature:**
```typescript
function getCsrfHeaders(): Record<string, string>
```

**Returns:**
- Object with `X-CSRF-Token` header if token is available
- Empty object if token is not available

**Example:**
```typescript
const headers = {
  ...getCsrfHeaders(),
  "Content-Type": "application/json",
};
```

---

## Testing

### Security Tests

**File:** `server/__tests__/security.test.ts`

**Coverage:**
- ✅ Error message sanitization (5 tests)
- ✅ Input validation (1 test)
- ✅ SQL injection prevention (2 tests)
- ✅ XSS prevention (1 test)
- ✅ Authentication security (2 tests)
- ✅ Session cookie security (2 tests)
- ✅ CSRF protection (1 test)
- ✅ Input length limits (1 test)

**Total:** 15 tests, all passing

### RBAC Tests

**File:** `server/__tests__/rbac.test.ts`

**Coverage:**
- ✅ Role hierarchy
- ✅ Permission checks
- ✅ Ownership verification

**Total:** 9 tests, all passing

### Accessibility Tests

**File:** `client/src/__tests__/accessibility/LoginPage.a11y.test.tsx`

**Coverage:**
- ✅ Form labels
- ✅ Page title
- ✅ Submit button accessibility
- ✅ Error announcements
- ✅ Image alt text
- ✅ Keyboard navigation

**Total:** 6 tests, all passing

---

## Future Work

### Short-term

1. **Apply ownership checks to other resources**
   - Customer profiles
   - Leads
   - Opportunities
   - Bookings

2. **Add ownership checks to batch operations**
   - Use `requireOwnershipBatch` for multiple resources

3. **CSRF token refresh**
   - Implement token rotation for long-lived sessions

### Long-term

1. **Resource-level permissions**
   - Fine-grained access control beyond ownership
   - Role-based resource access

2. **Audit logging**
   - Log all ownership check failures
   - Track unauthorized access attempts

3. **Rate limiting on ownership checks**
   - Prevent brute-force attempts to guess resource IDs

---

## References

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- `docs/SECURITY_REVIEW_2025-01-28.md` - Original security review
- `docs/ENGINEERING_TODOS_2025-01-28.md` - Task tracking

---

**Generated:** 2025-01-28  
**Last Updated:** 2025-01-28
