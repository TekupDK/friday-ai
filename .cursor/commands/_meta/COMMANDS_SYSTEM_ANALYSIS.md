# Commands System Analysis - Cursor IDE

**Dato:** 2025-11-16  
**Scope:** Hele `.cursor/commands/` mappen og Cursor IDE integration  
**Status:** 🔄 UNDER ANALYSE

---

## 📊 EXECUTIVE SUMMARY

**Problem:** Commands systemet har inkonsistenser i hvordan det refererer til chat session access, og nogle commands har misvisende instruktioner om hvordan de fungerer i Cursor IDE.

**Løsning:** Identificer alle issues, fix bugs, standardiser chat session access patterns, og forbedre commands til at fungere korrekt i Cursor IDE.

---

## 🔍 IDENTIFICEREDE ISSUES

### 1. CHAT SESSION ACCESS - KRITISK ISSUE

**Problem:**
- Nogle commands refererer til `getConversationMessages(conversationId)` fra `server/db.ts`
- Dette virker IKKE i Cursor commands context
- Commands har direkte adgang til Cursor chat session, ikke Friday AI Chat database

**Affected Commands:**
- `ai/analyze-chat-prompt.md` - ✅ FIXET
- `chat/laes-chat-fra-database.md` - OK (specifikt for database)
- `chat/analyser-chat-sessioner.md` - OK (specifikt for database)
- Andre commands der refererer til chat session?

**Fix:**
- Klarificer at Cursor commands har direkte adgang til chat session
- Fjern misvisende referencer til server funktioner
- Tilføj klar instruktion om Cursor chat session access

---

### 2. INKONSISTENS I CHAT SESSION READING

**Problem:**
- Nogle commands siger "læs hele chat sessionen"
- Men specificerer ikke HVORDAN eller HVAD de mener
- Forvirring mellem Cursor chat og Friday AI Chat database

**Affected Commands:**
- `core/session-engine.md` - Har CHAT SESSION READING section ✅
- `core/developer-mode.md` - Har CHAT SESSION READING section ✅
- `chat/laes-chat-samtale.md` - Har CHAT SESSION READING section ✅
- Andre commands?

**Fix:**
- Standardiser CHAT SESSION READING section
- Klarificer at det er Cursor chat session (direkte adgang)
- Tilføj til alle relevante commands

---

### 3. MISVISENDE CODE EKSEMPLER

**Problem:**
- Nogle commands viser TypeScript imports der ikke virker i Cursor
- Eksempler på `getConversationMessages(conversationId)` som ikke kan kaldes direkte

**Affected Commands:**
- `ai/analyze-chat-prompt.md` - ✅ FIXET (fjernet misvisende eksempel)

**Fix:**
- Fjern alle misvisende code eksempler
- Tilføj kun eksempler der faktisk virker i Cursor context

---

### 4. MANGELENDE KLARHED OM CURSOR VS FRIDAY AI CHAT

**Problem:**
- Commands forvirrer Cursor chat session med Friday AI Chat database
- Ikke klar om hvornår man bruger hvad

**Fix:**
- Klarificer forskel i alle relevante commands
- PRIMARY: Cursor chat session (direkte adgang)
- SECONDARY: Friday AI Chat database (kun hvis specifikt nødvendigt)

---

### 5. INKONSISTENTE INSTRUKTIONER

**Problem:**
- Nogle commands siger "læs chat sessionen" uden at specificere HVORDAN
- Nogle commands mangler instruktioner om chat session reading

**Fix:**
- Tilføj standardiseret CHAT SESSION READING section
- Klar instruktion om direkte adgang til Cursor chat session

---

## 📋 HANDLINGSPLAN

### FASE 1: Identificer Alle Affected Commands

1. **Søg efter chat session referencer:**
   - Find alle commands der refererer til chat session
   - Find alle commands der refererer til `getConversationMessages`
   - Find alle commands der mangler chat session reading

2. **Kategoriser commands:**
   - Commands der skal læse Cursor chat session
   - Commands der skal læse Friday AI Chat database
   - Commands der ikke har brug for chat session

### FASE 2: Fix Chat Session Access

1. **Standardiser CHAT SESSION READING section:**
   - Tilføj til alle relevante commands
   - Klar instruktion om Cursor chat session access
   - Fjern misvisende referencer til server funktioner

2. **Fix misvisende instruktioner:**
   - Fjern referencer til `getConversationMessages` i Cursor context
   - Klarificer forskel mellem Cursor og Friday AI Chat
   - Tilføj korrekte instruktioner

### FASE 3: Forbedre Commands Kvalitet

1. **Tilføj manglende sections:**
   - CHAT SESSION READING hvor relevant
   - Klar instruktion om Cursor context
   - Praktiske eksempler

2. **Fjern bugs:**
   - Misvisende code eksempler
   - Forkerte referencer
   - Inkonsistente instruktioner

---

## 🔍 DETALJERET ANALYSE

### Commands Med Chat Session Referencer

**Tjekker alle commands...**

---

**Status:** ✅ FASE 1 STARTET - Fixer chat session access issues

---

## ✅ FASE 1: CHAT SESSION ACCESS FIXES

### Fixed Commands:
- ✅ `ai/analyze-chat-prompt.md` - Fixet med eksplicit Cursor chat session access
- ✅ `core/continue-conversation.md` - Tilføjet CHAT SESSION READING section
- ✅ `core/maintain-context.md` - Tilføjet CHAT SESSION READING section

### Commands Der Mangler Fix:
- ⏳ `chat/brug-chat-informationer.md` - Har CHAT SESSION READING, men skal verificeres
- ⏳ `chat/analyser-chat-kontekst.md` - Har CHAT SESSION READING, men skal verificeres
- ⏳ `chat/laes-chat-samtale.md` - Har CHAT SESSION READING, men skal verificeres
- ⏳ Andre commands der refererer til chat session?

### Commands OK (Database-specific):
- ✅ `chat/laes-chat-fra-database.md` - OK (specifikt for database)
- ✅ `chat/analyser-chat-sessioner.md` - OK (specifikt for database)

---

## 📋 ROOT COMMANDS DER SKAL FLYTES

Fra analyse: **~70 commands i root** der skal flyttes til mapper:

**Development commands:**
- `api-versioning.md` → `development/`
- `backup-database.md` → `development/`
- `cache-strategy.md` → `development/`
- `ci-cd-pipeline.md` → `development/`
- `data-migration.md` → `development/`
- `database-migration.md` → `development/`
- `deploy-to-production.md` → `development/`
- `deploy-to-staging.md` → `development/`
- `error-tracking.md` → `development/`
- `feature-flag.md` → `development/`
- `form-validation.md` → `development/`
- `git-workflow.md` → `development/`
- `health-check.md` → `development/`
- `input-sanitization.md` → `development/`
- `json-schema-validation.md` → `development/`
- `jwt-authentication.md` → `development/`
- `logging-setup.md` → `development/`
- `middleware-setup.md` → `development/`
- `migrate-database-schema.md` → `development/`
- `migration-strategy.md` → `development/`
- `monitor-api-performance.md` → `development/`
- `monitoring-setup.md` → `development/`
- `naming-conventions.md` → `development/`
- `notification-system.md` → `development/`
- `observability-setup.md` → `development/`
- `optimize-bundle-size.md` → `development/`
- `optimize-chromadb-queries.md` → `development/`
- `optimize-performance.md` → `development/`
- `optimize-trpc-query.md` → `development/`
- `optimize-ui-performance.md` → `development/`
- `pagination-implementation.md` → `development/`
- `permissions-system.md` → `development/`
- `plan-feature.md` → `development/`
- `query-optimization.md` → `development/`
- `rate-limit-config.md` → `development/`
- `search-implementation.md` → `development/`
- `security-headers.md` → `development/`
- `split-large-file.md` → `development/`
- `state-management.md` → `development/`
- `token-management.md` → `development/`
- `type-safety-improvement.md` → `development/`
- `update-dependencies.md` → `development/`
- `validate-inputs.md` → `development/`
- `version-management.md` → `development/`
- `webhook-handler.md` → `development/`
- `websocket-setup.md` → `development/`
- `xml-parsing.md` → `development/`
- `xss-prevention.md` → `development/`
- `zod-validation-patterns.md` → `development/`

**Core commands:**
- `start-work-immediately.md` → `core/` (hvis ikke allerede der)
- `forsaet-arbejde.md` → `core/` (hvis ikke allerede der)
- `forbedre-command.md` → `core/` eller `testing/`
- `konverter-chat-til-todos.md` → `chat/` (hvis ikke allerede der)
- `generate-todos-from-chat.md` → `chat/` (hvis ikke allerede der)
- `update-todo-status.md` → `core/` (hvis ikke allerede der)

**Testing commands:**
- `test-google-integration.md` → `testing/`

**Debugging commands:**
- `check-auth-flows.md` → `debugging/`
- `cleanup-dead-code.md` → `debugging/`

**Other:**
- `address-github-pr-comments.md` → `development/`
- `assert-invariants.md` → `development/`
- `automate-system-monitoring.md` → `development/`
- `batch-operations.md` → `development/`
- `benchmark-technology.md` → `development/`
- `build-optimization.md` → `development/`
- `doc-auto.md` → `development/`
- `estimate-todo-effort.md` → `core/`
- `example-with-hooks.md` → `development/`
- `generate-pr-description.md` → `development/`
- `improve-prompts-for-code.md` → `development/`
- `keyboard-shortcuts.md` → `development/`
- `kill-zombie-processes.md` → `debugging/`
- `lazy-loading.md` → `development/`
- `lint-fix.md` → `development/`
- `lint-suite.md` → `development/`
- `onboard-new-developer.md` → `development/`
- `risk-analysis.md` → `development/`
- `summarize-diff.md` → `development/`
- `visualize-architecture.md` → `development/`
- `yarn-migration.md` → `development/`
- `yield-patterns.md` → `development/`
- `zero-downtime-deployment.md` → `development/`
- `zoom-integration.md` → `development/`
- `graphql-migration.md` → `development/`

---

**Næste skridt:** Fortsæt med at fixe chat session access issues, derefter flyt commands fra root.

