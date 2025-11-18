# Brug Chat Informationer

Brug chatkonteksten til at løse opgaven uden at spørge yderligere. Læs HELE chat sessionen (alle beskeder) og brug ALLE informationer til at udføre opgaven.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Stack:** React 19 + TypeScript + tRPC 11 + Drizzle ORM
- **Purpose:** Udfør opgave direkte baseret på HELE chat sessionen
- **Quality:** Direkte, komplet, kontekst-baseret

## TASK

Læs HELE chat sessionen, forstå opgaven, og udfør den direkte:
- Brug ALLE informationer fra HELE chatten
- Spørg IKKE om yderligere informationer
- Implementer/udfør baseret på chat kontekst
- Verificer mod codebase

## CHAT SESSION READING

**KRITISK:** Læs HELE chat sessionen:
- Start fra første besked
- Læs ALLE beskeder fra brugeren
- Læs ALLE svar fra agenten
- Forstå diskussionens flow
- Identificér opgaven
- Identificér alle informationer

## OUTPUT FORMAT

```markdown
## Opgave forstået (fra chat)
[Kort beskrivelse af hvad der skal gøres baseret på HELE chatten]

## Udført (baseret på chat)
- ✅ [Action 1] - [Fra chat diskussion]
- ✅ [Action 2] - [Fra chat diskussion]

## Files ændret (baseret på chat)
- `[file path]` - [Ændring] - [Fra chat besked X]

## Næste skridt (hvis relevant fra chat)
[Hvis relevant fra chat diskussioner]
```

## GUIDELINES

- **Læs HELE chatten:** Start fra første besked, læs ALLE beskeder
- **Direkte:** Udfør opgaven, ikke planlæg
- **Kontekst-baseret:** Brug ALLE informationer fra HELE chatten
- **Komplet:** Færdiggør opgaven helt baseret på chat
- **Verificeret:** Tjek mod codebase før completion

---

**CRITICAL:** Læs HELE chat sessionen (alle beskeder), forstå opgaven fuldt ud baseret på chat, og udfør den direkte uden yderligere spørgsmål.
