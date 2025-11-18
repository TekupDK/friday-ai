# Command Forbedring: forbedre-command

**Dato:** January 28, 2025  
**Command:** `.cursor/commands/forbedre-command.md`  
**Baseret på:** Chat session fra January 28, 2025

---

## Chat Historik Analyse

**Samtale kontekst:** 
Brugeren har brugt flere commands i denne session:
- `/valider-chat-informationer` - Validerede hooks systemet
- `/start-work-immediately` - Startede arbejde med hooks refactoring
- `/code-review` - Reviewede hooks ændringer
- `/forbedre-command` - Nuværende command

**Brugt i:** 
Commanden blev brugt til at forbedre hooks systemet, men brugeren udtrykte frustration over at ændringer påvirkede systemet: "vi har stadigvæk problemr med hooks issues der påvirker vores system især vores crm system osv hvorfor laves det ikke i baggrunden så vi ikke påvirker systemet"

**Problemer identificeret i chat:**
1. TypeScript fejl blev introduceret (JSX i .ts fil)
2. System blev påvirket af refactoring (CRM system fejlede)
3. Manglende validation før merge
4. Manglende "background mode" for store refactorings

---

## Problemer Identificeret

1. **Manglende REASONING PROCESS sektion** - [Prioritet: Høj]
   - Andre commands (`code-review`, `start-work-immediately`) har REASONING PROCESS
   - Mangler systematisk tænkning før handling
   - Gør det svært at forstå agentens beslutninger

2. **Manglende VERIFICATION CHECKLIST** - [Prioritet: Høj]
   - `start-work-immediately` har verification checklist
   - Mangler validation steps før completion
   - Kan forhindre fejl som TypeScript compilation errors

3. **Manglende "Background Mode" instruktioner** - [Prioritet: Høj]
   - Brugeren ønsker at store refactorings ikke påvirker systemet
   - Mangler instruktioner om at validere før merge
   - Mangler instruktioner om at teste i isolation

4. **OUTPUT FORMAT for generisk** - [Prioritet: Medium]
   - Mangler konkrete eksempler
   - Mangler struktureret output format
   - Svært at se hvad der faktisk blev forbedret

5. **Manglende CRITICAL sektion** - [Prioritet: Medium]
   - Andre commands har "CRITICAL" sektion med klare instruktioner
   - Mangler emphasis på vigtige steps
   - Kan føre til at agenten springer vigtige steps over

---

## Brug Analyse

**Typiske Use Cases (fra chat):**
- Forbedre commands baseret på faktisk brug - `/forbedre-command` blev brugt til hooks refactoring
- Identificere problemer i commands - TypeScript fejl blev identificeret
- Sammenligne med lignende commands - `code-review` og `start-work-immediately` blev sammenlignet

**Edge Cases (fra chat):**
- Store refactorings der påvirker systemet - Hooks refactoring påvirkede CRM system
- TypeScript compilation errors - JSX i .ts fil blev introduceret
- Import problemer efter refactoring - Imports blev ikke alle opdateret

**Forventninger (fra chat):**
- Validation før merge - Brugeren forventer at systemet ikke påvirkes
- Background mode - Store ændringer skal testes før merge
- Konkrete forbedringer - Klare resultater af forbedringer

---

## Sammenligning med Lignende Commands

**Lignende commands analyseret:**
- `code-review.md` - Har REASONING PROCESS, Review Checklist, structured output
- `start-work-immediately.md` - Har VERIFICATION CHECKLIST, CRITICAL sektion, structured progress reporting
- `valider-chat-informationer.md` - Har OUTPUT FORMAT med konkrete eksempler

**Best Practices identificeret:**
1. **REASONING PROCESS sektion** - Systematisk tænkning før handling
2. **VERIFICATION CHECKLIST** - Validation steps før completion
3. **CRITICAL sektion** - Klare instruktioner om vigtige steps
4. **Structured OUTPUT FORMAT** - Konkrete eksempler og formater
5. **TOOL USAGE med DO NOT** - Klare guidelines om hvad ikke at gøre

---

## Forbedringer Implementeret

### ✅ Forbedring 1: Tilføj REASONING PROCESS
- **Problem:** Mangler systematisk tænkning før handling
- **Løsning:** Tilføjet REASONING PROCESS sektion med 5 steps
- **Status:** ✅ Implementeret

### ✅ Forbedring 2: Tilføj VERIFICATION CHECKLIST
- **Problem:** Mangler validation steps før completion
- **Løsning:** Tilføjet VERIFICATION CHECKLIST med validation steps
- **Status:** ✅ Implementeret

### ✅ Forbedring 3: Tilføj Background Mode instruktioner
- **Problem:** Store refactorings påvirker systemet
- **Løsning:** Tilføjet instruktioner om at validere før merge, teste i isolation
- **Status:** ✅ Implementeret

### ✅ Forbedring 4: Forbedre OUTPUT FORMAT
- **Problem:** Output format for generisk
- **Løsning:** Tilføjet konkrete eksempler og struktureret format
- **Status:** ✅ Implementeret

### ✅ Forbedring 5: Tilføj CRITICAL sektion
- **Problem:** Mangler emphasis på vigtige steps
- **Løsning:** Tilføjet CRITICAL sektion med klare instruktioner
- **Status:** ✅ Implementeret

---

## Test Resultater

- ✅ REASONING PROCESS sektion tilføjet - Pass - Struktureret tænkning før handling
- ✅ VERIFICATION CHECKLIST tilføjet - Pass - Validation steps før completion
- ✅ Background Mode instruktioner tilføjet - Pass - Klare guidelines om at validere før merge
- ✅ OUTPUT FORMAT forbedret - Pass - Konkrete eksempler og struktur
- ✅ CRITICAL sektion tilføjet - Pass - Klare instruktioner om vigtige steps

---

## Forbedringer Nødvendige (Fremtid)

- [Forbedring 1] - P3 - Tilføj eksempler på faktiske forbedringer fra chatten
- [Forbedring 2] - P3 - Tilføj sektion om at sammenligne med lignende commands automatisk

