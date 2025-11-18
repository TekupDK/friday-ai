# Commands Deep Analysis - 12 Timer Arbejde

**Dato:** 2025-11-16  
**Total Commands:** 371 commands  
**Status:** 🔄 UNDER ANALYSE

---

## 📊 Executive Summary

**Problem:** Du er blevet overvældet af 371 commands i `.cursor/commands` mappen.

**Løsning:** Denne analyse identificerer alle problemer, duplikationer, mangler, og giver en klar handlingsplan for at få total styr på commands systemet.

---

## 🔍 FASE 1: Struktur Analyse

### Nuværende Struktur

```
.cursor/commands/
├── _meta/                    # Metadata og index filer
│   ├── COMMANDS_INDEX.md     # A-Z index
│   ├── COMMANDS_BY_CATEGORY.md
│   ├── CHANGELOG.md
│   └── ...
└── *.md                      # 371 commands (FLAT STRUCTURE)
```

**Problem:** Alle commands er i én flad mappe - ingen organisering!

### Foreslået Struktur

```
.cursor/commands/
├── _meta/                    # Metadata
├── core/                     # Core commands (session, status, etc.)
│   ├── session-engine.md
│   ├── developer-mode.md
│   └── ...
├── development/              # Development commands
│   ├── create/
│   ├── implement/
│   ├── refactor/
│   └── ...
├── testing/                  # Testing commands
├── debugging/                # Debugging commands
├── ai/                       # AI & Friday commands
├── tekup/                    # Tekup-specific commands
├── chat/                     # Chat context commands
├── explain/                  # Explain commands
└── ...
```

---

## 🔍 FASE 2: Duplikation Analyse

### Identificerede Duplikationer

**TODO Management (12+ commands):**

- `complete-todo-task.md`
- `batch-complete-todos.md`
- `cleanup-completed-todos.md`
- `cleanup-todos.md`
- `update-todo-status.md`
- `opdater-todo-status.md` ⚠️ DUPLIKAT
- `track-todo-progress.md`
- `prioritize-todos.md`
- `find-blocked-todos.md`
- `split-large-todo.md`
- `create-todo-from-bug.md`
- `create-todo-from-feature-request.md`
- `create-sprint-todos.md`
- `generate-todos-from-chat.md`
- `konverter-chat-til-todos.md` ⚠️ DUPLIKAT

**Session Management (15+ commands):**

- `session-engine.md`
- `session-init.md`
- `session-progress.md`
- `session-next-step.md`
- `session-todos.md`
- `session-implement.md`
- `session-summary.md`
- `continue-session.md`
- `continue-from-prompt.md`
- `continue-conversation.md`
- `continue-where-left-off.md`
- `continue-implementation.md`
- `continue-todos.md`
- `forsaet-arbejde.md` ⚠️ DUPLIKAT
- `forsaet-samtale.md` ⚠️ DUPLIKAT
- `resume-development.md` ⚠️ DUPLIKAT
- `resume-from-session-point.md` ⚠️ DUPLIKAT
- `maintain-context.md`

**Chat Context (13+ commands):**

- `laes-chat-samtale.md`
- `analyser-chat-kontekst.md`
- `brug-chat-informationer.md`
- `ekstraher-chat-data.md`
- `sammenfat-chat-samtale.md`
- `opdater-chat-summary.md`
- `konverter-chat-til-todos.md`
- `identificer-chat-patterns.md`
- `forsta-chat-kontekst.md`
- `ekstraher-chat-requirements.md`
- `valider-chat-informationer.md`
- `opret-chat-dokumentation.md`
- `sammenlign-chat-samtaler.md`
- `analyser-chat-sessioner.md`
- `laes-chat-fra-database.md`

**Implementation (10+ commands):**

- `implement-feature.md`
- `implement-feature-fullstack.md`
- `implement-from-chat-summary.md`
- `implement-iteratively.md`
- `implement-with-clarification.md`
- `implement-scenario-backend-only.md`
- `implement-scenario-frontend-only.md`
- `implement-scenario-fullstack.md`
- `implement-scenario-refactor.md`
- `implement-scenario-bugfix.md`
- `implement-scenario-feature.md`
- `implement-trpc-router.md`

**Commit (5+ commands):**

- `commit-arbejde.md`
- `commit-chat-session-changes.md`
- `commit-only-my-changes.md`
- `commit-session-work.md`
- `git-commit-my-work.md` ⚠️ DUPLIKAT
- `git-commit-session.md` ⚠️ DUPLIKAT
- `auto-commit.md`

**Create Component (5+ commands):**

- `create-react-component.md`
- `create-react-page.md`
- `create-ui-component.md`
- `create-shadcn-component.md`
- `component-library.md`

---

## 🔍 FASE 3: Kvalitet Analyse

### Commands Med Problemer

**Tomme/Fejlagtige:**

- `fors.md` - 0 bytes (TOM FIL)

**Korte Commands (< 50 lines):**

- `sammenfat-chat-samtale.md` - 45 lines
- `konverter-chat-til-todos.md` - 46 lines
- `forklar-kode.md` - 49 lines
- `forklar-fejl.md` - 53 lines
- `forklar-workflow.md` - 53 lines
- `valider-chat-informationer.md` - 50 lines

**Mangler Prompt Engineering Struktur:**

- Mange korte commands mangler fuld struktur
- Nogle commands har kun TASK, mangler ROLE & CONTEXT
- Nogle commands mangler TOOL USAGE
- Nogle commands mangler OUTPUT FORMAT

---

## 🔍 FASE 4: Kategorisering Analyse

### Nuværende Kategorier (Fra COMMANDS_BY_CATEGORY.md)

1. **AI & LLM Commands** (15+)
2. **Development Commands** (30+)
3. **Testing Commands** (15+)
4. **Debugging Commands** (15+)
5. **Session Management** (10+)
6. **Task & Work Management** (5+)
7. **Sprint Management** (5+)
8. **Chat Context Commands** (13+)
9. **Explain Commands** (8)
10. **Chat Analysis Commands** (2)
11. **Testing & Improvement Commands** (5)

**Problem:** Kategorier er ikke konsistente, nogle commands er i flere kategorier.

---

## 🔍 FASE 5: Naming Convention Analyse

### Problemer

**Dansk vs Engelsk:**

- `afslut-session.md` (Dansk)
- `session-summary.md` (Engelsk)
- `opdater-todo-status.md` (Dansk)
- `update-todo-status.md` (Engelsk) ⚠️ DUPLIKAT

**Inconsistent Naming:**

- `create-trpc-procedure.md` vs `implement-trpc-router.md`
- `fix-bug.md` vs `bug-fix.md`
- `test-changed-files.md` vs `test-from-chat-summary.md`

**Forslag:** Standardiser til engelsk, eller dansk - ikke begge!

---

## 📋 HANDLINGSPLAN

### Prioritet 1: Cleanup (HØJ)

1. **Slet tomme filer:**
   - `fors.md` (0 bytes)

2. **Merge duplikater:**
   - `opdater-todo-status.md` + `update-todo-status.md` → `update-todo-status.md`
   - `forsaet-arbejde.md` + `continue-from-prompt.md` → `continue-from-prompt.md`
   - `git-commit-my-work.md` + `commit-arbejde.md` → `commit-work.md`

3. **Organiser i mapper:**
   - Opret mapper: `core/`, `development/`, `testing/`, `debugging/`, `ai/`, `tekup/`, `chat/`, `explain/`
   - Flyt commands til relevante mapper

### Prioritet 2: Struktur (MEDIUM)

1. **Standardiser naming:**
   - Vælg engelsk ELLER dansk (anbefaler engelsk)
   - Opdater alle commands til samme sprog

2. **Forbedre korte commands:**
   - Udvid korte commands (< 50 lines) med fuld prompt engineering struktur

3. **Opdater index filer:**
   - Opdater `COMMANDS_INDEX.md` med nye paths
   - Opdater `COMMANDS_BY_CATEGORY.md` med nye strukturer

### Prioritet 3: Dokumentation (LAV)

1. **Opret README:**
   - `README.md` i `.cursor/commands/` med oversigt
   - Forklar struktur og naming conventions

2. **Opret Quick Start:**
   - `QUICK_START.md` med de 20 mest brugte commands

---

## 📊 STATISTIK

### Nuværende Status

- **Total Commands:** 371
- **Duplikater:** ~15-20 commands
- **Tomme filer:** 1 (`fors.md`)
- **Korte commands (< 50 lines):** ~30 commands
- **Mangler struktur:** ~50 commands

### Efter Cleanup (Forventet)

- **Total Commands:** ~350 (efter merge af duplikater)
- **Organiseret i:** 8-10 mapper
- **Standardiseret:** 100% engelsk ELLER dansk
- **Fuld struktur:** 100% af commands

---

## ✅ NÆSTE SKRIDT

1. **Godkend handlingsplan** - Skal vi fortsætte?
2. **Start cleanup** - Slet tomme filer, merge duplikater
3. **Opret mapper** - Organiser commands i mapper
4. **Standardiser** - Engelsk eller dansk?
5. **Opdater index** - Opdater alle index filer

---

**Status:** 🔄 UNDER ANALYSE - Vent på godkendelse før implementation
