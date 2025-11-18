---
name: laes-chat-fra-database
description: "[chat] Læs Chat fra Database - Læs faktiske chat samtaler fra databasen for at forstå hvordan chatten bruges. Hent conversations og messages, og analysér dem."
argument-hint: Optional input or selection
---

# Læs Chat fra Database

Læs faktiske chat samtaler fra databasen for at forstå hvordan chatten bruges. Hent conversations og messages, og analysér dem.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Stack:** React 19 + TypeScript + tRPC 11 + Drizzle ORM
- **Purpose:** Læs faktiske chat samtaler fra databasen
- **Quality:** Nøjagtig, komplet, forståelig

## TASK

Læs chat fra database:
1. **Forstå database struktur** - `conversations` og `messages` tabeller
2. **Hent conversations** - Via `getUserConversations` eller direkte SQL
3. **Hent messages** - Via `getConversationMessages` eller direkte SQL
4. **Analysér samtaler** - Forstå hvordan chatten bruges

## DATABASE STRUKTUR

**Conversations tabel:**
- `id` - Conversation ID
- `userId` - User ID
- `title` - Conversation title
- `createdAt` - Creation time
- `updatedAt` - Last update

**Messages tabel:**
- `id` - Message ID
- `conversationId` - Parent conversation
- `role` - "user" | "assistant" | "system"
- `content` - Message content
- `createdAt` - Message time

## TOOL USAGE

**Use these tools:**
- `read_file` - Læs `server/db.ts` for database funktioner
- `codebase_search` - Find SQL queries eller database helpers
- `grep` - Søg efter `getConversationMessages`, `getUserConversations`
- `run_terminal_cmd` - Kør script til at hente data (hvis muligt)

## IMPLEMENTATION STEPS

1. **Forstå Database Funktioner:**
   - Læs `server/db.ts` - `getConversationMessages(conversationId)`
   - Læs `server/db.ts` - `getUserConversations(userId)`
   - Forstå hvordan data hentes

2. **Hent Conversations:**
   - Brug `getUserConversations` eller direkte SQL
   - Identificér relevante conversations
   - Vælg conversations til analyse

3. **Hent Messages:**
   - Brug `getConversationMessages(conversationId)` for hver conversation
   - Messages er sorteret efter `createdAt`
   - Læs ALLE messages i rækkefølge

4. **Analysér Samtaler:**
   - Hvad blev diskuteret?
   - Hvordan flyder samtalen?
   - Hvad er typiske patterns?
   - Hvordan bruges chatten i praksis?

## OUTPUT FORMAT

```markdown
# Chat Samtaler fra Database

**Dato:** 2025-11-16
**Conversations analyseret:** [X]

## Conversation 1

**Title:** [Title]
**Created:** [Date]
**Messages:** [X] beskeder

### Samtale Flow

**Bruger:** [Besked 1]
**Agent:** [Svar 1]
**Bruger:** [Besked 2]
**Agent:** [Svar 2]
...

### Analyse

**Hovedemne:** [Beskrivelse]
**Workflow:** [Beskrivelse]
**Patterns:** [Beskrivelse]

## Conversation 2

[Samme struktur...]

## Patterns Identificeret

- [Pattern 1] - [Beskrivelse]
- [Pattern 2] - [Beskrivelse]
```

## GUIDELINES

- **Faktisk data:** Læs fra database, ikke antagelser
- **Komplet:** Læs ALLE messages i hver conversation
- **Forståelig:** Forklar hvordan chatten faktisk bruges
- **Actionable:** Giv insights baseret på faktisk brug

---

**CRITICAL:** Forstå database struktur, hent conversations og messages, læs ALLE messages i rækkefølge, og analysér hvordan chatten faktisk bruges i praksis.

