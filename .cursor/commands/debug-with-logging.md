# Debug with Logging

You are a senior engineer adding strategic logging to debug issues in Friday AI Chat. You add targeted logs that help identify root causes quickly.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Logging:** Console.log for dev, structured logging for production
- **Strategy:** Strategic logging at decision points, not everywhere
- **Pattern:** Consistent log format, log levels, correlation IDs

## TASK

Add strategic logging to debug an issue. Focus on key decision points and data flow.

## LOGGING STRATEGY

### Log Levels:
- **DEBUG:** Detailed information for debugging
- **INFO:** General information about flow
- **WARN:** Warning conditions
- **ERROR:** Error conditions

### Log Format:
```typescript
console.log("[DEBUG] [Component] [Action]:", { key: value });
console.error("[ERROR] [Component] [Action]:", { error, context });
```

### When to Log:
1. **Entry points:** Function entry with inputs
2. **Decision points:** Before if/switch statements
3. **Data transformations:** Before/after transformations
4. **API calls:** Before/after API requests
5. **Error conditions:** When errors occur
6. **Exit points:** Function exit with results

## CODEBASE PATTERNS (Follow These Exactly)

### Example: Function Entry/Exit Logging
```typescript
export async function getCustomerProfileById(
  customerId: number,
  userId: number
) {
  console.log("[DEBUG] getCustomerProfileById: Entry", {
    customerId,
    userId,
  });

  const db = await getDb();
  if (!db) {
    console.warn("[WARN] getCustomerProfileById: Database unavailable");
    return undefined;
  }

  const result = await db
    .select()
    .from(customerProfiles)
    .where(
      and(
        eq(customerProfiles.id, customerId),
        eq(customerProfiles.userId, userId)
      )
    )
    .limit(1);

  console.log("[DEBUG] getCustomerProfileById: Result", {
    found: result.length > 0,
    customerId,
  });

  return result.length > 0 ? result[0] : undefined;
}
```

### Example: API Call Logging
```typescript
async function handleSearchGmail(args: { query: string }) {
  console.log("[DEBUG] handleSearchGmail: Starting", {
    query: args.query,
  });

  try {
    const results = await searchGmail({
      query: args.query,
      maxResults: 20,
    });

    console.log("[INFO] handleSearchGmail: Success", {
      resultCount: results.length,
      query: args.query,
    });

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    console.error("[ERROR] handleSearchGmail: Failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      query: args.query,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      code: "API_ERROR",
    };
  }
}
```

### Example: Decision Point Logging
```typescript
async function handlePipelineTransition(
  userId: number,
  threadId: string,
  newStage: string
) {
  console.log("[DEBUG] handlePipelineTransition: Entry", {
    userId,
    threadId,
    newStage,
  });

  const pipelineState = await getPipelineState(userId, threadId);
  
  console.log("[DEBUG] handlePipelineTransition: Pipeline state", {
    found: !!pipelineState,
    threadId,
  });

  if (!pipelineState) {
    console.warn("[WARN] handlePipelineTransition: No pipeline state", {
      threadId,
    });
    return;
  }

  console.log("[DEBUG] handlePipelineTransition: Processing stage", {
    newStage,
    threadId,
  });

  switch (newStage) {
    case "i_kalender":
      console.log("[INFO] handlePipelineTransition: Calendar stage", {
        threadId,
      });
      await handleCalendarStage(userId, threadId, pipelineState);
      break;
    // ... more cases
  }

  console.log("[DEBUG] handlePipelineTransition: Complete", {
    newStage,
    threadId,
  });
}
```

## IMPLEMENTATION STEPS

1. **Identify logging points:**
   - Function entry/exit
   - Decision points (if/switch)
   - Data transformations
   - API calls
   - Error conditions

2. **Add strategic logs:**
   - Log at entry with inputs
   - Log before decisions
   - Log after transformations
   - Log API requests/responses
   - Log errors with context

3. **Use consistent format:**
   - `[LEVEL] [Component] [Action]:` prefix
   - Structured data objects
   - Include relevant context
   - Include correlation IDs if available

4. **Test logging:**
   - Run code with logs
   - Verify logs appear
   - Check log format
   - Verify helpful information

5. **Clean up (optional):**
   - Remove excessive logs after debugging
   - Keep important error logs
   - Keep performance-critical logs

## LOGGING CHECKLIST

- ✅ Entry points logged with inputs
- ✅ Decision points logged
- ✅ Data transformations logged
- ✅ API calls logged (request/response)
- ✅ Errors logged with full context
- ✅ Consistent log format
- ✅ Helpful information included

## OUTPUT FORMAT

```markdown
### Debug Logging: [Component/Function]

**Logging Points Added:**
- Entry: [what's logged]
- Decision: [what's logged]
- Transformation: [what's logged]
- API: [what's logged]
- Error: [what's logged]

**Example Logs:**
\`\`\`
[DEBUG] [Component] [Action]: { key: value }
[ERROR] [Component] [Action]: { error, context }
\`\`\`

**Files Modified:**
- `path/to/file.ts` - Added logging

**Verification:**
- ✅ Logs appear correctly
- ✅ Format is consistent
- ✅ Helpful for debugging
```

