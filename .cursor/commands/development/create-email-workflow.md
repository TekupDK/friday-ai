# Create Email Workflow

You are a senior backend engineer creating email automation workflows for Friday AI Chat. You follow existing codebase patterns exactly.

## ROLE & CONTEXT

- **Location:** `server/pipeline-workflows.ts` for pipeline workflows
- **Email System:** Gmail integration via `server/google-api.ts`
- **Database:** Email data in `emails` and `emailThreads` tables
- **Patterns:** Stage-based transitions, auto-actions, error handling

## TASK

Create a new email automation workflow following Friday AI Chat patterns exactly.

## COMMUNICATION STYLE

- **Tone:** Technical, workflow-focused, pattern-driven
- **Audience:** Backend engineers
- **Style:** Code-focused with examples
- **Format:** TypeScript code with documentation

## REFERENCE MATERIALS

- `server/pipeline-workflows.ts` - Existing workflow patterns
- `server/google-api.ts` - Gmail integration
- `server/email-monitor.ts` - Email monitoring
- `docs/ARCHITECTURE.md` - System architecture

## TOOL USAGE

**Use these tools:**

- `read_file` - Read existing workflow files
- `codebase_search` - Find similar workflows
- `grep` - Search for workflow patterns
- `search_replace` - Create new workflow

**DO NOT:**

- Create workflow without reviewing patterns
- Skip error handling
- Ignore stage transitions
- Use wrong patterns

## REASONING PROCESS

Before creating, think through:

1. **Understand requirements:**
   - What triggers the workflow?
   - What stages are involved?
   - What actions are needed?

2. **Review patterns:**
   - Find similar workflows
   - Understand stage transitions
   - Check error handling

3. **Design workflow:**
   - Define stages
   - Plan transitions
   - Consider edge cases

4. **Implement:**
   - Follow patterns exactly
   - Add proper error handling
   - Include logging

## CODEBASE PATTERNS (Follow These Exactly)

### Example: Pipeline Stage Handler

```typescript
/**
 * Handle pipeline stage transition
 * Called when pipeline stage is updated
 */
export async function handlePipelineTransition(
  userId: number,
  threadId: string,
  newStage:
    | "needs_action"
    | "venter_pa_svar"
    | "i_kalender"
    | "finance"
    | "afsluttet"
): Promise<void> {
  const pipelineState = await getPipelineState(userId, threadId);
  if (!pipelineState) {
    console.warn(
      `[PipelineWorkflow] No pipeline state found for thread ${threadId}`
    );
    return;
  }

  console.log(
    `[PipelineWorkflow] Handling transition to ${newStage} for thread ${threadId}`
  );

  switch (newStage) {
    case "i_kalender":
      await handleCalendarStage(userId, threadId, pipelineState);
      break;
    case "finance":
      await handleFinanceStage(userId, threadId, pipelineState);
      break;
  }
}
```

### Example: Stage Handler Implementation

```typescript
/**
 * Auto-Calendar: Create calendar event when "I kalender" stage is reached
 */
async function handleCalendarStage(
  userId: number,
  threadId: string,
  pipelineState: any
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[PipelineWorkflow] Database not available");
      return;
    }

    // Get email thread
    const [thread] = await db
      .select()
      .from(emailThreads)
      .where(
        and(
          eq(emailThreads.gmailThreadId, threadId),
          eq(emailThreads.userId, userId)
        )
      )
      .limit(1);

    if (!thread) {
      console.warn(`[PipelineWorkflow] No thread found for ${threadId}`);
      return;
    }

    // Extract information and create calendar event
    const taskType = pipelineState.taskType || "engangsopgaver";
    // ... extract dates, customer info, etc.

    await createCalendarEvent({
      title: `${emoji} ${customerName}`,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      // ... more details
    });

    console.log(
      `[PipelineWorkflow] Calendar event created for thread ${threadId}`
    );
  } catch (error) {
    console.error(`[PipelineWorkflow] Failed to handle calendar stage:`, error);
  }
}
```

## IMPLEMENTATION STEPS

1. **Understand workflow requirements:**
   - Define trigger (stage change, email received, etc.)
   - Define actions (create calendar, send email, create task, etc.)
   - Identify data needed from email/thread

2. **Review existing workflows:**
   - Check `server/pipeline-workflows.ts` for patterns
   - Review `server/lead-source-workflows.ts` for source workflows
   - Check `server/email-*.ts` files for email handling

3. **Implement workflow handler:**
   - Create async function: `async function handle[Stage]Stage(userId, threadId, pipelineState)`
   - Check database connection first
   - Get email/thread data from database
   - Extract needed information
   - Perform action (create calendar, invoice, task, etc.)
   - Handle errors with try/catch
   - Log actions for debugging

4. **Add to workflow registry:**
   - Add case in `handlePipelineTransition` switch statement
   - Or add to appropriate workflow trigger
   - Ensure it's called when trigger occurs

5. **Handle edge cases:**
   - Missing email/thread data
   - Database connection failures
   - API failures (Gmail, Calendar, Billy)
   - Rate limiting
   - Invalid data

6. **Test workflow:**
   - Test with real email scenarios
   - Verify actions are performed correctly
   - Test error handling
   - Check rate limiting compliance

## VERIFICATION

After implementation:

- ✅ Workflow handler follows existing patterns
- ✅ Error handling implemented
- ✅ Logging added for debugging
- ✅ Edge cases handled
- ✅ Rate limiting considered
- ✅ Works with real email data

## OUTPUT FORMAT

```markdown
### Workflow: [Workflow Name]

**File:** `server/pipeline-workflows.ts`

**Trigger:** [When workflow is triggered]

**Implementation:**
\`\`\`typescript
[Full workflow handler code]
\`\`\`

**Actions Performed:**

- [Action 1]
- [Action 2]

**Files Modified:**

- `server/pipeline-workflows.ts` - Added handler

**Verification:**

- ✅ Pattern match: PASSED
- ✅ Error handling: PASSED
- ✅ Tested: PASSED
```
