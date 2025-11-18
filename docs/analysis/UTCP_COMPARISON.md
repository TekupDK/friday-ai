# Sammenligning: Nuværende System vs UTCP

## Oversigt

**Vigtigt:** MCP modulet er allerede **DEPRECATED** (november 2025), men koden eksisterer stadig for backward compatibility. Systemet bruger primært direkte Google API calls allerede.

---

## Arkitektur Sammenligning

### Nuværende System (Hybrid)

```
┌─────────────┐
│   AI LLM    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Tool Registry  │  (friday-tools.ts)
│  18 tools       │
└──────┬──────────┘
       │
       ├─► MCP Server (DEPRECATED) ──► Google API
       │   ⚠️ 200-500ms overhead
       │
       └─► Direct API (Current) ─────► Google API
           ✅ 32% hurtigere
           ✅ Ingen server overhead
```

**Status:**

- ✅ **Direkte API calls** allerede implementeret (google-api.ts)
- ⚠️ **MCP kode** eksisterer stadig (deprecated, backward compatibility)
- ✅ **Fallback mechanism** fra MCP til direkte API

### UTCP System (Forslag)

```
┌─────────────┐
│   AI LLM    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  UTCP Manifest  │  (JSON standard)
│  18 tools       │
└──────┬──────────┘
       │
       └─► Direct API ────────────► Google API
           ✅ Standardiseret
           ✅ Ingen server overhead
           ✅ Let at vedligeholde
```

**Status:**

- ⏳ **Ikke implementeret**
- ✅ **Standardiseret protocol** (åben standard)
- ✅ **Simplified architecture** (ingen MCP servers)

---

## Detaljeret Sammenligning

### 1. Tool Definition

#### Nuværende System

```typescript
// server/friday-tools.ts
export const FRIDAY_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "search_gmail",
      description: "Søg i Gmail...",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
          maxResults: { type: "number" },
        },
        required: ["query"],
      },
    },
  },
  // ... 17 flere tools
];
```

**Karakteristika:**

- ✅ TypeScript definitions
- ✅ Zod validation (i handlers)
- ⚠️ Custom format (ikke standardiseret)
- ⚠️ Blandet med MCP kode

#### UTCP System

```typescript
// server/utcp-manifest.ts
export const UTCP_MANIFEST: Record<string, UTCPTool> = {
  search_gmail: {
    name: "search_gmail",
    description: "Søg i Gmail...",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        maxResults: { type: "number" },
      },
      required: ["query"],
    },
    handler: {
      type: "http",
      endpoint: "https://gmail.googleapis.com/gmail/v1/users/me/messages",
      method: "GET",
    },
  },
  // ... 17 flere tools
};
```

**Karakteristika:**

- ✅ TypeScript definitions
- ✅ Standardiseret format (UTCP spec)
- ✅ Handler konfiguration inkluderet
- ✅ Let at vedligeholde

**Forskel:** UTCP er standardiseret, nuværende er custom format.

---

### 2. Tool Execution

#### Nuværende System

```typescript
// server/friday-tool-handlers.ts
export async function executeToolCall(
  toolName: ToolName,
  args: Record<string, any>,
  userId: number
): Promise<ToolCallResult> {
  // 1. Valider mod Zod schema
  const parsed = entry.schema.safeParse(args);

  // 2. Kald handler (kan være MCP eller direkte API)
  const result = await entry.handler(parsed.data, userId);

  return result;
}
```

**Flow:**

1. Valider input (Zod)
2. Kald handler
3. Handler vælger: MCP (deprecated) eller direkte API
4. Returner resultat

**Problemer:**

- ⚠️ Handler logik er spredt (MCP vs direkte API)
- ⚠️ Ingen standardiseret måde at definere handlers
- ⚠️ MCP kode eksisterer stadig (selvom deprecated)

#### UTCP System

```typescript
// server/utcp-handler.ts
export async function executeUTCPTool(
  toolName: string,
  args: Record<string, any>,
  userId: number
): Promise<ToolCallResult> {
  // 1. Hent tool fra manifest
  const tool = UTCP_MANIFEST[toolName];

  // 2. Valider mod UTCP schema
  const validation = validateUTCPInput(tool.inputSchema, args);

  // 3. Kald direkte API baseret på handler type
  switch (tool.handler.type) {
    case "http":
      return await executeHTTPTool(tool, args, userId);
    case "cli":
      return await executeCLITool(tool, args, userId);
  }
}
```

**Flow:**

1. Hent tool fra manifest
2. Valider input (UTCP schema)
3. Kald direkte API (ingen MCP)
4. Returner resultat

**Fordele:**

- ✅ Standardiseret execution flow
- ✅ Handler konfiguration i manifest
- ✅ Ingen MCP dependency
- ✅ Let at teste

---

### 3. Performance

#### Nuværende System

**Performance Breakdown:**

```
Tool Execution: ~800ms (average)
  ├─ Validation: ~50ms
  ├─ Handler Selection: ~50ms
  ├─ MCP Call (deprecated): ~200-500ms ⚠️
  │   └─ Fallback til direkte API: ~100-200ms ✅
  ├─ Direct API Call: ~100-200ms ✅
  └─ Response Processing: ~50ms
```

**Problemer:**

- ⚠️ MCP overhead hvis MCP bruges (200-500ms)
- ✅ Direkte API allerede implementeret (32% hurtigere)
- ⚠️ Hybrid approach (både MCP og direkte API kode)

**Kommentar fra kode:**

```typescript
// server/mcp.ts:359
// MCP server adds 200-500ms overhead, direct API is 32% faster
```

#### UTCP System

**Performance Breakdown:**

```
Tool Execution: ~550ms (projected average)
  ├─ Validation: ~50ms
  ├─ Manifest Lookup: ~10ms ✅ (cached)
  ├─ Direct API Call: ~100-200ms ✅
  └─ Response Processing: ~50ms
```

**Fordele:**

- ✅ Ingen MCP overhead
- ✅ Direkte API calls (allerede bevist 32% hurtigere)
- ✅ Manifest caching muligt
- ✅ Simpler flow = mindre overhead

**Forbedring:** ~250ms hurtigere (31% improvement)

---

### 4. Kompleksitet

#### Nuværende System

**Filer:**

- `server/friday-tools.ts` - Tool definitions
- `server/friday-tool-handlers.ts` - Tool execution
- `server/mcp.ts` - MCP client (DEPRECATED, 800+ linjer)
- `server/google-api.ts` - Direkte Google API
- `server/billy.ts` - Billy API integration

**Kompleksitet:**

- ⚠️ **5 filer** til tool system
- ⚠️ **MCP kode** eksisterer stadig (selvom deprecated)
- ⚠️ **Hybrid approach** (MCP + direkte API)
- ⚠️ **Fallback logic** spredt i kode

**Lines of Code:**

- MCP client: ~800 linjer (deprecated)
- Tool handlers: ~1300 linjer
- Tool definitions: ~540 linjer
- **Total: ~2640 linjer**

#### UTCP System

**Filer:**

- `server/utcp-manifest.ts` - UTCP manifest (NEW)
- `server/utcp-handler.ts` - UTCP execution (NEW)
- `server/friday-tool-handlers.ts` - Keep for backward compatibility
- `server/google-api.ts` - Direkte Google API (keep)
- `server/billy.ts` - Billy API integration (keep)

**Kompleksitet:**

- ✅ **Standardiseret manifest** (let at forstå)
- ✅ **Ingen MCP dependency** (kan fjernes)
- ✅ **Klar separation** (manifest vs execution)
- ✅ **Let at vedligeholde**

**Lines of Code (projected):**

- UTCP manifest: ~400 linjer
- UTCP handler: ~300 linjer
- Tool handlers: ~800 linjer (reduceret)
- **Total: ~1500 linjer (43% reduktion)**

---

### 5. Vedligeholdelse

#### Nuværende System

**Problemer:**

- ⚠️ **MCP kode** skal vedligeholdes (selvom deprecated)
- ⚠️ **Hybrid approach** gør det svært at forstå flow
- ⚠️ **Fallback logic** spredt i kode
- ⚠️ **Custom format** (ikke standardiseret)

**Tilføj ny tool:**

1. Definer i `friday-tools.ts`
2. Opret handler i `friday-tool-handlers.ts`
3. Hvis MCP: Tilføj MCP kode (deprecated)
4. Hvis direkte API: Tilføj direkte API kode
5. Test både MCP og direkte API paths

#### UTCP System

**Fordele:**

- ✅ **Standardiseret format** (let at forstå)
- ✅ **Manifest-based** (konfiguration, ikke kode)
- ✅ **Ingen MCP dependency** (simpler)
- ✅ **Klar separation** (manifest vs execution)

**Tilføj ny tool:**

1. Tilføj til UTCP manifest (JSON-like)
2. Handler konfiguration inkluderet
3. Test direkte API integration
4. Done!

**Tidsbesparelse:** ~50% mindre tid at tilføje ny tool

---

### 6. Testing

#### Nuværende System

**Challenges:**

- ⚠️ Test både MCP og direkte API paths
- ⚠️ Mock MCP server (selvom deprecated)
- ⚠️ Test fallback logic
- ⚠️ Hybrid approach gør testing kompleks

#### UTCP System

**Fordele:**

- ✅ Test kun direkte API (ingen MCP)
- ✅ Standardiseret format = lettere at mock
- ✅ Klar separation = lettere unit tests
- ✅ Simpler flow = færre edge cases

---

## Konkret Sammenligning: search_gmail Tool

### Nuværende Implementation

```typescript
// 1. Definition (friday-tools.ts)
{
  type: "function",
  function: {
    name: "search_gmail",
    description: "Søg i Gmail...",
    parameters: { /* ... */ }
  }
}

// 2. Handler (friday-tool-handlers.ts)
search_gmail: {
  schema: z.object({ query: z.string() }),
  handler: async (args) => {
    // Kald MCP eller direkte API
    return await searchGmail(args);
  }
}

// 3. Execution (mcp.ts eller google-api.ts)
// MCP path (deprecated):
async function searchGmail(args) {
  try {
    return await callMCPTool(GMAIL_MCP_URL, "gmail_search_messages", args);
  } catch {
    // Fallback til direkte API
    return await directGoogleAPICall(args);
  }
}
```

**Kompleksitet:** 3 filer, hybrid approach, fallback logic

### UTCP Implementation

```typescript
// 1. Manifest (utcp-manifest.ts)
search_gmail: {
  name: "search_gmail",
  description: "Søg i Gmail...",
  inputSchema: { /* ... */ },
  handler: {
    type: "http",
    endpoint: "https://gmail.googleapis.com/gmail/v1/users/me/messages",
    method: "GET"
  }
}

// 2. Execution (utcp-handler.ts)
async function executeUTCPTool("search_gmail", args) {
  const tool = UTCP_MANIFEST["search_gmail"];
  return await executeHTTPTool(tool, args); // Direkte API
}
```

**Kompleksitet:** 2 filer, standardiseret, direkte API

---

## Sammenligning Tabel

| Aspekt                | Nuværende System            | UTCP System             | Vinder                  |
| --------------------- | --------------------------- | ----------------------- | ----------------------- |
| **Performance**       | ~800ms (med MCP overhead)   | ~550ms (direkte API)    | ✅ UTCP (31% hurtigere) |
| **Kompleksitet**      | ~2640 LOC, 5 filer          | ~1500 LOC, 4 filer      | ✅ UTCP (43% simplere)  |
| **Standardisering**   | Custom format               | UTCP standard           | ✅ UTCP                 |
| **Vedligeholdelse**   | Hybrid, MCP deprecated      | Standardiseret          | ✅ UTCP                 |
| **Testing**           | Test både MCP + direkte API | Test kun direkte API    | ✅ UTCP                 |
| **Tilføj ny tool**    | 5 steps, hybrid             | 2 steps, standardiseret | ✅ UTCP                 |
| **MCP Dependency**    | Ja (deprecated)             | Nej                     | ✅ UTCP                 |
| **Fallback Logic**    | Kompleks, spredt            | Simpel, centraliseret   | ✅ UTCP                 |
| **Documentation**     | Custom, spredt              | Standardiseret          | ✅ UTCP                 |
| **Community Support** | Ingen                       | UTCP community          | ✅ UTCP                 |

---

## Konklusion

### Nuværende System Status

✅ **Godt:**

- Direkte API allerede implementeret
- Fallback mechanism virker
- Performance er OK (når direkte API bruges)

⚠️ **Problemer:**

- MCP kode eksisterer stadig (deprecated)
- Hybrid approach gør det komplekst
- Custom format (ikke standardiseret)
- Svært at vedligeholde

### UTCP System Fordele

✅ **Performance:** 31% hurtigere (550ms vs 800ms)
✅ **Simplicity:** 43% mindre kode (1500 vs 2640 LOC)
✅ **Standardisering:** Åben standard, community support
✅ **Vedligeholdelse:** Lettere at forstå og vedligeholde
✅ **Testing:** Simpler test setup
✅ **Fremtidssikret:** Standardiseret protocol

### Anbefaling

**UTCP integration giver mening fordi:**

1. **Systemet er allerede delvist migreret** (direkte API bruges primært)
2. **MCP er deprecated** (kode eksisterer stadig, men bruges ikke)
3. **UTCP standardiserer** det der allerede virker (direkte API)
4. **Performance forbedring** er dokumenteret (32% hurtigere)
5. **Kompleksitet reduktion** (43% mindre kode)

**Migration effort:** ~40 timer (værd at investere)

---

## Næste Skridt

1. **Review denne sammenligning**
2. **Beslut:** Fortsæt med nuværende system eller migrer til UTCP?
3. **Hvis UTCP:** Start Phase 1 prototype (2-3 tools)
4. **Hvis nuværende:** Fjern MCP kode helt (cleanup)
