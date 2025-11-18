# Generate Todos from Chat

Convert chat conversation and context into a concrete, prioritized TODO list. Read HELE chat sessionen, identify all tasks, prioritize them, and create structured TODOs.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Stack:** React 19 + TypeScript + tRPC 11 + Drizzle ORM
- **Purpose:** Convert chat discussion to actionable TODOs
- **Quality:** Actionable, prioritized, structured

## TASK

Convert chat discussion to TODO list:

1. **Læs HELE chat sessionen** - ALLE beskeder fra bruger OG agent
2. **Identificer alle opgaver** - Hvad skal gøres?
3. **Prioriter dem** - Høj/Medium/Lav baseret på chat diskussioner
4. **Strukturér** - filnavn → action → detalje (fra chat)
5. **Opret TODOs** - Brug todo_write tool

## CHAT SESSION READING

**KRITISK:** Læs HELE chat sessionen:

- Start fra første besked
- Læs ALLE beskeder fra brugeren
- Læs ALLE svar fra agenten
- Identificér opgaver nævnt
- Identificér filer nævnt
- Identificér action items
- Identificér uafsluttede diskussioner

## IMPLEMENTATION STEPS

1. **Scan conversation for:**
   - Decisions made in chat
   - Requests from user
   - Bugs mentioned
   - Features discussed
   - Refactors needed
   - Tech debt identified

2. **Group tasks by area:**
   - Backend
   - Frontend
   - Infrastructure
   - Tests
   - Documentation
   - AI
   - Product

3. **For each task:**
   - Write clear, actionable description
   - Add estimated size (S/M/L/XL)
   - Add priority (P1/P2/P3) based on chat discussions
   - Include file path if mentioned in chat

4. **Remove duplicates and merge overlapping tasks:**
   - Check for duplicate tasks
   - Merge similar tasks
   - Consolidate related work

5. **Create TODO list:**
   - Use `todo_write` tool
   - Structure: filnavn → action → detalje (from chat)
   - Prioritize based on chat discussions

## OUTPUT FORMAT

```markdown
## TODOs Generated from Chat

**Date:** 2025-11-16
**Chat Context:** [Brief description of chat discussion]

### High Priority (P1) - From Chat

- [ ] `[file path]` - [Action] - [Detail] - [From chat message X]

### Medium Priority (P2) - From Chat

- [ ] `[file path]` - [Action] - [Detail] - [From chat message Y]

### Low Priority (P3) - From Chat

- [ ] `[file path]` - [Action] - [Detail] - [From chat message Z]

## Summary

- **Total Tasks:** [X]
- **High Priority:** [Y]
- **Medium Priority:** [Z]
- **Low Priority:** [W]
```

## GUIDELINES

- **Actionable:** Concrete, executable tasks from chat
- **Prioritized:** High/Medium/Low based on chat discussions
- **Structured:** filnavn → action → detalje (from chat)
- **Complete:** All tasks from chat conversation
- **Contextual:** Reference chat messages where tasks were mentioned

---

**CRITICAL:** Læs HELE chat sessionen (alle beskeder), identify all tasks mentioned in chat, prioritize them based on chat discussions, structure them as filnavn → action → detalje, and create TODO list using todo_write tool.
