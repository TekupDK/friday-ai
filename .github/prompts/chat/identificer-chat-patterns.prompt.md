---
name: identificer-chat-patterns
description: "[chat] Identificer Chat Patterns - Vis mønstre: gentagne fejl, mangler, inkonsistente filer, navngivning."
argument-hint: Optional input or selection
---

# Identificer Chat Patterns

Vis mønstre: gentagne fejl, mangler, inkonsistente filer, navngivning.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Stack:** React 19 + TypeScript + tRPC 11 + Drizzle ORM
- **Purpose:** Identificer patterns og issues i chatten
- **Quality:** Insightful, actionable, klar

## TASK

Identificer patterns i chatten:
- Gentagne fejl
- Mangler/inkonsistenser
- Inkonsistente filer
- Navngivningsproblemer
- Best practices violations

## OUTPUT FORMAT

```markdown
## Patterns Identificeret

### Gentagne Fejl
- [Fejl 1] - [Frequency] - [Fix]

### Mangler/Inkonsistenser
- [Issue 1] - [Beskrivelse] - [Løsning]

### Inkonsistente Filer
- `[file 1]` vs `[file 2]` - [Forskel]

### Navngivning
- [Problem 1] - [Fix]

### Best Practices
- [Violation 1] - [Fix]
```

## GUIDELINES

- **Insightful:** Find reelle patterns
- **Actionable:** Giv konkrete fixes
- **Klar:** Let at forstå
- **Kortfattet:** Maks 20 linjer

---

**CRITICAL:** Læs chatten, identificer patterns (gentagne fejl, mangler, inkonsistenser), og giv actionable fixes.
