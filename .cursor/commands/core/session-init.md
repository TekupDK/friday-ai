# Session Init

Forstå projekt + kontekst. Læs HELE chat sessionen (alle beskeder), analysér filer, identificér opgave baseret på chat historik, og forbered session.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Stack:** React 19 + TypeScript + tRPC 11 + Drizzle ORM
- **Purpose:** Initialiser session med fuld chat kontekst
- **Quality:** Komplet, nøjagtig, klar

## TASK

Initialiser session:
1. **Læs HELE chat sessionen** - ALLE beskeder fra bruger OG agent fra start
2. **Forstå projekt** - Hvad er projektet baseret på chat?
3. **Analysér kontekst** - Hvad arbejdes der på baseret på chat diskussioner?
4. **Identificér opgave** - Hvad er hovedopgaven baseret på chat historik?
5. **Forbered session** - Klar til at arbejde baseret på chat kontekst

## CHAT SESSION READING

**Læs HELE chat sessionen:**
- Start fra første besked
- Læs ALLE beskeder fra brugeren
- Læs ALLE svar fra agenten
- Forstå diskussionens flow
- Identificér hovedemner
- Identificér opgaver
- Identificér filer

## OUTPUT FORMAT

```markdown
## Session Initialiseret (baseret på chat)

**Chat kontekst:** [Hvad blev diskuteret i chatten]
**Projekt:** [Beskrivelse baseret på chat]
**Hovedopgave:** [Beskrivelse baseret på chat historik]
**Kontekst:** [Beskrivelse baseret på chat diskussioner]

## Filer i fokus (fra chat)
- `[file path]` - [Status] - [Nævnt i chat]

## Næste skridt (baseret på chat flow)
1. [Action 1]
2. [Action 2]
```

## GUIDELINES

- **Læs HELE chatten:** Start fra første besked, læs ALT
- **Forstå kontekst:** Brug chat historikken til at forstå fuld kontekst
- **Komplet:** Forstå fuld kontekst fra chat
- **Klar:** Let at forstå
- **Actionable:** Klare næste skridt baseret på chat

---

**CRITICAL:** Læs HELE chat sessionen (alle beskeder), forstå projekt og kontekst baseret på chat, identificér opgave, og forbered session.
