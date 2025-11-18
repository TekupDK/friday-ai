# Strategic Debug Logging

**Author:** TekupDK Development Team  
**Last Updated:** January 28, 2025  
**Version:** 1.0.0

## Overview

Strategic debug logging has been added to critical flows in Friday AI Chat to help identify root causes quickly during development and debugging. This logging complements the structured production logging (Pino logger) and focuses on key decision points and data flow.

## Purpose

Strategic logging helps developers:
- **Trace request flow** through the system with correlation IDs
- **Identify decision points** where logic branches
- **Debug data transformations** before and after operations
- **Track API calls** and their results
- **Understand error conditions** with full context

## Logging Strategy

### Log Levels

- **DEBUG:** Detailed information for debugging (function entry, data transformations, decision points)
- **INFO:** General information about flow (successful operations, important state changes)
- **WARN:** Warning conditions (rate limits, missing data, validation failures)
- **ERROR:** Error conditions (exceptions, failures, unexpected states)

### Log Format

All strategic logs follow this consistent format:

```typescript
console.log("[LEVEL] [Component] [Action]:", { key: value });
console.error("[ERROR] [Component] [Action]:", { error, context });
```

**Format Components:**
- `[LEVEL]` - Log level (DEBUG, INFO, WARN, ERROR)
- `[Component]` - Component name (Chat, AI Router, Tool)
- `[Action]` - Action being performed (sendMessage, routeAI, executeToolCall)
- `{ key: value }` - Structured data object with context

### When to Log

Strategic logging is added at:

1. **Entry points:** Function entry with inputs
2. **Decision points:** Before if/switch statements
3. **Data transformations:** Before/after transformations
4. **API calls:** Before/after API requests
5. **Error conditions:** When errors occur
6. **Exit points:** Function exit with results

## Implementation

### Chat Router (`server/routers.ts`)

**Component:** `[Chat]`  
**Main Function:** `sendMessage`

**Logging Points:**
- Entry: Logs userId, conversationId, message length, context info, correlationId
- Conversation ownership check: Logs verification process
- Rate limit check: Logs rate limit status
- Message saving: Logs before/after saving user message
- Conversation history: Logs loading and message count
- AI router call: Logs message count, tool availability, correlationId
- AI response: Logs model, response length, pending actions
- Completion: Logs duration and correlationId

**Example Logs:**
```typescript
[DEBUG] [Chat] [sendMessage]: Entry { userId, conversationId, messageLength, correlationId }
[DEBUG] [Chat] [sendMessage]: Checking conversation ownership { conversationId, userId }
[DEBUG] [Chat] [sendMessage]: Rate limit check passed { userId }
[INFO] [Chat] [sendMessage]: AI response received { model, responseLength, hasPendingAction }
[DEBUG] [Chat] [sendMessage]: Complete { conversationId, duration, correlationId }
```

### AI Router (`server/ai-router.ts`)

**Component:** `[AI Router]`  
**Main Function:** `routeAI`

**Logging Points:**
- Entry: Logs task type, userId, message count, model selection inputs
- Model selection: Logs selection process and chosen model
- Intent parsing: Logs user message analysis and intent detection
- Intent execution conditions: Logs confidence, approval requirements
- Action creation/execution: Logs pending action creation or immediate execution
- Cache checks: Logs cache hit/miss status
- LLM invocation: Logs routing decision (new system vs legacy)
- Response handling: Logs streaming vs non-streaming response
- Completion: Logs model, response length, usage stats

**Example Logs:**
```typescript
[DEBUG] [AI Router] [routeAI]: Entry { taskType, userId, messageCount, correlationId }
[INFO] [AI Router] [routeAI]: Model selected { selectedModel, taskType }
[DEBUG] [AI Router] [routeAI]: Intent parsed { intent, confidence, params }
[INFO] [AI Router] [routeAI]: Creating pending action { intent, correlationId }
[INFO] [AI Router] [routeAI]: Cache hit { model, correlationId }
[DEBUG] [AI Router] [routeAI]: Complete { model, responseLength, usage }
```

### Tool Handlers (`server/friday-tool-handlers.ts`)

**Component:** `[Tool]`  
**Main Function:** `executeToolCall`

**Logging Points:**
- Entry: Logs tool name, userId, arguments, correlationId
- Validation: Logs validation checks and failures
- Registry lookup: Logs tool registry entry found
- Approval checks: Logs approval requirements
- Handler execution: Logs before/after handler calls
- Completion: Logs success status, duration, result data

**Individual Tool Handlers (All handlers):**
All tool handlers now accept `correlationId?: string` parameter and include it in all logs. Handler function signature:

```typescript
async function handleToolName(
  args: ToolArgs,
  correlationId?: string
): Promise<ToolCallResult>
```

For handlers that require `userId`, the signature is:

```typescript
async function handleToolName(
  userId: number,
  args: ToolArgs,
  correlationId?: string
): Promise<ToolCallResult>
```

- **Gmail Tools:**
  - `handleSearchGmail`: Logs query, result count, correlationId
  - `handleGetGmailThread`: Logs threadId, correlationId
  - `handleCreateGmailDraft`: Logs to, subject, draftId, correlationId

- **Billy Tools:**
  - `handleListBillyInvoices`: Logs invoice count, correlationId
  - `handleSearchBillyCustomer`: Logs email, found status, correlationId
  - `handleCreateBillyInvoice`: Logs contactId, line count, total amount, correlationId

- **Calendar Tools:**
  - `handleListCalendarEvents`: Logs timeMin, timeMax, event count, correlationId
  - `handleFindFreeCalendarSlots`: Logs date, duration, slot count, correlationId
  - `handleCreateCalendarEvent`: Logs summary, start, end, eventId, correlationId
  - `handleSearchCustomerCalendarHistory`: Logs customerName, totalEvents, correlationId
  - `handleUpdateCalendarEvent`: Logs eventId, correlationId
  - `handleDeleteCalendarEvent`: Logs eventId, reason, correlationId
  - `handleCheckCalendarConflicts`: Logs start, end, conflict count, correlationId

- **Lead Tools:**
  - `handleListLeads`: Logs userId, status, lead count, correlationId
  - `handleCreateLead`: Logs userId, name, source, leadId, correlationId
  - `handleUpdateLeadStatus`: Logs leadId, status, correlationId

- **Task Tools:**
  - `handleListTasks`: Logs userId, status, task count, correlationId
  - `handleCreateTask`: Logs userId, title, taskId, correlationId

**Example Logs:**
```typescript
[DEBUG] [Tool] [executeToolCall]: Entry { toolName, userId, argKeys, correlationId }
[DEBUG] [Tool] [executeToolCall]: Tool registry entry found { toolName, requiresApproval }
[DEBUG] [Tool] [handleSearchGmail]: Entry { query, maxResults, correlationId }
[INFO] [Tool] [handleSearchGmail]: Success { resultCount, query, correlationId }
[ERROR] [Tool] [handleCreateBillyInvoice]: Failed { contactId, error, stack, correlationId }
[DEBUG] [Tool] [executeToolCall]: Complete { toolName, duration, correlationId }
```

## Correlation IDs

All strategic logs include correlation IDs for request tracing:

- **Generated:** At the start of each request flow using `generateCorrelationId()`
- **Propagated:** Through all function calls in the request chain
- **Purpose:** Track a single request across multiple components
- **Format:** `action_${Date.now()}_${randomUUID().slice(0, 8)}`

**Propagation Flow:**
```typescript
// 1. Generated in chat router
const correlationId = generateCorrelationId();
console.log("[DEBUG] [Chat] [sendMessage]: Entry", { correlationId });

// 2. Passed to AI router
await routeAI({ ..., correlationId });

// 3. Passed to tool handlers (if tools are called)
await executeToolCall(toolName, args, userId, { correlationId });

// 4. All tool handlers receive and log correlationId
async function handleSearchGmail(args, correlationId) {
  console.log("[DEBUG] [Tool] [handleSearchGmail]: Entry", { correlationId });
  // ... handler logic
}
```

**All Tool Handlers Support Correlation IDs:**
- ✅ All 18 tool handlers accept `correlationId?: string` parameter
- ✅ CorrelationId included in all handler logs (entry, success, error)
- ✅ CorrelationId propagated through entire tool execution chain
- ✅ Enables end-to-end request tracing from chat → AI router → tool handlers

## Usage

### During Development

Strategic logs help developers:
- Understand request flow through the system
- Identify where issues occur
- Debug data transformations
- Track API call results

### During Debugging

When debugging an issue:
1. **Find the correlation ID** in the error or first log entry
2. **Search logs** for that correlation ID
3. **Trace the flow** through all components
4. **Identify the failure point** using error logs

### Example Debug Session

```bash
# Search for a specific correlation ID
grep "abc123" logs/dev-server.log

# Search for all errors in Chat component
grep "\[ERROR\] \[Chat\]" logs/dev-server.log

# Search for rate limit warnings
grep "\[WARN\].*rate limit" logs/dev-server.log
```

## Best Practices

### When Adding New Logs

1. **Use consistent format:** `[LEVEL] [Component] [Action]:`
2. **Include correlation IDs:** Pass correlationId through function calls
3. **Log structured data:** Use objects, not string concatenation
4. **Log at decision points:** Before if/switch statements
5. **Log errors with context:** Include error message, stack, and relevant data

### When NOT to Log

- **Don't log sensitive data:** Passwords, tokens, API keys
- **Don't log in tight loops:** Avoid logging in performance-critical loops
- **Don't duplicate logs:** Don't log the same information multiple times
- **Don't log everything:** Focus on strategic points, not every line

## Differences from Production Logging

### Strategic Debug Logging (This Document)

- **Purpose:** Development and debugging
- **Format:** `console.log/error/warn` with structured format
- **Location:** Critical flows and decision points
- **Use:** During development and debugging sessions

### Structured Production Logging (Pino Logger)

- **Purpose:** Production monitoring and observability
- **Format:** Structured JSON via Pino logger
- **Location:** All server-side code
- **Use:** Always in production code

**Note:** Strategic debug logs complement but don't replace structured production logging. Both serve different purposes and can coexist.

## Troubleshooting

### Logs Not Appearing

1. **Check log level:** Ensure DEBUG logs are enabled
2. **Check console output:** Logs go to stdout/stderr
3. **Check correlation ID:** Ensure correlationId is passed through calls
4. **Check component name:** Verify component name matches log format

### Too Many Logs

1. **Filter by correlation ID:** Focus on specific request
2. **Filter by component:** Focus on specific component
3. **Filter by level:** Show only ERROR/WARN logs
4. **Use log aggregation:** Use tools like grep, jq, or log aggregators

### Missing Context

1. **Check function entry logs:** Should include all inputs
2. **Check correlation ID propagation:** Ensure it's passed through calls
3. **Check error logs:** Should include full error context

## Related Documentation

- [Development Guide](../../DEVELOPMENT_GUIDE.md) - General development patterns
- [Architecture](../../ARCHITECTURE.md) - System architecture and logging overview
- [Error Handling Guide](../../development-notes/fixes/ERROR_HANDLING_GUIDE.md) - Error handling patterns
- `server/_core/logger.ts` - Structured production logging (Pino)

## Files Modified

- `server/routers.ts` - Added strategic logging to `sendMessage` endpoint
- `server/ai-router.ts` - Enhanced logging in `routeAI` function
- `server/friday-tool-handlers.ts` - Added entry/exit logging to tool handlers

## Future Improvements

- [ ] Add log aggregation and search tools
- [ ] Create log visualization dashboard
- [ ] Add performance metrics to logs
- [ ] Implement log sampling for high-volume operations
- [ ] Add log rotation and retention policies

