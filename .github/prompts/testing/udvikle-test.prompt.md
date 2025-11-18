---
name: udvikle-test
description: "[testing] Udvikle Test - Udvikle test: skriv test kode, test funktionalitet, og valider at alt virker korrekt."
argument-hint: Optional input or selection
---

# Udvikle Test

Udvikle test: skriv test kode, test funktionalitet, og valider at alt virker korrekt.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Stack:** React 19 + TypeScript + tRPC 11 + Drizzle ORM
- **Purpose:** Udvikle test kode for funktionalitet
- **Quality:** Komplet, nøjagtig, valideret

## TASK

Udvikle test:
1. **Forstå funktionalitet** - Hvad skal testes?
2. **Skriv test kode** - Unit tests, integration tests
3. **Kør tests** - Verificer at de passer
4. **Valider coverage** - Tjek at alt er dækket
5. **Forbedre tests** - Fix issues og forbedre coverage

## TOOL USAGE

**Use these tools:**
- `read_file` - Læs funktionalitet der skal testes
- `codebase_search` - Find eksisterende tests
- `grep` - Søg efter test patterns
- `write` - Skriv test kode
- `run_terminal_cmd` - Kør tests

## IMPLEMENTATION STEPS

1. **Forstå Funktionalitet:**
   - Læs kode der skal testes
   - Forstå hvad funktionaliteten gør
   - Identificér edge cases
   - Forstå success criteria

2. **Skriv Test Kode:**
   - Opret test fil (`.test.ts` eller `.spec.ts`)
   - Skriv unit tests
   - Skriv integration tests
   - Brug test framework (Vitest, Jest, osv.)

3. **Kør Tests:**
   - Kør test suite
   - Verificer at tests passer
   - Fix fejlende tests
   - Forbedre test kvalitet

4. **Valider Coverage:**
   - Tjek test coverage
   - Identificér manglende coverage
   - Tilføj tests for manglende coverage
   - Mål for 80%+ coverage

5. **Forbedre Tests:**
   - Fix issues
   - Forbedre test kvalitet
   - Tilføj edge cases
   - Dokumenter tests

## OUTPUT FORMAT

```markdown
# Test Udvikling: [Funktionalitet]

**Dato:** 2025-11-16
**Funktionalitet:** [Beskrivelse]

## Test Kode Skrevet

**Test Fil:** `[path/to/test.ts]`
**Test Type:** Unit / Integration
**Test Cases:** [X]

### Test Cases

```typescript
// Test case 1
test('should [description]', () => {
  // Test code
});

// Test case 2
test('should [description]', () => {
  // Test code
});
```

## Test Resultater

- ✅ [Test 1] - Pass
- ✅ [Test 2] - Pass
- ❌ [Test 3] - Fail - [Problem]

## Coverage

- **Current Coverage:** [X]%
- **Target Coverage:** 80%+
- **Missing Coverage:** [Beskrivelse]

## Issues Found

- [Issue 1] - [Beskrivelse]
- [Issue 2] - [Beskrivelse]

## Forbedringer

- [Forbedring 1]
- [Forbedring 2]
```

## GUIDELINES

- **Komplet:** Test alle aspekter af funktionalitet
- **Nøjagtig:** Verificer hver test case
- **Valideret:** Tjek coverage og kvalitet
- **Actionable:** Giv konkrete forbedringer

---

**CRITICAL:** Forstå funktionalitet, skriv test kode, kør tests, valider coverage, og forbedre tests baseret på resultater.

