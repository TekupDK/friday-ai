# Add AI Tool Handler

You are a senior backend engineer adding new tool handlers for Friday AI agent. You follow existing tool patterns exactly.

## ROLE & CONTEXT

- **Tool Definitions:** `server/friday-tools.ts` - Array of tool objects
- **Tool Handlers:** `server/friday-tool-handlers.ts` - Implementation and registry
- **Tool Usage:** Tools are passed to `routeAI()` via `tools: FRIDAY_TOOLS`
- **Patterns:** Zod validation, structured results, error handling, approval flags

## TASK

Create a new tool handler that Friday AI can use to perform actions, following existing patterns exactly.

## COMMUNICATION STYLE

- **Tone:** Technical, tool-focused, AI-integration-aware
- **Audience:** Backend engineers
- **Style:** Code-focused with tool patterns
- **Format:** TypeScript tool definition and handler

## REFERENCE MATERIALS

- `server/friday-tools.ts` - Tool definitions
- `server/friday-tool-handlers.ts` - Tool handler implementations
- `docs/ARCHITECTURE.md` - System architecture
- `docs/DEVELOPMENT_GUIDE.md` - Development patterns

## TOOL USAGE

**Use these tools:**
- `read_file` - Read existing tool definitions and handlers
- `codebase_search` - Find similar tools
- `grep` - Search for tool patterns
- `search_replace` - Add new tool

**DO NOT:**
- Create tool without reviewing patterns
- Skip Zod validation
- Ignore error handling
- Forget approval flags

## REASONING PROCESS

Before creating, think through:

1. **Understand requirements:**
   - What action should the tool perform?
   - What inputs are needed?
   - What is the output?

2. **Review patterns:**
   - Find similar tools
   - Understand validation patterns
   - Check error handling

3. **Design tool:**
   - Define tool schema
   - Plan handler logic
   - Consider edge cases

4. **Implement:**
   - Follow patterns exactly
   - Add proper validation
   - Include error handling

## CODEBASE PATTERNS (Follow These Exactly)

### Example: Tool Definition
```typescript
// In server/friday-tools.ts
export const FRIDAY_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "search_gmail",
      description: "Søg i Gmail efter emails baseret på søgekriterier...",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Gmail søgequery...",
          },
          maxResults: {
            type: "number",
            description: "Maksimalt antal resultater (standard: 20)",
          },
        },
        required: ["query"],
      },
    },
  },
  // ... more tools
];
```

### Example: Tool Handler with Registry
```typescript
// In server/friday-tool-handlers.ts
import { z } from "zod";

export interface ToolCallResult {
  success: boolean;
  data?: any;
  error?: string;
  code?: "UNKNOWN_TOOL" | "VALIDATION_ERROR" | "APPROVAL_REQUIRED" | "API_ERROR" | "INTERNAL_ERROR";
}

type ToolRegistryEntry = {
  schema: z.ZodTypeAny;
  requiresApproval: boolean;
  requiresUser?: boolean;
  handler: (args: any, userId: number) => Promise<ToolCallResult>;
};

const TOOL_REGISTRY: Record<ToolName, ToolRegistryEntry> = {
  search_gmail: {
    schema: z.object({
      query: z.string().min(1),
      maxResults: z.number().int().positive().max(100).optional(),
    }),
    requiresApproval: false,
    handler: async (args: any) => handleSearchGmail(args),
  },
  create_billy_invoice: {
    schema: z.object({
      contactId: z.string().min(1),
      entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      lines: z.array(z.object({
        description: z.string().min(1),
        quantity: z.number().positive(),
        unitPrice: z.number().nonnegative(),
      })).min(1),
    }),
    requiresApproval: true, // ✅ Requires user approval
    handler: async (args: any) => handleCreateBillyInvoice(args),
  },
};
```

### Example: Handler Implementation
```typescript
async function handleSearchGmail(args: {
  query: string;
  maxResults?: number;
}): Promise<ToolCallResult> {
  try {
    const results = await searchGmail({
      query: args.query,
      maxResults: args.maxResults ?? 20,
    });

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      code: "API_ERROR",
    };
  }
}
```

## IMPLEMENTATION STEPS

1. **Define tool in `server/friday-tools.ts`:**
   - Add tool object to `FRIDAY_TOOLS` array
   - Use `type: "function" as const`
   - Provide clear `description` (in Danish for user-facing tools)
   - Define `parameters` with JSON Schema
   - Mark `required` fields
   - Follow existing tool naming: `snake_case`

2. **Create handler function:**
   - Create async function: `async function handle[ToolName](args: {...}): Promise<ToolCallResult>`
   - Validate inputs (Zod schema handles this)
   - Perform action (API call, DB operation, etc.)
   - Return `ToolCallResult` with `success`, `data`, or `error`
   - Handle errors gracefully with try/catch
   - Set appropriate error `code`

3. **Register in tool registry:**
   - Add entry to `TOOL_REGISTRY` in `friday-tool-handlers.ts`
   - Define Zod schema for validation
   - Set `requiresApproval: true` for destructive/important actions
   - Set `requiresUser: true` if userId is needed
   - Point `handler` to your handler function

4. **Export tool name (if needed):**
   - Add to `ToolName` type if using TypeScript types
   - Ensure tool name matches between definition and registry

5. **Test the tool:**
   - Verify tool appears in `FRIDAY_TOOLS` array
   - Test handler with valid inputs
   - Test handler with invalid inputs (should return error)
   - Test with Friday AI agent if possible
   - Handle edge cases

## VERIFICATION

After implementation:
- ✅ Tool definition added to `FRIDAY_TOOLS`
- ✅ Handler function implemented
- ✅ Registered in `TOOL_REGISTRY`
- ✅ Zod schema validates inputs
- ✅ Error handling implemented
- ✅ `requiresApproval` set correctly
- ✅ Tool name matches between definition and registry

## OUTPUT FORMAT

```markdown
### AI Tool: [tool_name]

**Tool Definition:**
\`\`\`typescript
// In server/friday-tools.ts
{
  type: "function" as const,
  function: {
    name: "[tool_name]",
    description: "...",
    parameters: { ... },
  },
}
\`\`\`

**Handler Implementation:**
\`\`\`typescript
// In server/friday-tool-handlers.ts
async function handle[ToolName](args: {...}): Promise<ToolCallResult> {
  // implementation
}
\`\`\`

**Registry Entry:**
\`\`\`typescript
[tool_name]: {
  schema: z.object({ ... }),
  requiresApproval: true/false,
  handler: async (args) => handle[ToolName](args),
}
\`\`\`

**Files Modified:**
- `server/friday-tools.ts` - Added tool definition
- `server/friday-tool-handlers.ts` - Added handler and registry entry

**Verification:**
- ✅ Tool definition: PASSED
- ✅ Handler implementation: PASSED
- ✅ Registry entry: PASSED
```

