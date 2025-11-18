# API Reference - Security Endpoints

**Date:** 2025-01-28  
**Version:** 2.0.0  
**Auto-generated from codebase**

---

## Table of Contents

1. [Chat Endpoints](#chat-endpoints)
2. [Authorization Helpers](#authorization-helpers)
3. [CSRF Protection](#csrf-protection)
4. [Error Handling](#error-handling)

---

## Chat Endpoints

### `chat.getMessages`

Get messages for a conversation with ownership verification.

**Type:** Query (Protected)  
**Path:** `chat.getMessages`

**Input:**
```typescript
{
  conversationId: number;
  cursor?: number;      // Optional pagination cursor
  limit?: number;      // Optional limit (1-50, default: 20)
}
```

**Output:**
```typescript
{
  messages: Message[];
  hasMore: boolean;
  nextCursor?: number;
}
```

**Security:**
- ✅ Ownership check: Verifies user owns the conversation
- ✅ CSRF protection: Required for POST requests

**Errors:**
- `NOT_FOUND` (404) - Conversation not found
- `FORBIDDEN` (403) - User doesn't own the conversation

**Example:**
```typescript
const { data } = trpc.chat.getMessages.useQuery({
  conversationId: 123,
  limit: 20,
});
```

---

### `chat.sendMessage`

Send a message to a conversation with ownership verification.

**Type:** Mutation (Protected)  
**Path:** `chat.sendMessage`

**Input:**
```typescript
{
  conversationId: number;
  content: string;                    // 1-5,000 characters
  model?: string;                     // Optional, max 100 chars
  context?: {
    selectedEmails?: string[];        // Max 50 items, each max 100 chars
    calendarEvents?: any[];           // Max 100 items
    searchQuery?: string;             // Max 500 chars
    hasEmails?: boolean;
    hasCalendar?: boolean;
    hasInvoices?: boolean;
    page?: string;                    // Max 100 chars
  };
}
```

**Output:**
```typescript
Message
```

**Security:**
- ✅ Ownership check: Verifies user owns the conversation
- ✅ Rate limiting: 10 messages per minute
- ✅ CSRF protection: Required
- ✅ Input validation: Length limits enforced

**Errors:**
- `NOT_FOUND` (404) - Conversation not found
- `FORBIDDEN` (403) - User doesn't own the conversation
- `TOO_MANY_REQUESTS` (429) - Rate limit exceeded
- `BAD_REQUEST` (400) - Invalid input

**Example:**
```typescript
const sendMessage = trpc.chat.sendMessage.useMutation();
await sendMessage.mutateAsync({
  conversationId: 123,
  content: "Hello, AI!",
});
```

---

### `chat.deleteConversation`

Delete a conversation with ownership verification.

**Type:** Mutation (Protected)  
**Path:** `chat.deleteConversation`

**Input:**
```typescript
{
  conversationId: number;
}
```

**Output:**
```typescript
{
  success: boolean;
}
```

**Security:**
- ✅ Ownership check: Verifies user owns the conversation
- ✅ CSRF protection: Required

**Errors:**
- `NOT_FOUND` (404) - Conversation not found
- `FORBIDDEN` (403) - User doesn't own the conversation

**Example:**
```typescript
const deleteConversation = trpc.chat.deleteConversation.useMutation();
await deleteConversation.mutateAsync({
  conversationId: 123,
});
```

---

## Authorization Helpers

### `requireOwnership`

Verify that a user owns a resource.

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
- `resourceType` - Human-readable resource type (e.g., "conversation", "customer profile")
- `resourceId` - Optional resource ID for error messages

**Throws:**
- `TRPCError` with code `FORBIDDEN` if user doesn't own the resource

**Example:**
```typescript
const conversation = await getConversation(conversationId);
if (!conversation) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: "Conversation not found",
  });
}
requireOwnership(ctx.user.id, conversation.userId, "conversation", conversationId);
```

---

### `requireOwnershipBatch`

Verify that a user owns multiple resources.

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
- `resourceType` - Human-readable resource type

**Throws:**
- `TRPCError` with code `FORBIDDEN` if user doesn't own any resource

**Example:**
```typescript
const conversations = await db.select().from(conversations)
  .where(inArray(conversations.id, conversationIds));
requireOwnershipBatch(ctx.user.id, conversations, "conversation");
```

---

## CSRF Protection

### Frontend: `getCsrfHeaders`

Get CSRF token headers for requests.

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

**Usage in tRPC:**
Automatically included in all tRPC requests via `httpLink` and `httpBatchLink` configuration.

---

### Backend: `validateCsrfToken`

Validate CSRF token from request.

**Location:** `server/_core/csrf.ts`

**Signature:**
```typescript
function validateCsrfToken(req: Request): void
```

**Validation:**
1. Skips safe methods (GET, HEAD, OPTIONS)
2. Skips public endpoints (`/api/auth/`, `/api/health`, `/api/oauth/callback`)
3. Validates token from cookie matches token from header
4. Validates token format (64 hex characters)

**Throws:**
- `Error` if token is missing or invalid

**Middleware:**
Applied to all `/api/` routes via `csrfMiddleware` in `server/_core/index.ts`.

---

## Error Handling

### Error Codes

**`NOT_FOUND` (404)**
- Resource doesn't exist
- Example: Conversation not found

**`FORBIDDEN` (403)**
- User doesn't have permission
- Example: User doesn't own the conversation

**`TOO_MANY_REQUESTS` (429)**
- Rate limit exceeded
- Example: Too many messages sent

**`BAD_REQUEST` (400)**
- Invalid input
- Example: Message too long

### Error Response Format

```typescript
{
  error: {
    code: string;
    message: string;
    data?: any;
  }
}
```

---

## Data Flow

### Conversation Access Flow

```
User Request
    ↓
[Authentication] → Verify user session
    ↓
[CSRF Check] → Validate CSRF token
    ↓
[Ownership Check] → Verify user owns resource
    ↓
[Business Logic] → Execute operation
    ↓
Response
```

### CSRF Token Flow

```
Page Load
    ↓
[Server] → Generate CSRF token → Set cookie
    ↓
[Frontend] → Read token from cookie
    ↓
[Request] → Include token in X-CSRF-Token header
    ↓
[Server] → Validate cookie token === header token
    ↓
[Response] → Process request or reject
```

---

## Dependencies

### Backend

- `@trpc/server` - tRPC framework
- `zod` - Input validation
- `drizzle-orm` - Database queries
- `express` - HTTP server

### Frontend

- `@trpc/react-query` - tRPC React client
- `@tanstack/react-query` - Query client

---

## Examples

### Complete Example: Send Message with Ownership Check

**Backend:**
```typescript
sendMessage: protectedProcedure
  .input(z.object({
    conversationId: z.number().int().positive(),
    content: z.string().min(1).max(5000),
  }))
  .mutation(async ({ ctx, input }) => {
    // 1. Verify ownership
    const conversation = await getConversation(input.conversationId);
    if (!conversation) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Conversation not found",
      });
    }
    requireOwnership(ctx.user.id, conversation.userId, "conversation", input.conversationId);

    // 2. Rate limiting
    const rateLimit = await checkRateLimitUnified(ctx.user.id, {
      limit: 10,
      windowMs: 60000,
    });
    if (!rateLimit.success) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Rate limit exceeded",
      });
    }

    // 3. Create message
    return await createMessage({
      conversationId: input.conversationId,
      content: input.content,
      role: "user",
    });
  }),
```

**Frontend:**
```typescript
const sendMessage = trpc.chat.sendMessage.useMutation({
  onError: (error) => {
    if (error.data?.code === "FORBIDDEN") {
      toast.error("You don't have permission to access this conversation");
    } else if (error.data?.code === "TOO_MANY_REQUESTS") {
      toast.error("Rate limit exceeded. Please wait a moment.");
    } else {
      toast.error(error.message);
    }
  },
});

await sendMessage.mutateAsync({
  conversationId: 123,
  content: "Hello!",
});
```

---

**Generated:** 2025-01-28  
**Last Updated:** 2025-01-28

