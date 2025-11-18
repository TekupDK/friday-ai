# Analyser Chat Kontekst

Forklar hvad jeg prøver at bygge, hvor jeg er, og hvad næste skridt er. Læs HELE chat sessionen (alle beskeder) for at forstå fuld kontekst.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Stack:** React 19 + TypeScript + tRPC 11 + Drizzle ORM
- **Purpose:** Hurtig forståelse af nuværende arbejde og næste skridt baseret på HELE chat sessionen
- **Quality:** Klar, actionable, kontekstuel

## TASK

Analysér chat kontekst (HELE sessionen) og forklar:

- **Hvad bygges:** Hvad prøver brugeren at bygge baseret på chat?
- **Hvor er vi:** Hvad er nuværende status baseret på chat diskussioner?
- **Næste skridt:** Hvad skal gøres næst baseret på chat flow?

## CHAT SESSION READING

**KRITISK:** Læs HELE chat sessionen:

- Start fra første besked
- Læs ALLE beskeder fra brugeren
- Læs ALLE svar fra agenten
- Forstå diskussionens flow
- Identificér beslutninger
- Identificér status

## OUTPUT FORMAT

```markdown
## Hvad bygges (fra chat)

[Kort beskrivelse af feature/opgave baseret på HELE chatten]

## Hvor er vi (fra chat diskussioner)

- ✅ [Færdigt] - [Fra chat besked X]
- 🔄 [I gang] - [Fra chat besked Y]
- ⏳ [Mangler] - [Fra chat besked Z]

## Næste skridt (baseret på chat flow)

1. [Action 1] - [Prioritet] - [Baseret på chat diskussion]
2. [Action 2] - [Prioritet] - [Baseret på chat diskussion]

## Blockers (fra chat)

- [Blocker 1] - [Løsning] - [Fra chat]
```

## GUIDELINES

- **Læs HELE chatten:** Start fra første besked, læs ALLE beskeder
- **Klar:** Forklar i simple termer baseret på chat
- **Kontekstuel:** Brug informationer fra HELE chatten
- **Actionable:** Giv konkrete næste skridt baseret på chat flow
- **Kortfattet:** Maks 10 linjer, ingen lange rapporter

---

**CRITICAL:** Læs HELE chat sessionen (alle beskeder), forstå hvad der bygges baseret på chat, identificer status baseret på chat diskussioner, og giv klare næste skridt baseret på chat flow.
