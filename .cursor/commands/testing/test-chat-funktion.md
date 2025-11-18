# Test Chat Funktion

Test chat funktionalitet: send besked, verificer response, test conversation flow, og valider at alt virker korrekt.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Stack:** React 19 + TypeScript + tRPC 11 + Drizzle ORM
- **Purpose:** Test chat funktionalitet end-to-end
- **Quality:** Komplet, nøjagtig, valideret

## TASK

Test chat funktion:

1. **Forstå chat system** - Læs `server/routers/chat-router.ts` og `server/db.ts`
2. **Test sendMessage** - Send test besked via tRPC
3. **Verificer response** - Tjek at response er korrekt
4. **Test conversation flow** - Test fuld conversation flow
5. **Valider database** - Tjek at messages gemmes korrekt
6. **Test edge cases** - Rate limits, lange beskeder, osv.

## TOOL USAGE

**Use these tools:**

- `read_file` - Læs chat router og database funktioner
- `codebase_search` - Find test eksempler
- `grep` - Søg efter eksisterende tests
- `run_terminal_cmd` - Kør test script

**CRITICAL - Chat Session Reading:**

**In Cursor Context (THIS SESSION):**

- **You have direct access to the ENTIRE Cursor chat session** in this conversation
- Read ALL messages from the start of this Cursor session
- Read BOTH user messages AND agent responses in chronological order
- Use this full context to understand what chat functions need testing

## IMPLEMENTATION STEPS

1. **Forstå Chat System:**
   - Læs `server/routers/chat-router.ts` - `sendMessage` mutation
   - Læs `server/db.ts` - `createMessage`, `getConversationMessages`
   - Forstå message struktur og flow

2. **Test SendMessage:**
   - Opret test conversation
   - Send test besked
   - Verificer response
   - Tjek at message gemmes i database

3. **Test Conversation Flow:**
   - Send flere beskeder
   - Verificer conversation history
   - Tjek at context bevares
   - Valider AI response kvalitet

4. **Test Edge Cases:**
   - Rate limits (10 beskeder/minut)
   - Lange beskeder
   - Tomme beskeder
   - Ugyldige conversation IDs

5. **Valider Database:**
   - Tjek at messages gemmes korrekt
   - Verificer `role` (user/assistant)
   - Tjek `createdAt` timestamp
   - Valider conversation relation

## OUTPUT FORMAT

```markdown
# Chat Funktion Test

**Dato:** 2025-11-16
**Test Type:** End-to-End Chat Test

## Test Setup

**Chat Router:** `server/routers/chat-router.ts`
**Database:** `server/db.ts`
**Test Conversation ID:** [ID]

## Test Cases

### ✅ Test 1: Send Message

- **Input:** [Test besked]
- **Expected:** Message gemmes, AI response returneres
- **Actual:** [Resultat]
- **Status:** ✅ Pass / ❌ Fail

### ✅ Test 2: Conversation History

- **Input:** [Flere beskeder]
- **Expected:** History bevares korrekt
- **Actual:** [Resultat]
- **Status:** ✅ Pass / ❌ Fail

### ✅ Test 3: Rate Limit

- **Input:** [11 beskeder i 1 minut]
- **Expected:** Rate limit error ved 11. besked
- **Actual:** [Resultat]
- **Status:** ✅ Pass / ❌ Fail

## Database Validation

- ✅ Messages gemmes korrekt
- ✅ `role` er korrekt (user/assistant)
- ✅ `createdAt` er korrekt
- ✅ Conversation relation er korrekt

## Issues Found

- [Issue 1] - [Beskrivelse]
- [Issue 2] - [Beskrivelse]

## Recommendations

- [Recommendation 1]
- [Recommendation 2]
```

## GUIDELINES

- **Komplet:** Test alle aspekter af chat funktionalitet
- **Nøjagtig:** Verificer hver test case
- **Valideret:** Tjek database og responses
- **Actionable:** Giv konkrete recommendations

---

**CRITICAL:** Forstå chat system, test sendMessage end-to-end, verificer responses, test conversation flow, valider database, og test edge cases.
