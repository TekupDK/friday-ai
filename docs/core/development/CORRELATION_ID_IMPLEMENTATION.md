# Correlation ID Implementation

**Author:** TekupDK Development Team  
**Last Updated:** January 28, 2025  
**Version:** 1.0.0

## Overview

Correlation IDs enable end-to-end request tracing across the Friday AI Chat system. Every user request is assigned a unique correlation ID that propagates through all components, allowing developers to trace a single request from the chat interface through the AI router to individual tool handlers.

## Implementation Status

### ✅ Complete

- **Chat Router (`server/routers.ts`):**
  - Generates correlation ID at request entry
  - Passes correlation ID to AI router
  - Includes correlation ID in all logs

- **AI Router (`server/ai-router.ts`):**
  - Receives correlation ID from chat router
  - Passes correlation ID to tool handlers
  - Includes correlation ID in all logs

- **Tool Handlers (`server/friday-tool-handlers.ts`):**
  - All 18 tool handlers accept `correlationId?: string` parameter
  - Correlation ID included in all handler logs (entry, success, error)
  - Correlation ID propagated through entire tool execution chain

## Correlation ID Format

```typescript
const correlationId = `action_${Date.now()}_${randomUUID().slice(0, 8)}`;
// Example: "action_1706456789123_a1b2c3d4"
```

**Format Components:**

- `action_` - Prefix indicating action/request
- `${Date.now()}` - Timestamp in milliseconds
- `${randomUUID().slice(0, 8)}` - First 8 characters of UUID for uniqueness

## Propagation Flow

```
1. Chat Router (sendMessage)
   ↓ generates correlationId
   ↓ logs: [DEBUG] [Chat] [sendMessage]: Entry { correlationId }
   ↓
2. AI Router (routeAI)
   ↓ receives correlationId
   ↓ logs: [DEBUG] [AI Router] [routeAI]: Entry { correlationId }
   ↓
3. Tool Handler (executeToolCall)
   ↓ receives correlationId
   ↓ logs: [DEBUG] [Tool] [executeToolCall]: Entry { correlationId }
   ↓
4. Individual Tool Handler (e.g., handleSearchGmail)
   ↓ receives correlationId
   ↓ logs: [DEBUG] [Tool] [handleSearchGmail]: Entry { correlationId }
   ↓ logs: [INFO] [Tool] [handleSearchGmail]: Success { correlationId }
```

## Tool Handlers with Correlation ID Support

### Gmail Tools (3 handlers)

- ✅ `handleSearchGmail` - Search Gmail emails
- ✅ `handleGetGmailThread` - Get Gmail thread details
- ✅ `handleCreateGmailDraft` - Create Gmail draft

### Billy Tools (3 handlers)

- ✅ `handleListBillyInvoices` - List Billy invoices
- ✅ `handleSearchBillyCustomer` - Search Billy customers
- ✅ `handleCreateBillyInvoice` - Create Billy invoice

### Calendar Tools (7 handlers)

- ✅ `handleListCalendarEvents` - List calendar events
- ✅ `handleFindFreeCalendarSlots` - Find free time slots
- ✅ `handleCreateCalendarEvent` - Create calendar event
- ✅ `handleSearchCustomerCalendarHistory` - Search customer calendar history
- ✅ `handleUpdateCalendarEvent` - Update calendar event
- ✅ `handleDeleteCalendarEvent` - Delete calendar event
- ✅ `handleCheckCalendarConflicts` - Check calendar conflicts

### Lead Tools (3 handlers)

- ✅ `handleListLeads` - List leads
- ✅ `handleCreateLead` - Create lead
- ✅ `handleUpdateLeadStatus` - Update lead status

### Task Tools (2 handlers)

- ✅ `handleListTasks` - List tasks
- ✅ `handleCreateTask` - Create task

**Total: 18 tool handlers** - All support correlation IDs

## Code Examples

### Generating Correlation ID

```typescript
import { randomUUID } from "crypto";

function generateCorrelationId(): string {
  return `action_${Date.now()}_${randomUUID().slice(0, 8)}`;
}

// Usage in chat router
const correlationId = generateCorrelationId();
```

### Passing Correlation ID Through Chain

```typescript
// 1. Chat Router
const correlationId = generateCorrelationId();
const aiResponse = await routeAI({
  messages,
  userId: ctx.user.id,
  correlationId, // Pass to AI router
});

// 2. AI Router
export async function routeAI(options: AIRouterOptions) {
  const { correlationId } = options;
  // ... AI routing logic
  if (toolCall) {
    const result = await executeToolCall(
      toolName,
      args,
      userId,
      { correlationId } // Pass to tool handler
    );
  }
}

// 3. Tool Handler
export async function executeToolCall(
  toolName: ToolName,
  args: Record<string, any>,
  userId: number,
  options?: { correlationId?: string }
) {
  const correlationId = options?.correlationId;
  // ... validation and execution
  const result = await entry.handler(parsed.data, userId, correlationId);
}

// 4. Individual Handler
async function handleSearchGmail(
  args: { query: string; maxResults?: number },
  correlationId?: string
): Promise<ToolCallResult> {
  console.log("[DEBUG] [Tool] [handleSearchGmail]: Entry", {
    query: args.query,
    correlationId, // Log correlation ID
  });
  // ... handler logic
}
```

## Logging with Correlation IDs

All logs include correlation ID in structured format:

```typescript
// Entry log
console.log("[DEBUG] [Tool] [handleSearchGmail]: Entry", {
  query: args.query,
  maxResults: args.maxResults,
  correlationId,
});

// Success log
console.log("[INFO] [Tool] [handleSearchGmail]: Success", {
  resultCount: results.length,
  query: args.query,
  correlationId,
});

// Error log
console.error("[ERROR] [Tool] [handleSearchGmail]: Failed", {
  query: args.query,
  error: error instanceof Error ? error.message : "Unknown error",
  stack: error instanceof Error ? error.stack : undefined,
  correlationId,
});
```

## Debugging with Correlation IDs

### Finding All Logs for a Request

```bash
# Search for a specific correlation ID
grep "action_1706456789123_a1b2c3d4" logs/dev-server.log

# Search for all logs with correlation IDs
grep "correlationId" logs/dev-server.log | grep "action_"
```

### Tracing Request Flow

1. **Find the correlation ID** in the first log entry or error message
2. **Search all logs** for that correlation ID
3. **Trace the flow** through components:
   - Chat → AI Router → Tool Handler → Individual Handler
4. **Identify failure point** using error logs

### Example Debug Session

```bash
# User reports error with correlation ID: action_1706456789123_a1b2c3d4

# 1. Find all logs for this request
grep "action_1706456789123_a1b2c3d4" logs/dev-server.log

# Output shows:
# [DEBUG] [Chat] [sendMessage]: Entry { correlationId: "action_1706456789123_a1b2c3d4" }
# [DEBUG] [AI Router] [routeAI]: Entry { correlationId: "action_1706456789123_a1b2c3d4" }
# [DEBUG] [Tool] [executeToolCall]: Entry { toolName: "search_gmail", correlationId: "action_1706456789123_a1b2c3d4" }
# [DEBUG] [Tool] [handleSearchGmail]: Entry { query: "from:customer@example.com", correlationId: "action_1706456789123_a1b2c3d4" }
# [ERROR] [Tool] [handleSearchGmail]: Failed { query: "from:customer@example.com", error: "API rate limit exceeded", correlationId: "action_1706456789123_a1b2c3d4" }

# 2. Identify the issue: API rate limit exceeded in handleSearchGmail
# 3. Check rate limiting configuration or implement retry logic
```

## Benefits

1. **End-to-End Tracing:** Track a single request through all components
2. **Faster Debugging:** Quickly find all logs related to a specific request
3. **Error Correlation:** Link errors to specific user requests
4. **Performance Analysis:** Trace slow requests through the system
5. **Request Isolation:** Debug issues without affecting other requests

## Best Practices

1. **Always Pass Correlation ID:** Don't drop correlation ID in function calls
2. **Include in All Logs:** Add correlation ID to entry, success, and error logs
3. **Use Structured Format:** Include correlation ID in log objects, not strings
4. **Generate Once:** Generate correlation ID at request entry, not in each component
5. **Propagate Consistently:** Use same parameter name (`correlationId`) everywhere

## Related Documentation

- [Strategic Logging Guide](./STRATEGIC_LOGGING.md) - Comprehensive logging documentation
- [Sprint Plan: Logging Improvements](../../status-reports/sprints/SPRINT_PLAN_LOGGING_2025-01-28.md) - Implementation plan
- [Exploratory Debugging Report](../../development-notes/debugging/EXPLORATORY_DEBUGGING_STRATEGIC_LOGGING.md) - Debugging findings

---

**Last Updated:** January 28, 2025  
**Status:** ✅ Complete - All 18 tool handlers support correlation IDs
