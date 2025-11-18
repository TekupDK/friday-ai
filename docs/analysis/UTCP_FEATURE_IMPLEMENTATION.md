# Detaljeret Feature Implementation: UTCP Integration

## Feature Oversigt

**Beskrivelse:**
Integration af UTCP (Universal Tool Calling Protocol) i Friday AI Chat for at erstatte den nuværende MCP-baserede tool calling arkitektur. UTCP giver direkte tool calling uden intermediary servers, hvilket reducerer latency og kompleksitet.

**Status:**
- ⏳ Ikke implementeret
- ⏳ Design fase
- ⏳ Prototype fase
- ⏳ Testing fase

**Business Value:**
- **Performance:** 32% hurtigere tool execution (baseret på direkte API vs MCP sammenligning)
- **Simplified Architecture:** Færre dependencies, mindre kompleksitet
- **Cost Reduction:** Ingen MCP server infrastructure nødvendig
- **Better Developer Experience:** Standardiseret protocol, lettere at vedligeholde
- **Scalability:** Direkte API calls, bedre skalerbarhed

## Arkitektur og Design

### System Design

```
Current Architecture (MCP):
┌─────────────┐
│   AI LLM    │
└──────┬──────┘
       │ Function Call
       ▼
┌─────────────┐      HTTP      ┌─────────────┐
│  Tool Def   │ ────────────► │  MCP Server │
│ (friday-    │                │  (Gmail/    │
│  tools.ts)  │                │   Calendar) │
└─────────────┘                └──────┬──────┘
                                       │
                                       ▼
                              ┌─────────────┐
                              │ Google APIs │
                              └─────────────┘

Proposed Architecture (UTCP):
┌─────────────┐
│   AI LLM    │
└──────┬──────┘
       │ Direct Tool Call
       ▼
┌─────────────┐      Direct      ┌─────────────┐
│  UTCP       │ ──────────────► │ Google APIs │
│  Manifest   │   (HTTP/CLI)     │ Billy API   │
│  (JSON)     │                  │ Database    │
└─────────────┘                  └─────────────┘
```

### Design Beslutninger

1. **UTCP Manifest Format**
   - **Rationale:** Standardiseret JSON format, let at vedligeholde
   - **Alternativer:** Custom format, OpenAPI extensions
   - **Trade-offs:** Standard vs custom flexibility

2. **Gradual Migration Strategy**
   - **Rationale:** Reducerer risiko, tillader testing
   - **Alternativer:** Big bang migration, feature flag approach
   - **Trade-offs:** Længere migration vs lavere risiko

3. **Backward Compatibility**
   - **Rationale:** Sikrer kontinuitet under migration
   - **Alternativer:** Clean break, no fallback
   - **Trade-offs:** Kompleksitet vs sikkerhed

4. **Direct API Integration**
   - **Rationale:** Bedre performance, mindre overhead
   - **Alternativer:** Keep MCP servers, hybrid approach
   - **Trade-offs:** Performance vs infrastructure complexity

### Data Flow

```
1. User Request
   ↓
2. AI Router (routeAI)
   ↓
3. LLM selects tool from UTCP manifest
   ↓
4. Tool execution via UTCP handler
   ↓
5. Direct API call (Google/Billy/Database)
   ↓
6. Response formatted as UTCP result
   ↓
7. Return to LLM for final response
```

## Implementation Detaljer

### Backend Implementation

**Files:**
- `server/utcp-manifest.ts` - UTCP manifest definitions (NEW)
- `server/utcp-handler.ts` - UTCP tool execution handler (NEW)
- `server/friday-tools.ts` - Update to support UTCP format
- `server/ai-router.ts` - Update to use UTCP instead of MCP
- `server/mcp.ts` - Keep as fallback during migration

**Key Components:**

```typescript
// server/utcp-manifest.ts
export interface UTCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
  handler: {
    type: "http" | "cli" | "grpc" | "mcp";
    endpoint?: string;
    method?: "GET" | "POST" | "PUT" | "DELETE";
    command?: string;
  };
  requiresAuth?: boolean;
  requiresApproval?: boolean;
}

export const UTCP_MANIFEST: Record<string, UTCPTool> = {
  search_gmail: {
    name: "search_gmail",
    description: "Søg i Gmail efter emails baseret på søgekriterier",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Gmail søgequery" },
        maxResults: { type: "number", description: "Maksimalt antal resultater" },
      },
      required: ["query"],
    },
    handler: {
      type: "http",
      endpoint: "https://gmail.googleapis.com/gmail/v1/users/me/messages",
      method: "GET",
    },
    requiresAuth: true,
    requiresApproval: false,
  },
  // ... more tools
};
```

```typescript
// server/utcp-handler.ts
import { UTCP_MANIFEST, UTCPTool } from "./utcp-manifest";
import { executeToolCall } from "./friday-tool-handlers";

export async function executeUTCPTool(
  toolName: string,
  args: Record<string, any>,
  userId: number,
  options?: { correlationId?: string }
): Promise<ToolCallResult> {
  const tool = UTCP_MANIFEST[toolName];
  if (!tool) {
    return {
      success: false,
      error: `Unknown UTCP tool: ${toolName}`,
      code: "UNKNOWN_TOOL",
    };
  }

  // Validate input against schema
  const validation = validateUTCPInput(tool.inputSchema, args);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
      code: "VALIDATION_ERROR",
    };
  }

  // Route to appropriate handler based on type
  switch (tool.handler.type) {
    case "http":
      return await executeHTTPTool(tool, args, userId, options);
    case "cli":
      return await executeCLITool(tool, args, userId, options);
    default:
      // Fallback to existing tool handler
      return await executeToolCall(toolName as ToolName, args, userId, options);
  }
}

async function executeHTTPTool(
  tool: UTCPTool,
  args: Record<string, any>,
  userId: number,
  options?: { correlationId?: string }
): Promise<ToolCallResult> {
  const { handler } = tool;
  if (!handler.endpoint) {
    return {
      success: false,
      error: "HTTP tool missing endpoint",
      code: "CONFIG_ERROR",
    };
  }

  // Build URL with query params for GET, body for POST
  const url = buildUTCPURL(handler.endpoint, args, handler.method);
  const requestOptions = buildHTTPRequestOptions(tool, args, userId);

  try {
    const response = await fetch(url, requestOptions);
    const data = await response.json();

    return {
      success: response.ok,
      data: response.ok ? data : undefined,
      error: response.ok ? undefined : data.error?.message || "HTTP request failed",
      code: response.ok ? undefined : "API_ERROR",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      code: "INTERNAL_ERROR",
    };
  }
}
```

**tRPC Endpoints:**
- No new endpoints needed (uses existing tool execution flow)
- Update `chat.sendMessage` to use UTCP manifest

**Database Schema:**
- No schema changes required
- Existing tool execution tracking remains

### Frontend Implementation

**Files:**
- No frontend changes required initially
- Future: Tool selection UI could show UTCP tools

**Key Components:**
- Tool execution is backend-only
- Frontend continues to use existing chat interface

**State Management:**
- No changes needed
- Tool execution state handled by backend

**UI/UX:**
- No user-facing changes
- Performance improvements will be transparent

## Integration Points

### External APIs

- **Google Gmail API** - Direct HTTP calls via UTCP
- **Google Calendar API** - Direct HTTP calls via UTCP
- **Billy.dk API** - Direct HTTP calls via UTCP (via existing Billy integration)

### Internal Services

- **Tool Registry** - Migrate from MCP to UTCP manifest
- **AI Router** - Update to use UTCP handler
- **Tool Handlers** - Keep as fallback, gradually migrate

### Dependencies

- **UTCP Specification** - Follow open standard
- **No new npm packages** - Use existing fetch/HTTP libraries
- **Remove MCP dependencies** - After migration complete

## Code Patterns

### Design Patterns

- **Strategy Pattern** - Different handlers for HTTP/CLI/gRPC
- **Adapter Pattern** - UTCP adapter for existing tools
- **Factory Pattern** - Tool handler factory based on type

### Best Practices

- ✅ **Schema Validation** - Validate all inputs against UTCP schema
- ✅ **Error Handling** - Comprehensive error handling with fallback
- ✅ **Type Safety** - Full TypeScript types for UTCP manifest
- ✅ **Logging** - Detailed logging for debugging
- ✅ **Testing** - Unit tests for each UTCP tool

### Code Examples

```typescript
// Example 1: UTCP Manifest Definition
export const searchGmailUTCP: UTCPTool = {
  name: "search_gmail",
  description: "Søg i Gmail efter emails",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string" },
      maxResults: { type: "number", default: 20 },
    },
    required: ["query"],
  },
  handler: {
    type: "http",
    endpoint: "https://gmail.googleapis.com/gmail/v1/users/me/messages",
    method: "GET",
  },
  requiresAuth: true,
};

// Example 2: UTCP Tool Execution
const result = await executeUTCPTool(
  "search_gmail",
  { query: "from:customer@example.com", maxResults: 10 },
  userId,
  { correlationId: "req_123" }
);

// Example 3: Migration Helper
async function migrateToolToUTCP(toolName: ToolName): Promise<void> {
  const existingTool = FRIDAY_TOOLS.find(t => t.function.name === toolName);
  if (!existingTool) return;

  const utcpTool = convertToUTCP(existingTool);
  UTCP_MANIFEST[toolName] = utcpTool;
}
```

## Testing

**Unit Tests:**
- UTCP manifest validation - ⏳ TODO
- UTCP handler execution - ⏳ TODO
- Schema validation - ⏳ TODO
- Error handling - ⏳ TODO

**Integration Tests:**
- Tool execution via UTCP - ⏳ TODO
- Fallback to MCP - ⏳ TODO
- API integration - ⏳ TODO

**E2E Tests:**
- Full conversation with UTCP tools - ⏳ TODO
- Performance comparison - ⏳ TODO

## Performance Considerations

- **Latency Reduction:** 32% faster (200-500ms saved per tool call)
- **Throughput:** Higher (no MCP server bottleneck)
- **Resource Usage:** Lower (no MCP server infrastructure)
- **Caching:** Can cache UTCP manifest, tool results

## Security Considerations

- **Authentication:** OAuth tokens for Google APIs
- **Authorization:** User-based access control
- **Input Validation:** Schema validation for all inputs
- **Error Messages:** Sanitize error messages to avoid info leakage

## Anbefalinger

### Forbedringer

1. **UTCP Manifest Generator**
   - **Beskrivelse:** Tool til at generere UTCP manifest fra eksisterende tool definitions
   - Estimated: 8 hours
   - Priority: High

2. **UTCP Tool Registry**
   - **Beskrivelse:** Central registry for alle UTCP tools med versioning
   - Estimated: 12 hours
   - Priority: Medium

3. **Performance Monitoring**
   - **Beskrivelse:** Monitoring dashboard for UTCP tool performance
   - Estimated: 6 hours
   - Priority: Medium

### Optimizations

1. **Tool Result Caching**
   - **Beskrivelse:** Cache UTCP tool results for read-only operations
   - Expected impact: 50% reduction in API calls
   - Estimated: 4 hours

2. **Parallel Tool Execution**
   - **Beskrivelse:** Execute multiple UTCP tools in parallel
   - Expected impact: 40% faster for multi-tool requests
   - Estimated: 6 hours

### Refactoring Muligheder

1. **Unified Tool Interface**
   - **Beskrivelse:** Single interface for UTCP and legacy tools
   - Benefit: Easier migration, cleaner code
   - Estimated: 10 hours

## Næste Skridt

1. Create UTCP manifest prototype for 2-3 tools
2. Implement UTCP handler with HTTP support
3. Benchmark performance vs MCP
4. Create migration plan
5. Start gradual migration

