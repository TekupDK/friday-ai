# Konverter Chat til TODOs

Konverter chat samtale og kontekst til en konkret, prioriteret TODO-liste. Læs HELE chat sessionen, identificer alle opgaver, prioriter dem, og opret struktureret TODO-liste.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Stack:** React 19 + TypeScript + tRPC 11 + Drizzle ORM
- **Purpose:** Konverter chat diskussion til actionable TODOs
- **Quality:** Actionable, prioriteret, struktureret

## TASK

Konverter chat diskussion til TODO-liste:

1. **Læs HELE chat sessionen** - ALLE beskeder fra bruger OG agent
2. **Identificer alle opgaver** - Hvad skal gøres? Hvad blev nævnt?
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

## TOOL USAGE

**Use these tools:**

- `read_file` - Læs chat historik
- `codebase_search` - Find relevante filer
- `grep` - Find opgaver i chat
- `todo_write` - Opret TODO-liste

**DO NOT:**

- Ignorere chat kontekst
- Glem at prioritere
- Skip strukturering
- Undlad at oprette TODOs

## IMPLEMENTATION STEPS

1. **Scan samtalen for:**
   - Beslutninger taget i chatten
   - Requests fra brugeren
   - Bugs nævnt
   - Features diskuteret
   - Refactors nødvendige
   - Tech debt identificeret

2. **Gruppér opgaver efter område:**
   - Backend
   - Frontend
   - Infrastructure
   - Tests
   - Dokumentation
   - AI
   - Product

3. **For hver opgave:**
   - Skriv klar, actionable beskrivelse
   - Tilføj estimeret størrelse (S/M/L/XL)
   - Tilføj prioritet (P1/P2/P3) baseret på chat diskussioner
   - Inkludér fil path hvis nævnt i chatten

4. **Fjern duplikater og merge overlappende opgaver:**
   - Tjek for duplikater
   - Merge lignende opgaver
   - Konsolider relateret arbejde

5. **Opret TODO-liste:**
   - Brug `todo_write` tool
   - Struktur: filnavn → action → detalje (fra chat)
   - Prioriter baseret på chat diskussioner

## OUTPUT FORMAT

```markdown
## TODOs Genereret fra Chat

**Dato:** 2025-11-16
**Chat Kontekst:** [Kort beskrivelse af chat diskussion]

### Høj Prioritet (P1) - Fra Chat

- [ ] `[file path]` - [Action] - [Detalje] - [Fra chat besked X]

### Medium Prioritet (P2) - Fra Chat

- [ ] `[file path]` - [Action] - [Detalje] - [Fra chat besked Y]

### Lav Prioritet (P3) - Fra Chat

- [ ] `[file path]` - [Action] - [Detalje] - [Fra chat besked Z]

## Summary

- **Total Opgaver:** [X]
- **Høj Prioritet:** [Y]
- **Medium Prioritet:** [Z]
- **Lav Prioritet:** [W]
```

## GUIDELINES

- **Actionable:** Konkrete, udførbare opgaver fra chat
- **Prioriteret:** Høj/Medium/Lav baseret på chat diskussioner
- **Struktureret:** filnavn → action → detalje (fra chat)
- **Komplet:** Alle opgaver fra chat samtalen
- **Kontekstuel:** Reference chat beskeder hvor opgaver blev nævnt

---

**CRITICAL:** Læs HELE chat sessionen (alle beskeder), identificer alle opgaver nævnt i chatten, prioriter dem baseret på chat diskussioner, strukturér dem som filnavn → action → detalje, og opret TODO-liste med todo_write tool.
