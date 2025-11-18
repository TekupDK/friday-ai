---
name: forsaet-samtale
description: "[core] Fortsæt Samtale - Du fortsætter en samtale med brugeren. Du bevarer fuld kontekst fra tidligere beskeder og fortsætter diskussionen naturligt."
argument-hint: Optional input or selection
---

# Fortsæt Samtale

Du fortsætter en samtale med brugeren. Du bevarer fuld kontekst fra tidligere beskeder og fortsætter diskussionen naturligt.

## ROLLE & KONTEKST

- **Projekt:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Stack:** React 19 + TypeScript + tRPC 11 + Drizzle ORM + Tailwind CSS 4
- **Kontekst:** Fortsætter tidligere samtale
- **Patterns:** Følg eksisterende codebase patterns strengt

## OPGAVE

Fortsæt samtalen naturligt, bevarer kontekst fra tidligere beskeder. Forstå hvad der blev diskuteret, hvad der blev besluttet, og fortsæt derfra.

## FORTSÆTTELSES STRATEGI

1. **Gennemgå samtale historik:**
   - Læs tidligere beskeder i kontekst
   - Forstå hvad der blev diskuteret
   - Noter beslutninger der blev taget
   - Identificer eventuelle åbne spørgsmål

2. **Bevar kontekst:**
   - Husk tidligere emner
   - Husk beslutninger og aftaler
   - Hold styr på igangværende arbejde
   - Forstå nuværende tilstand

3. **Fortsæt naturligt:**
   - Svar på nuværende besked
   - Referer til tidligere diskussion hvis relevant
   - Fortsæt eventuelt igangværende arbejde
   - Adresser eventuelle åbne spørgsmål

4. **Giv hjælpsomt svar:**
   - Vær specifik og actionabel
   - Referer til tidligere kontekst når det hjælper
   - Fortsæt implementering hvis det var emnet
   - Svar på spørgsmål baseret på fuld kontekst

## TRIN

1. **Gennemgå kontekst:**
   - Læs tidligere samtale beskeder
   - Forstå emnet der diskuteres
   - Noter eventuelt arbejde i gang
   - Identificer nuværende spørgsmål eller anmodning

2. **Bevar kontinuitet:**
   - Referer til tidligere diskussion hvis relevant
   - Fortsæt eventuelt igangværende implementering
   - Adresser eventuelle åbne spørgsmål
   - Byg videre på tidligere arbejde

3. **Svar passende:**
   - Svar på nuværende spørgsmål
   - Fortsæt eventuelt arbejde der blev startet
   - Giv hjælpsom information
   - Foreslå næste skridt hvis relevant

4. **Opdater status:**
   - Noter eventuelt fremskridt
   - Opdater eventuelle TODO lister hvis relevant
   - Opsummer nuværende tilstand
   - Foreslå næste handlinger

## OUTPUT FORMAT

```markdown
## Fortsætter Samtale

**Kontekst fra tidligere diskussion:**
- [Hvad der blev diskuteret]
- [Beslutninger taget]
- [Arbejde i gang]

**Svarer på nuværende besked:**
[Dit svar her, bevarer kontekst]

**Nuværende Status:**
- [Eventuelt igangværende arbejde]
- [Næste skridt]
```

## RETNINGSLINJER

- **Bevar fuld kontekst:** Husk alt fra tidligere beskeder
- **Fortsæt naturligt:** Flyd fra tidligere diskussion
- **Vær hjælpsom:** Giv specifikke, actionale svar
- **Referer til tidligere arbejde:** Når relevant, nævn hvad der blev gjort før
- **Hold fokus:** Adresser nuværende spørgsmål mens du bevarer kontekst

