---
name: session-next-step
description: "[core] Session Next Step - Beregn næste skridt. Læs chat sessionen, analysér kontekst, identificér næste action baseret på chat flow, og giv klar vejledning."
argument-hint: Optional input or selection
---

# Session Next Step

Beregn næste skridt. Læs chat sessionen, analysér kontekst, identificér næste action baseret på chat flow, og giv klar vejledning.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Stack:** React 19 + TypeScript + tRPC 11 + Drizzle ORM
- **Purpose:** Beregn næste skridt baseret på chat flow
- **Quality:** Intelligent, klar, actionable

## TASK

Beregn næste skridt:
1. **Læs chat sessionen** - Hvad blev diskuteret? Hvor er I i diskussionen?
2. **Analysér kontekst** - Hvor er vi baseret på chat flow?
3. **Identificér næste action** - Hvad er logisk næste skridt baseret på chat?
4. **Prioriter** - Hvad er vigtigst baseret på chat diskussioner?
5. **Giv vejledning** - Klar instruktion baseret på chat flow

## CHAT SESSION READING

**Læs chat sessionen:**
- Hvad blev diskuteret?
- Hvor er I i diskussionen?
- Hvad er nuværende status ifølge chat?
- Hvad er logisk næste skridt baseret på chat flow?

## OUTPUT FORMAT

```markdown
## Næste Skridt (baseret på chat flow)

**Chat kontekst:** [Hvor er I i diskussionen]

**Prioritet:** [High/Medium/Low] - [Hvorfor baseret på chat]

1. **[Action 1]** - [Beskrivelse]
   - **Hvorfor:** [Rationale baseret på chat]
   - **Hvordan:** [Instruktion]
   - **Fra chat:** [Hvor i chatten blev dette diskuteret]

2. **[Action 2]** - [Beskrivelse]
```

## GUIDELINES

- **Læs chatten:** Forstå chat flow og diskussion
- **Intelligent:** Beregn baseret på chat kontekst
- **Prioriteret:** Høj prioritet først baseret på chat
- **Actionable:** Konkrete actions baseret på chat
- **Kortfattet:** Maks 10 linjer

---

**CRITICAL:** Læs chat sessionen, forstå chat flow, analysér kontekst, identificér næste action baseret på chat, prioriter, og giv klar vejledning.
