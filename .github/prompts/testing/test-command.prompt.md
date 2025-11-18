---
name: test-command
description: "[testing] Test Command - Test en specifik command: kør den, verificer output, test edge cases, og valider at den virker korrekt."
argument-hint: Optional input or selection
---

# Test Command

Test en specifik command: kør den, verificer output, test edge cases, og valider at den virker korrekt.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Stack:** React 19 + TypeScript + tRPC 11 + Drizzle ORM
- **Purpose:** Test en specifik command i praksis
- **Quality:** Nøjagtig, valideret, actionable

## TASK

Test command:
1. **Læs command** - Læs command filen
2. **Forstå purpose** - Hvad skal commanden gøre?
3. **Kør command** - Test i praksis
4. **Verificer output** - Tjek at output er korrekt
5. **Test edge cases** - Test med forskellige inputs
6. **Rapporter resultater** - Dokumenter hvad der virker

## IMPLEMENTATION STEPS

1. **Læs Command:**
   - Læs command filen fra `.cursor/commands/`
   - Forstå ROLE & CONTEXT
   - Forstå TASK
   - Forstå GUIDELINES

2. **Forstå Purpose:**
   - Hvad skal commanden gøre?
   - Hvad er forventet output?
   - Hvilke tools skal bruges?
   - Hvad er success criteria?

3. **Kør Command:**
   - Kør commanden i praksis
   - Brug faktiske inputs
   - Observer output
   - Dokumenter resultater

4. **Verificer Output:**
   - Tjek at output matcher forventninger
   - Verificer at output er korrekt
   - Tjek at output er actionable
   - Valider at alt er komplet

5. **Test Edge Cases:**
   - Test med manglende information
   - Test med ugyldige inputs
   - Test med komplekse scenarier
   - Test med edge cases

6. **Rapporter Resultater:**
   - Dokumenter hvad der virker
   - Dokumenter hvad der ikke virker
   - Giv konkrete forbedringer
   - Prioriter fixes

## OUTPUT FORMAT

```markdown
# Command Test: [Command Navn]

**Dato:** 2025-11-16
**Command:** `.cursor/commands/[command].md`

## Command Analyse

**Purpose:** [Beskrivelse]
**Expected Output:** [Beskrivelse]
**Tools Used:** [Liste]

## Test Cases

### ✅ Test 1: [Test Case]
- **Input:** [Input]
- **Expected:** [Forventet]
- **Actual:** [Faktisk]
- **Status:** ✅ Pass / ❌ Fail

### ✅ Test 2: [Test Case]
- **Input:** [Input]
- **Expected:** [Forventet]
- **Actual:** [Faktisk]
- **Status:** ✅ Pass / ❌ Fail

## Output Validering

- ✅ [Validering 1]
- ❌ [Validering 2] - [Problem]

## Edge Cases Testet

- ✅ [Edge case 1] - [Resultat]
- ❌ [Edge case 2] - [Problem]

## Issues Found

- [Issue 1] - [Beskrivelse] - [Prioritet]
- [Issue 2] - [Beskrivelse] - [Prioritet]

## Forbedringer Nødvendige

1. **[Forbedring 1]** - [Prioritet] - [Beskrivelse]
2. **[Forbedring 2]** - [Prioritet] - [Beskrivelse]

## Recommendations

- [Recommendation 1]
- [Recommendation 2]
```

## GUIDELINES

- **Nøjagtig:** Test hver aspekt af commanden
- **Valideret:** Verificer hver test case
- **Actionable:** Giv konkrete forbedringer
- **Prioriteret:** Høj prioritet først

---

**CRITICAL:** Læs command, forstå purpose, kør i praksis, verificer output, test edge cases, og rapporter resultater med konkrete forbedringer.

