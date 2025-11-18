# Commands Analysis Summary - Gennemgang

**Dato:** 2025-11-16  
**Total Commands:** 371  
**Status:** ✅ ANALYSE GENNEMGÅET

---

## 📊 EXECUTIVE SUMMARY

**Hovedproblem:** 371 commands i én flad mappe - ingen organisering, duplikationer, og inkonsistent naming.

**Løsning:** Struktureret cleanup og organisering i mapper med klar naming convention.

---

## 🔍 DETALJERET GENNEMGANG

### 1. STRUKTUR PROBLEM (KRITISK)

**Nuværende:**

```
.cursor/commands/
├── _meta/
└── 371 *.md filer (FLAT)
```

**Problem:**

- Umuligt at finde commands
- Ingen logisk gruppering
- Overvældende at browse

**Løsning:**

```
.cursor/commands/
├── _meta/
├── core/              # Session, status, context
├── development/       # Create, implement, refactor
├── testing/           # All test commands
├── debugging/         # All debug commands
├── ai/                # AI & Friday commands
├── tekup/             # Tekup-specific
├── chat/              # Chat context commands
└── explain/           # Explain commands
```

---

### 2. DUPLIKATIONER (HØJ PRIORITET)

#### A. TODO Management Duplikater

**Identificeret:**

- `opdater-todo-status.md` (Dansk) - 5.2KB
- `update-todo-status.md` (Engelsk) - 5.2KB

**Anbefaling:** Merge til `update-todo-status.md` (engelsk standard)

#### B. Session Management Duplikater

**Identificeret:**

- `forsaet-arbejde.md` (Dansk) - "Fortsæt arbejde"
- `continue-from-prompt.md` (Engelsk) - "Continue from prompt"
- `continue-where-left-off.md` (Engelsk)
- `resume-development.md` (Engelsk)
- `resume-from-session-point.md` (Engelsk)

**Anbefaling:**

- Behold `continue-from-prompt.md` (master)
- Merge `forsaet-arbejde.md` ind i `continue-from-prompt.md`
- Vurder om `continue-where-left-off.md` og `resume-*` skal merges

#### C. Commit Duplikater

**Identificeret:**

- `commit-arbejde.md` (Dansk) - "Commit arbejde"
- `git-commit-my-work.md` (Engelsk)
- `git-commit-session.md` (Engelsk)
- `commit-session-work.md` (Engelsk)
- `commit-chat-session-changes.md` (Engelsk)

**Anbefaling:**

- Merge alle til `commit-work.md` (generisk)
- Eller beholde `commit-session-work.md` som master

#### D. Chat Context Duplikater

**Identificeret:**

- `konverter-chat-til-todos.md` (Dansk)
- `generate-todos-from-chat.md` (Engelsk)
- `convert-chat-to-todos.md` (Engelsk)

**Anbefaling:** Merge til `generate-todos-from-chat.md`

---

### 3. TOM FIL (KRITISK)

**Identificeret:**

- `fors.md` - 0 bytes (TOM FIL)

**Anbefaling:** SLET MED DET SAMME

---

### 4. KORTE COMMANDS (MEDIUM PRIORITET)

**Identificerede korte commands (< 1000 bytes):**

1. `fors.md` - 0 bytes ⚠️ SLET
2. `minimal-repro-test.md` - 313 bytes
3. `doc-auto.md` - 314 bytes
4. `review-change.md` - 355 bytes
5. `convert-chat-to-todos.md` - 428 bytes
6. `hot-reload-fix.md` - 445 bytes
7. `sammenfat-chat-samtale.md` - 963 bytes

**Anbefaling:**

- Korte commands er OK hvis de er "operationsklare" (kortfattede prompts)
- Men de skal have minimum struktur: ROLE, TASK, GUIDELINES
- Udvid kun hvis de mangler essentiel information

---

### 5. NAMING CONVENTION (HØJ PRIORITET)

**Problem:** Blandet dansk/engelsk

**Eksempler:**

- `afslut-session.md` (Dansk) vs `session-summary.md` (Engelsk)
- `opdater-todo-status.md` (Dansk) vs `update-todo-status.md` (Engelsk)
- `forsaet-arbejde.md` (Dansk) vs `continue-from-prompt.md` (Engelsk)
- `commit-arbejde.md` (Dansk) vs `git-commit-my-work.md` (Engelsk)

**Anbefaling:**

- **Standardiser til ENGELSK** (anbefalet)
- Eller standardiser til DANSK (hvis det er projektets standard)
- **IKKE begge!**

**Rationale for engelsk:**

- International standard
- Bedre søgbarhed
- Konsistent med resten af codebase (TypeScript, React, etc.)

---

### 6. KATEGORISERING (MEDIUM PRIORITET)

**Nuværende kategorier:**

- AI & LLM (15+)
- Development (30+)
- Testing (15+)
- Debugging (15+)
- Session Management (10+)
- Task & Work Management (5+)
- Sprint Management (5+)
- Chat Context (13+)
- Explain (8)
- Chat Analysis (2)
- Testing & Improvement (5)

**Problem:** Nogle commands er i flere kategorier

**Løsning:** Klar hierarki:

1. **Core** - Session, status, context
2. **Development** - Create, implement, refactor
3. **Testing** - All test commands
4. **Debugging** - All debug commands
5. **AI** - AI & Friday specific
6. **Tekup** - Business-specific
7. **Chat** - Chat context
8. **Explain** - Explanation commands

---

## 📋 PRIORITERET HANDLINGSPLAN

### FASE 1: Quick Wins (1-2 timer)

1. ✅ **Slet tom fil:**
   - `fors.md` (0 bytes)

2. ✅ **Merge åbenlyse duplikater:**
   - `opdater-todo-status.md` → `update-todo-status.md`
   - `forsaet-arbejde.md` → `continue-from-prompt.md`
   - `konverter-chat-til-todos.md` → `generate-todos-from-chat.md`

3. ✅ **Opret mapper struktur:**
   - `core/`, `development/`, `testing/`, `debugging/`, `ai/`, `tekup/`, `chat/`, `explain/`

### FASE 2: Organisering (2-4 timer)

1. ✅ **Flyt commands til mapper:**
   - Session commands → `core/`
   - Development commands → `development/`
   - Testing commands → `testing/`
   - Debugging commands → `debugging/`
   - AI commands → `ai/`
   - Tekup commands → `tekup/`
   - Chat commands → `chat/`
   - Explain commands → `explain/`

2. ✅ **Opdater index filer:**
   - `COMMANDS_INDEX.md` med nye paths
   - `COMMANDS_BY_CATEGORY.md` med nye strukturer

### FASE 3: Standardisering (4-6 timer)

1. ✅ **Standardiser naming:**
   - Vælg engelsk ELLER dansk
   - Omdøb alle commands til samme sprog
   - Opdater alle references

2. ✅ **Forbedre korte commands:**
   - Tilføj minimum struktur (ROLE, TASK, GUIDELINES)
   - Kun hvis de mangler essentiel information

### FASE 4: Dokumentation (1-2 timer)

1. ✅ **Opret README:**
   - `README.md` i `.cursor/commands/`
   - Forklar struktur og naming

2. ✅ **Opret Quick Start:**
   - `QUICK_START.md` med top 20 commands

---

## 📊 FORVENTET RESULTAT

### Før Cleanup:

- **Total:** 371 commands
- **Duplikater:** ~15-20
- **Tomme filer:** 1
- **Struktur:** FLAT (ingen organisering)

### Efter Cleanup:

- **Total:** ~350 commands (efter merge)
- **Duplikater:** 0
- **Tomme filer:** 0
- **Struktur:** Organiseret i 8 mapper
- **Naming:** 100% konsistent (engelsk ELLER dansk)

---

## ✅ ANBEFALING

**Start med FASE 1 (Quick Wins):**

1. Slet `fors.md`
2. Merge åbenlyse duplikater
3. Opret mapper struktur

**Derefter FASE 2 (Organisering):**

- Flyt commands til mapper
- Opdater index filer

**Til sidst FASE 3 (Standardisering):**

- Vælg engelsk ELLER dansk
- Standardiser alle commands

---

**Status:** ✅ KLAR TIL IMPLEMENTATION

**Spørgsmål til dig:**

1. Skal vi standardisere til engelsk eller dansk?
2. Skal jeg starte med FASE 1 nu?
3. Er der nogle commands du vil beholde som de er?
