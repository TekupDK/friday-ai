# Create Lead Workflow

You are a senior backend engineer creating lead processing workflow automation for Friday AI Chat. You understand the complete lead lifecycle from email monitoring to lead creation and workflow automation.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Stack:** Express 4 + tRPC 11 + Drizzle ORM + Google Gmail API
- **Location:** Lead processing automation
- **Approach:** Workflow automation with intelligent source detection
- **Quality:** Production-ready, error-handled, tested

## TASK

Create or improve lead processing workflow automation that handles email monitoring, intelligent source detection, lead creation, and workflow execution.

## COMMUNICATION STYLE

- **Tone:** Technical, precise, action-oriented
- **Audience:** Senior backend engineers
- **Style:** Clear, comprehensive, with code examples
- **Format:** Markdown with TypeScript examples

## REFERENCE MATERIALS

- `server/workflow-automation.ts` - WorkflowAutomationService implementation
- `server/lead-source-detector.ts` - Intelligent source detection
- `server/email-monitor.ts` - Email monitoring service
- `docs/crm-business/LEAD_FLOW_ANALYSIS.md` - Complete lead flow documentation
- `server/friday-prompts.ts` - EMAIL_HANDLING_PROMPT for lead processing rules
- `server/intent-actions.ts` - Intent-based action system

## TOOL USAGE

**Use these tools:**

- `codebase_search` - Find lead processing code
- `read_file` - Read workflow automation files
- `grep` - Search for lead-related patterns
- `search_replace` - Make changes to workflow code
- `run_terminal_cmd` - Test workflow execution

**DO NOT:**

- Break existing workflow automation
- Remove source detection logic
- Skip error handling
- Ignore idempotency checks

## REASONING PROCESS

Before creating workflow, think through:

1. **Understand current workflow:**
   - Email monitoring (every 30s)
   - Source detection (8 sources: rengøring.nu, Leadpoint, Netberrau, etc.)
   - Lead creation (4 methods: email monitoring, manual, from email thread, Billy import)
   - Workflow execution (immediate actions, task creation, calendar events)

2. **Identify workflow steps:**
   - Email arrives → EmailMonitorService detects
   - detectLeadSourceIntelligent() analyzes (from domain, subject, body)
   - createLeadInDatabase() with metadata
   - executeImmediateActions() based on source workflow
   - Create tasks, calendar events, notifications

3. **Follow existing patterns:**
   - Use WorkflowAutomationService.processLeadWorkflow()
   - Follow source-specific workflows (priority, responseTime)
   - Create Billy customer if confidence > 95%
   - Execute immediate actions (required + suggested)

## CODEBASE PATTERNS (Follow These Exactly)

### Example: Workflow Automation Service

```typescript
// server/workflow-automation.ts
export class WorkflowAutomationService {
  async processLeadWorkflow(emailData: {
    emailId: string;
    threadId: string;
    subject: string;
    from: string;
    to?: string;
    body: string;
  }): Promise<WorkflowResult> {
    // 1. Intelligent source detection
    const sourceDetection = detectLeadSourceIntelligent({
      from: emailData.from,
      to: "",
      subject: emailData.subject,
      body: emailData.body,
    });

    // 2. Get workflow for this source
    const workflow = getWorkflowFromDetection(sourceDetection);

    // 3. Create lead in database
    const leadId = await this.createLeadInDatabase(
      emailData,
      sourceDetection,
      userId
    );

    // 4. Execute immediate actions
    await this.executeImmediateActions(leadId, workflow);

    return { success: true, leadId };
  }
}
```

### Example: Source Detection

```typescript
// server/lead-source-detector.ts
export function detectLeadSourceIntelligent(data: {
  from: string;
  to: string;
  subject: string;
  body: string;
}): SourceDetection {
  // Analyze from domain, subject keywords, body patterns
  // Return: { source, confidence, reasoning }
}
```

### Example: Lead Creation

```typescript
// server/db.ts or server/lead-db.ts
export async function createLead(data: {
  userId: number;
  name: string;
  email: string;
  phone?: string;
  source: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
  metadata?: Record<string, any>;
}): Promise<number> {
  // Create lead with status="new"
  // Link to email thread via metadata
}
```

## IMPLEMENTATION STEPS

1. **Analyze current workflow:**
   - Read `server/workflow-automation.ts`
   - Understand source detection logic
   - Review workflow execution patterns

2. **Identify improvements:**
   - Check for missing source workflows
   - Verify error handling
   - Ensure idempotency

3. **Create or improve workflow:**
   - Add new source workflows if needed
   - Improve source detection accuracy
   - Enhance immediate actions
   - Add task creation logic

4. **Test workflow:**
   - Test email monitoring
   - Test source detection
   - Test lead creation
   - Test workflow execution

## VERIFICATION CHECKLIST

After creating workflow, verify:

- [ ] Email monitoring detects new emails
- [ ] Source detection works for all 8 sources
- [ ] Lead creation works (all 4 methods)
- [ ] Workflow execution creates tasks
- [ ] Calendar events created when needed
- [ ] Billy customer created if confidence > 95%
- [ ] Error handling covers all cases
- [ ] Idempotency checks prevent duplicates

## OUTPUT FORMAT

Provide workflow implementation:

```markdown
# Lead Workflow Created/Improved

**Date:** 2025-11-16
**Status:** [COMPLETE / IN PROGRESS]

## Workflow Analysis

- **Current Sources:** [List of 8 sources]
- **Workflow Steps:** [List of steps]
- **Improvements Made:** [List of improvements]

## Implementation

- ✅ [Component 1] - [Status]
- ✅ [Component 2] - [Status]
- 🚧 [Component 3] - [In progress]

## Testing

- ✅ [Test 1] - [Result]
- ✅ [Test 2] - [Result]

## Next Steps

1. [Next action 1]
2. [Next action 2]
```

## GUIDELINES

- **Follow existing patterns:** Use WorkflowAutomationService
- **Source-specific workflows:** Each source has priority and responseTime
- **Error handling:** Handle all error cases gracefully
- **Idempotency:** Prevent duplicate leads
- **Testing:** Test all workflow paths
- **Documentation:** Update docs with workflow changes

---

**CRITICAL:** Start by reading existing workflow code, then create or improve the workflow based on requirements.
