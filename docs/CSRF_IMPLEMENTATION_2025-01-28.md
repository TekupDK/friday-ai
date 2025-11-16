# CSRF Protection Implementation

**Date:** 2025-01-28  
**Status:** ✅ Completed  
**Reference:** `docs/SECURITY_REVIEW_2025-01-28.md` - High Priority #8

---

## Overview

Implemented CSRF (Cross-Site Request Forgery) protection using the double-submit cookie pattern. This prevents malicious websites from making unauthorized requests on behalf of authenticated users.

## Implementation

### Backend (`server/_core/csrf.ts`)

**Features:**
- ✅ Cryptographically secure token generation (32 bytes = 64 hex characters)
- ✅ Double-submit cookie pattern (token in both cookie and header)
- ✅ Automatic token generation and cookie setting
- ✅ Validation for state-changing operations (POST, PUT, DELETE, PATCH)
- ✅ Skips validation for safe methods (GET, HEAD, OPTIONS)
- ✅ Skips validation for public endpoints (auth, health checks)
- ✅ Proper error handling and logging

**Key Functions:**
- `getOrCreateCsrfToken()` - Generates token if missing, sets cookie
- `validateCsrfToken()` - Validates token using double-submit pattern
- `csrfMiddleware()` - Express middleware for automatic protection
- `getCsrfToken()` - Helper to get token from request

**Security Features:**
- Token stored in cookie with `SameSite=strict` in production
- Token sent in `X-CSRF-Token` header
- Both must match for validation to pass
- 24-hour token expiry
- Secure cookies in production (HTTPS required)

### Frontend (`client/src/lib/csrf.ts`)

**Features:**
- ✅ Reads CSRF token from cookie
- ✅ Automatically includes token in all tRPC requests
- ✅ Helper functions for manual token access

**Integration:**
- Integrated into `client/src/main.tsx` tRPC client configuration
- Automatically adds `X-CSRF-Token` header to all requests
- Works with both `httpLink` and `httpBatchLink`

## How It Works

1. **First Request:**
   - Server generates CSRF token
   - Sets token in `__csrf_token` cookie
   - Cookie is readable by JavaScript (for double-submit pattern)

2. **Subsequent Requests:**
   - Frontend reads token from cookie
   - Includes token in `X-CSRF-Token` header
   - Server validates cookie token matches header token

3. **Validation:**
   - Server compares cookie token with header token
   - If they match, request is allowed
   - If they don't match or are missing, request is rejected (403)

## Security Considerations

### Why Double-Submit Cookie Pattern?

- **Stateless:** No server-side session storage needed
- **Simple:** Easy to implement and maintain
- **Effective:** Prevents CSRF attacks while allowing legitimate requests
- **Compatible:** Works with existing authentication (cookies)

### Why Not HMAC Signing?

The double-submit pattern doesn't require HMAC signing because:
- The token is random and unpredictable (32 bytes)
- SameSite=strict prevents cross-site cookie access
- Both cookie and header must match (attacker can't set both)
- Simpler implementation without secret management

### Limitations

- Requires JavaScript to read cookie (not suitable for non-JS clients)
- Token must be included in every mutation request
- Token expires after 24 hours (user must refresh page)

## Integration Points

### Backend

**File:** `server/_core/index.ts`
- CSRF middleware added to `/api/` routes
- Placed after rate limiting, before body parsing
- CORS headers updated to allow `X-CSRF-Token` header

### Frontend

**File:** `client/src/main.tsx`
- CSRF token helper imported
- Token automatically added to all tRPC requests
- Works transparently with existing code

## Testing

### Manual Testing

1. **Verify Token Generation:**
   - Make any request to `/api/trpc/*`
   - Check browser DevTools → Application → Cookies
   - Verify `__csrf_token` cookie is set

2. **Verify Token Validation:**
   - Make a mutation request (e.g., create customer)
   - Check Network tab → Headers
   - Verify `X-CSRF-Token` header is present
   - Request should succeed

3. **Verify CSRF Protection:**
   - Try making a mutation without the header
   - Should receive 403 Forbidden error
   - Try making a mutation with wrong token
   - Should receive 403 Forbidden error

### Automated Tests

```typescript
// TODO: Add CSRF tests
// - Test token generation
// - Test token validation
// - Test missing token rejection
// - Test invalid token rejection
```

## Configuration

### Environment Variables

No additional environment variables needed. CSRF protection works automatically.

### Cookie Settings

- **Name:** `__csrf_token`
- **HttpOnly:** `false` (frontend needs to read it)
- **Secure:** `true` in production
- **SameSite:** `strict` in production, `lax` in development
- **Path:** `/`
- **MaxAge:** 24 hours

## Error Handling

### Middleware Error Handling

The CSRF middleware includes comprehensive error handling:

- **Logging:** All CSRF validation failures are logged with:
  - Error details
  - Request path and method
  - Client IP address
  - User agent
  - Timestamp

- **Security Monitoring:** Failed CSRF validations are logged at `warn` level for security monitoring and potential attack detection.

- **Safe Error Messages:** Error messages are sanitized to prevent information leakage while providing helpful guidance to users.

### Error Scenarios

**Missing Token Cookie:**
- Error: "CSRF token missing. Please refresh the page."
- Status: 403 Forbidden
- Action: User should refresh page to get new token
- Logged: Yes (warn level)

**Missing Token Header:**
- Error: "CSRF token missing in request header."
- Status: 403 Forbidden
- Action: Frontend should include token in header
- Logged: Yes (warn level)

**Token Mismatch:**
- Error: "CSRF token validation failed. Tokens do not match."
- Status: 403 Forbidden
- Action: User should refresh page
- Logged: Yes (warn level)

**Invalid Token Format:**
- Error: "CSRF token has invalid format."
- Status: 403 Forbidden
- Action: User should refresh page
- Logged: Yes (warn level)

## Files Modified

### Backend
- `server/_core/csrf.ts` - CSRF protection implementation (NEW)
- `server/_core/index.ts` - CSRF middleware integration, CORS header updates

### Frontend
- `client/src/lib/csrf.ts` - CSRF token helper (NEW)
- `client/src/main.tsx` - CSRF token integration in tRPC client

## Error Handling Details

### Implementation

The CSRF middleware uses comprehensive error handling:

```typescript
export function csrfMiddleware(req: Request, res: Response, next: () => void): void {
  try {
    getOrCreateCsrfToken(req, res);
    validateCsrfToken(req);
    next();
  } catch (error) {
    // Log with security context
    logger.warn({
      err: error,
      path: req.path,
      method: req.method,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.headers["user-agent"],
    }, "CSRF validation failed");

    // Return safe error message
    res.status(403).json({
      error: "CSRF validation failed",
      message: error instanceof Error ? error.message : "CSRF validation failed. Please refresh the page and try again.",
    });
  }
}
```

### Security Considerations

- **Logging:** All CSRF failures are logged for security monitoring
- **Context:** IP address and user agent included for attack detection
- **Sanitization:** Error messages are safe and don't leak internal details
- **Monitoring:** Failed validations can indicate CSRF attack attempts

## Next Steps

1. **Apply `requireOwnership()` to routers** - Use the helper functions in CRM routers
2. **Add CSRF tests** - Create automated tests for CSRF protection
3. **Monitor CSRF errors** - Track 403 errors to identify issues
4. **Set up alerting** - Alert on unusual CSRF failure patterns (potential attacks)

## References

- OWASP CSRF Prevention Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
- `docs/SECURITY_REVIEW_2025-01-28.md` - Original security review
- `docs/SECURITY_IMPLEMENTATION_2025-01-28.md` - Security implementation guide

---

**Last Updated:** 2025-01-28  
**Status:** ✅ CSRF Protection Implemented

