---
name: forbedre-command
description: "[testing] Forbedre Command - Forbedre en command baseret på faktisk brug: læs chat historik, identificér problemer, analysér brug, forbedre commanden, og test forbedringerne."
argument-hint: Optional input or selection
---

# Forbedre Command

Forbedre en command baseret på faktisk brug: læs chat historik, identificér problemer, analysér brug, forbedre commanden, og test forbedringerne.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Stack:** React 19 + TypeScript + tRPC 11 + Drizzle ORM
- **Purpose:** Forbedre commands baseret på faktisk brug og feedback
- **Quality:** Praktisk, forbedret, valideret, actionable

## TASK

Forbedre en command ved at:
1. **Læs chat historik** - HELE samtalen hvor commanden bruges eller diskuteres
2. **Identificér problemer** - Hvad virker ikke? Hvad mangler? Hvad er forvirrende?
3. **Analysér brug** - Hvordan bruges commanden i praksis? Hvad er typiske use cases?
4. **Sammenlign med lignende** - Find lignende commands og lær fra dem
5. **Forbedre command** - Fix problemer, tilføj manglende features, forbedre clarity
6. **Test forbedring** - Verificer at forbedringen virker i praksis

## CHAT SESSION READING

**KRITISK:** Læs HELE chat sessionen systematisk:

**I Cursor/Copilot:**
- Du har adgang til hele chat historikken i denne session
- Læs ALLE beskeder fra start af sessionen
- Læs både brugerens beskeder OG agentens svar
- Identificér hvor commanden bruges eller diskuteres
- Forstå problemer og issues nævnt i chatten

**Hvad du skal læse:**
- **Brugerens feedback:** Hvad siger brugeren om commanden?
- **Problemer nævnt:** Hvilke problemer er identificeret?
- **Brug eksempler:** Hvordan bruges commanden?
- **Forventninger:** Hvad forventer brugeren?
- **Manglende features:** Hvad mangler der?

## REASONING PROCESS

Before improving the command, think through:

1. **Understand the problem:**
   - What issues were mentioned in chat?
   - What feedback did the user provide?
   - What expectations were not met?
   - What caused frustration?

2. **Analyze usage patterns:**
   - How was the command actually used?
   - What were the typical use cases?
   - What edge cases occurred?
   - What worked well vs. what didn't?

3. **Compare with similar commands:**
   - What do similar commands do well?
   - What patterns are consistent?
   - What best practices can be applied?
   - What structure works best?

4. **Identify improvements:**
   - What specific problems need fixing?
   - What features are missing?
   - What clarity improvements are needed?
   - What validation is required?

5. **Plan improvements:**
   - Prioritize fixes (must-fix vs. should-improve)
   - Ensure changes don't break existing functionality
   - Validate improvements before applying
   - Test in isolation before affecting system

## IMPLEMENTATION STEPS

1. **Læs Chat Historik:**
   - Start fra første besked i denne Cursor session
   - Læs ALLE beskeder i rækkefølge
   - Identificér hvor commanden bruges eller diskuteres
   - Forstå kontekst og problemer
   - **Hvis git/commits involveret:** Tjek git status automatisk

2. **Identificér Problemer:**
   - Hvad virker ikke? (fra chat feedback)
   - Hvad mangler? (fra chat diskussioner)
   - Hvad er forvirrende? (fra brugerens spørgsmål)
   - Hvad er ineffektivt? (fra brugerens frustration)
   - Hvad er inkonsistent? (sammenlign med lignende commands)
   - **Hvis git/commits involveret:** Identificer problemer med commit organisering

3. **Analysér Brug:**
   - Hvordan bruges commanden i praksis? (fra chat eksempler)
   - Hvad er typiske use cases? (fra chat diskussioner)
   - Hvad er edge cases? (fra chat problemer)
   - Hvad er forventninger? (fra brugerens beskrivelser)
   - **Hvis git/commits involveret:** Analysér commit patterns og gruppering

4. **Sammenlign med Lignende:**
   - Find lignende commands i `.cursor/commands/`
   - Lær fra deres struktur og approach
   - Identificér best practices
   - Se hvad der virker godt
   - **Hvis git/commits involveret:** Sammenlign med `git-commit-session.md`, `commit-session-work.md`

5. **Forbedre Command:**
   - Fix problemer identificeret i chatten
   - Tilføj manglende features nævnt i chatten
   - Forbedre clarity baseret på forvirring i chatten
   - Optimér output baseret på feedback
   - Tilføj eksempler hvis manglende
   - Forbedre struktur hvis nødvendigt
   - **Hvis git/commits involveret:** Tilføj git integration, commit gruppering, review generation
   - **Valider før merge:** Kør TypeScript check, linting, tests

6. **Test Forbedring:**
   - Kør commanden med forbedringer
   - Verificer at det virker som forventet
   - Tjek at output er bedre end før
   - Valider at alle problemer er løst
   - **Hvis git/commits involveret:** Test commit gruppering og review generation

## GIT INTEGRATION

**KRITISK:** Når commanden bruges til at organisere commits eller dokumentation:

1. **Tjek Git Status Automatisk:**
   - Kør `git status --short` for at se nuværende status
   - Identificer staged, unstaged, og untracked files
   - Grupper filer automatisk baseret på patterns (subscription/, hooks/, docs/, etc.)

2. **Automatisk Commit Gruppering:**
   - Grupper relaterede filer automatisk
   - Foreslå logiske commit grupper baseret på fil paths
   - Opret commit review dokumentation automatisk

3. **Edge Case Håndtering:**
   - **Ingen staged files:** Informer brugeren og foreslå næste skridt
   - **Mange filer:** Foreslå at organisere i flere commits
   - **Mix af staged/unstaged:** Klarificer hvilke filer der skal committes

4. **Commit Review Generation:**
   - Generer automatisk commit review dokumentation
   - Inkluder commit beskeder, filer, og impact assessment
   - Foreslå commit grupper med beskrivende messages

## TOOL USAGE

**Use these tools:**
- `read_file` - Læs command filen og lignende commands
- `codebase_search` - Find lignende commands og best practices
- `grep` - Søg efter patterns i commands
- `read_file` - Læs analyser i `_meta/` for kontekst
- `search_replace` - Forbedre command filen
- `write` - Opret forbedret version
- `run_terminal_cmd` - Kør git commands for status og commit organisering

**DO NOT:**
- Ignorere chat feedback
- Antage problemer uden at læse chatten
- Glem at sammenligne med lignende commands
- Skip test af forbedringer
- Merge forbedringer uden validation (TypeScript, linting, tests)
- Påvirke systemet med store refactorings uden at teste først
- Commit filer uden brugerens eksplicitte godkendelse

## VERIFICATION CHECKLIST

Before completing improvements, verify:

- [ ] Chat historik læst og forstået
- [ ] Problemer identificeret baseret på faktisk brug
- [ ] Lignende commands sammenlignet
- [ ] Forbedringer implementeret
- [ ] TypeScript compilation passes (`pnpm tsc --noEmit`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Tests pass (hvis relevant)
- [ ] System ikke påvirket negativt
- [ ] Output format forbedret
- [ ] Dokumentation opdateret

## OUTPUT FORMAT

Provide structured improvement report:

```markdown
# Command Forbedring: [Command Navn]

**Dato:** 2025-01-28
**Command:** `.cursor/commands/[command].md`
**Baseret på:** Chat session fra [dato]

## Chat Historik Analyse

**Samtale kontekst:** 
[Kort beskrivelse af samtalen hvor commanden blev brugt eller diskuteret]

**Brugt i:** 
[Beskrivelse af hvor commanden blev brugt - f.eks. "Brugt til at refactore hooks systemet"]

**Problemer identificeret i chat:** 
- [Problem 1] - [Fra chat besked X]
- [Problem 2] - [Fra chat besked Y]

## Problemer Identificeret

1. **[Problem 1]** - [Beskrivelse fra chat] - [Prioritet: Høj/Medium/Lav]
   - **Fra chat:** "[Direkte citat fra chatten]"
   - **Impact:** [Hvordan påvirker det brugeren/systemet]

2. **[Problem 2]** - [Beskrivelse fra chat] - [Prioritet: Høj/Medium/Lav]
   - **Fra chat:** "[Direkte citat fra chatten]"
   - **Impact:** [Hvordan påvirker det brugeren/systemet]

## Brug Analyse

**Typiske Use Cases (fra chat):**
- [Use case 1] - [Fra chat besked X] - [Hvor ofte/hvordan]
- [Use case 2] - [Fra chat besked Y] - [Hvor ofte/hvordan]

**Edge Cases (fra chat):**
- [Edge case 1] - [Fra chat besked Z] - [Hvordan håndteres det]

**Forventninger (fra chat):**
- [Forventning 1] - [Fra chat besked A] - [Hvad forventer brugeren]

## Sammenligning med Lignende Commands

**Lignende commands analyseret:**
- `[command1].md` - [Hvad virker godt] - [Hvad kan vi lære]
- `[command2].md` - [Hvad virker godt] - [Hvad kan vi lære]

**Best Practices identificeret:**
- [Best practice 1] - [Hvorfor det virker]
- [Best practice 2] - [Hvorfor det virker]

## Forbedringer Implementeret

### ✅ Forbedring 1: [Navn]
- **Problem:** [Beskrivelse fra chat]
- **Løsning:** [Hvad blev ændret - konkrete linjer/filer]
- **Status:** ✅ Implementeret
- **Valideret:** ✅ [TypeScript/Linting/Tests pass]

### ✅ Forbedring 2: [Navn]
- **Problem:** [Beskrivelse fra chat]
- **Løsning:** [Hvad blev ændret - konkrete linjer/filer]
- **Status:** ✅ Implementeret
- **Valideret:** ✅ [TypeScript/Linting/Tests pass]

## Test Resultater

- ✅ TypeScript compilation - Pass - [Ingen fejl]
- ✅ Linting - Pass - [Ingen warnings]
- ✅ Functionality test - Pass - [Command virker som forventet]
- ✅ Output quality - Pass - [Output er bedre end før]

## Forbedringer Nødvendige (Fremtid)

- [Forbedring 1] - [Prioritet: P1/P2/P3] - [Beskrivelse] - [Hvorfor]
- [Forbedring 2] - [Prioritet: P1/P2/P3] - [Beskrivelse] - [Hvorfor]
```

## GUIDELINES

- **Praktisk:** Baseret på faktisk brug fra chatten, ikke antagelser
- **Forbedret:** Konkrete forbedringer baseret på chat feedback
- **Valideret:** Test forbedringer i praksis
- **Actionable:** Klare næste skridt
- **Kontekstuel:** Brug chat historikken til at forstå fuld kontekst
- **Sammenlignende:** Lær fra lignende commands

## EKSEMPLER

### Eksempel 1: Forbedre baseret på brugerens frustration

**Fra chat:** "Jeg er blevet overvældet af alle commands"

**Forbedring:**
- Tilføj "Quick Start" sektion
- Tilføj "Most Used" sektion
- Forbedre organisering
- Tilføj eksempler

### Eksempel 2: Forbedre baseret på manglende funktionalitet

**Fra chat:** "Commands mangler struktur"

**Forbedring:**
- Tilføj fuld prompt engineering struktur
- Tilføj TOOL USAGE sektion
- Tilføj OUTPUT FORMAT sektion
- Tilføj eksempler

### Eksempel 3: Forbedre baseret på faktisk brug (Commit Organisation)

**Fra chat:** "er der blevet lavet docs og notater om alt det nye udvikling og har vi fået commitet de enkelte ændringerne osv"

**Brug:**
- Commanden blev brugt til at organisere git commits
- Processen involverede at analysere git status, gruppere filer, oprette commit plan

**Forbedring:**
- Tilføj git integration sektion
- Tilføj automatisk commit gruppering
- Tilføj commit review generation
- Tilføj edge case håndtering (ingen staged files, mange filer)

## CRITICAL: Background Mode for Store Refactorings

**KRITISK:** Når du laver store refactorings der kan påvirke systemet:

1. **Valider før merge:**
   - Kør `pnpm tsc --noEmit` - Ingen TypeScript fejl
   - Kør `pnpm lint` - Ingen linting warnings
   - Kør tests hvis relevant - Alle tests passerer
   - Tjek at systemet kan bygge - `pnpm build` (hvis relevant)

2. **Test i isolation:**
   - Test forbedringer før de påvirker systemet
   - Verificer at eksisterende funktionalitet ikke brydes
   - Tjek at imports er korrekte
   - Valider at filer er korrekte (extensions, naming)

3. **Rapporter validation:**
   - Inkluder validation resultater i output
   - Marker hvis noget fejler
   - Foreslå fixes før merge

**DO NOT:**
- Merge forbedringer der introducerer TypeScript fejl
- Påvirke systemet uden at validere først
- Ignorere compilation errors
- Skip validation steps

**DO:**
- Valider alle ændringer før completion
- Test i isolation før merge
- Rapporter validation status
- Fix fejl før de påvirker systemet

---

**CRITICAL:** Læs HELE chat sessionen (alle beskeder fra bruger og agent), identificér problemer baseret på faktisk brug fra chatten, sammenlign med lignende commands, forbedre commanden, VALIDER før merge, og test forbedringerne i praksis.
