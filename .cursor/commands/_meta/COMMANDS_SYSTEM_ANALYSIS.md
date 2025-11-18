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

**Status:** 🔄 UNDER ANALYSE - Vent på resultater...

