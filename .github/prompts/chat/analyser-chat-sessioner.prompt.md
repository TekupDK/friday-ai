---
name: analyser-chat-sessioner
description: "[chat] Analyser Chat Sessioner - Analysér faktiske chat sessioner fra databasen for at forstå hvordan chatten bruges i praksis. Læs conversation history, identificér patterns, og forstå workflow."
argument-hint: Optional input or selection
---

# Analyser Chat Sessioner

Analysér faktiske chat sessioner fra databasen for at forstå hvordan chatten bruges i praksis. Læs conversation history, identificér patterns, og forstå workflow.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Stack:** React 19 + TypeScript + tRPC 11 + Drizzle ORM
- **Purpose:** Analysér faktiske chat sessioner for at forstå praksis
- **Quality:** Insightful, comprehensive, actionable

## TASK

Analysér chat sessioner:
1. **Hent conversations** - Fra databasen via `getUserConversations`
2. **Læs messages** - Via `getConversationMessages` for hver conversation
3. **Analysér patterns** - Hvordan bruges chatten? Hvad er typiske workflows?
4. **Identificér best practices** - Hvad virker godt?
5. **Forstå workflow** - Hvordan arbejder brugeren med chatten?

## TOOL USAGE

**Use these tools:**
- `codebase_search` - Find chat router og database funktioner
- `read_file` - Læs `server/db.ts` og `server/routers/chat-router.ts`
- `grep` - Søg efter `getConversationMessages`, `getUserConversations`
- `run_terminal_cmd` - Kør script til at hente chat data (hvis muligt)

**DO NOT:**
- Ignorere faktiske data
- Glem patterns
- Undlad at analysere workflow

## IMPLEMENTATION STEPS

1. **Forstå Chat System:**
   - Læs `server/db.ts` - `getConversationMessages` funktion
   - Læs `server/routers/chat-router.ts` - Hvordan håndteres chat?
   - Forstå message struktur: `role` (user/assistant), `content`, `createdAt`

2. **Hent Chat Data (hvis muligt):**
   - Brug `getUserConversations` til at hente conversations
   - Brug `getConversationMessages` til at hente messages
   - Analysér faktiske chat sessioner

3. **Analysér Patterns:**
   - Hvordan starter brugeren samtaler?
   - Hvilke typer spørgsmål stilles?
   - Hvordan svarer agenten?
   - Hvad er typiske workflows?
   - Hvor lang er gennemsnitlig samtale?

4. **Identificér Best Practices:**
   - Hvad virker godt?
   - Hvad er effektive workflows?
   - Hvad er typiske problemer?

5. **Forstå Workflow:**
   - Hvordan bruges chatten i praksis?
   - Hvad er typiske use cases?
   - Hvordan kan commands forbedres?

## OUTPUT FORMAT

```markdown
# Chat Sessioner Analyse

**Dato:** 2025-11-16
**Analyserede Sessioner:** [X]

## Chat System Forståelse

**Struktur:**
- Conversations: `conversations` tabel med `userId`, `title`, `createdAt`
- Messages: `messages` tabel med `conversationId`, `role`, `content`, `createdAt`
- Hentning: `getConversationMessages(conversationId)` returnerer alle messages sorteret efter `createdAt`

**Flow:**
1. Bruger sender besked → `createMessage` med `role: "user"`
2. System henter conversation history → `getConversationMessages`
3. System sender til AI → `routeAI` med fuld conversation history
4. AI svarer → `createMessage` med `role: "assistant"`

## Patterns Identificeret

### Typiske Workflows
- [Workflow 1] - [Beskrivelse] - [Frequency]
- [Workflow 2] - [Beskrivelse] - [Frequency]

### Typiske Spørgsmål
- [Type 1] - [Eksempel] - [Frequency]
- [Type 2] - [Eksempel] - [Frequency]

### Typiske Svar
- [Type 1] - [Eksempel] - [Frequency]

## Best Practices

- [Best Practice 1] - [Beskrivelse]
- [Best Practice 2] - [Beskrivelse]

## Workflow Forståelse

**Hvordan bruges chatten:**
- [Observation 1]
- [Observation 2]

**Typiske Use Cases:**
- [Use Case 1]
- [Use Case 2]

## Recommendations for Commands

- [Recommendation 1] - [Baseret på faktisk brug]
- [Recommendation 2] - [Baseret på faktisk brug]
```

## GUIDELINES

- **Faktisk data:** Analysér faktiske chat sessioner hvis muligt
- **Patterns:** Identificér gentagne mønstre
- **Workflow:** Forstå hvordan chatten faktisk bruges
- **Actionable:** Giv recommendations baseret på faktisk brug

---

**CRITICAL:** Forstå chat system, hent faktiske chat data hvis muligt, analysér patterns og workflows, og giv recommendations baseret på faktisk brug.

