---
name: session-todos
description: "[core] Session TODOs - Generér TODOs + tasks fra chat sessionen. Læs HELE chatten, identificér opgaver nævnt i chatten, prioriter dem, og opret TODO-liste."
argument-hint: Optional input or selection
---

# Session TODOs

Generér TODOs + tasks fra chat sessionen. Læs HELE chatten, identificér opgaver nævnt i chatten, prioriter dem, og opret TODO-liste.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Stack:** React 19 + TypeScript + tRPC 11 + Drizzle ORM
- **Purpose:** Generér TODOs fra chat session
- **Quality:** Actionable, prioriteret, struktureret

## TASK

Generér TODOs:
1. **Læs HELE chat sessionen** - ALLE beskeder fra bruger OG agent
2. **Identificér opgaver** - Hvad blev nævnt i chatten? Hvad skal gøres?
3. **Prioriter** - Høj/Medium/Lav baseret på chat diskussioner
4. **Strukturér** - filnavn → action → detalje (fra chat)
5. **Opret TODOs** - Brug todo_write tool

## CHAT SESSION READING

**Læs HELE chat sessionen:**
- Start fra første besked
- Læs ALLE beskeder
- Identificér opgaver nævnt
- Identificér filer nævnt
- Identificér action items
- Identificér uafsluttede diskussioner

## OUTPUT FORMAT

```markdown
## TODOs Genereret (fra chat session)

**Chat kontekst:** [Hvad blev diskuteret]

### Høj Prioritet (fra chat)
- [ ] `[file path]` - [Action] - [Detalje] - [Fra chat besked X]

### Medium Prioritet (fra chat)
- [ ] `[file path]` - [Action] - [Detalje] - [Fra chat besked Y]

### Lav Prioritet (fra chat)
- [ ] `[file path]` - [Action] - [Detalje] - [Fra chat besked Z]
```

## GUIDELINES

- **Læs HELE chatten:** Start fra første besked, læs ALT
- **Actionable:** Konkrete, udførbare opgaver fra chat
- **Prioriteret:** Høj prioritet først baseret på chat
- **Struktureret:** filnavn → action → detalje (fra chat)
- **Komplet:** Alle opgaver fra chatten

---

**CRITICAL:** Læs HELE chat sessionen (alle beskeder), identificér opgaver nævnt i chatten, prioriter dem baseret på chat diskussioner, strukturér dem, og opret TODO-liste.
