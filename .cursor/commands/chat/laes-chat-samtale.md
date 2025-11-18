# Læs Chat Samtale

Læs ALT i chatten (ALLE beskeder fra bruger OG agent). Udtræk: kontekst, mål, kodefiler, fejl, plan.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Stack:** React 19 + TypeScript + tRPC 11 + Drizzle ORM
- **Purpose:** Hurtig ekstraktion af alt relevant fra HELE chat sessionen
- **Quality:** Komplet, nøjagtig, struktureret

## TASK

Læs HELE chat sessionen (alle beskeder fra bruger og agent) og ekstraher:

- Kontekst: Hvad arbejdes der på?
- Mål: Hvad skal opnås?
- Kodefiler: Hvilke filer er nævnt/ændret?
- Fejl: Hvilke fejl er identificeret?
- Plan: Hvad er næste skridt?

## CHAT SESSION READING

**KRITISK:** Læs HELE chat sessionen:

- Start fra første besked
- Læs ALLE beskeder fra brugeren
- Læs ALLE svar fra agenten
- Forstå diskussionens flow
- Identificér alle informationer

## OUTPUT FORMAT

```markdown
## Kontekst (fra chat session)

[Kort beskrivelse af hvad der arbejdes på baseret på HELE chatten]

## Mål (fra chat)

- [Mål 1] - [Fra chat besked X]
- [Mål 2] - [Fra chat besked Y]

## Kodefiler (fra chat)

- `[file path]` - [Status/Ændring] - [Nævnt i chat besked Z]

## Fejl (fra chat)

- [Fejl 1] - [Status] - [Fra chat besked A]

## Plan (fra chat flow)

1. [Næste skridt 1] - [Baseret på chat diskussion]
2. [Næste skridt 2] - [Baseret på chat diskussion]
```

## GUIDELINES

- **Læs HELE chatten:** Start fra første besked, læs ALLE beskeder
- **Komplet:** Læs hele chatten, ikke kun sidste besked
- **Struktureret:** Organiser informationer klart
- **Actionable:** Fokusér på hvad der skal gøres
- **Kortfattet:** Ingen lange rapporter, kun facts

---

**CRITICAL:** Læs HELE chat sessionen (alle beskeder fra bruger og agent), ekstraher alle relevante informationer, og præsenter dem kortfattet og struktureret.
