# Repository Structure Assessment

**Dato**: 2025-11-15
**Analyseret efter**: Docs cleanup migration

## Executive Summary

Tekup AI v2 er en velstruktureret monorepo med moderne TypeScript stack. Efter migration af 81 docs filer er root nu langt renere, men der er stadig optimeringspotentiale omkring config-filer, test-struktur og midlertidige mapper.

## Metrics Overview

### Codebase Size

- **TypeScript**: 805 filer (primær kodebase)
- **JavaScript**: 116 filer (legacy/tooling)
- **Markdown**: 659 filer (omfattende dokumentation)
- **Config**: 97 filer
- **CSS**: 31 filer
- **Python**: 3 filer

### Code Distribution

```text
client/src:  450 TypeScript filer (Frontend React)
server:      260 TypeScript filer (Backend tRPC + Express)
shared:        4 TypeScript filer (Shared types)
scripts:      42 filer (Build/deploy automation)
cli:          12 filer (CLI tools)
database:      8 filer (Schema migrations)
drizzle:      13 filer (ORM config)

```

## Structural Analysis

### ✅ Major Strengths

#### 1. Clean Architectural Separation

```text
tekup-ai-v2/
├── client/          # Frontend (React + Vite)
├── server/          # Backend (tRPC + Express)
└── shared/          # Shared types & utils

```

**Vurdering**: Klassisk monorepo pattern med klar separation of concerns. Understøtter god code reuse og type safety på tværs.

#### 2. Comprehensive Documentation System

```text
docs/
├── ai-automation/       # AI system docs
├── email-system/        # Email features
├── status-reports/      # Progress tracking
├── integrations/        # External services
├── crm-business/        # CRM features
└── guides/             # User guides

```

**Vurdering**: Nu velorganiseret efter cleanup. 659 markdown filer struktureret logisk.

#### 3. Modern Tech Stack

- **TypeScript-first**: 805 TS vs 116 JS filer (87% type coverage)
- **tRPC**: Type-safe API layer
- **Drizzle ORM**: Type-safe database queries
- **Vite**: Modern build tooling
- **Playwright + Vitest**: Comprehensive testing

**Vurdering**: State-of-the-art tooling valg. Stærk type safety foundation.

#### 4. AI Integration Architecture

```text
server/integrations/
├── chromadb/         # Vector database
├── langfuse/         # LLM observability
├── litellm/          # LLM proxy
└── openrouter/       # Model routing

```

**Vurdering**: Velisoleret integration layer. Nemt at tilføje nye services.

#### 5. Component Organization

```text
client/src/components/
├── inbox/            # Email features
├── crm/              # CRM UI
├── chat/             # AI chat interface
├── leads/            # Lead management
├── panels/           # Side panels
├── workspace/        # Main workspace
└── ui/               # Reusable UI components

```

**Vurdering**: Feature-based organization. God modularity.

### ⚠️ Areas for Improvement

#### 1. Root Directory Pollution (DELVIST LØST)

**Problem**: 50 filer i root directory

```bash
Root files:

- 13 config filer (tsconfig, vite, playwright, etc.)
- 19 migration/check scripts (*.ts)
- 12 test scripts (test-*.mjs)
- 3 package managers (package.json, pnpm-lock, package-lock)
- 3 Docker configs

```

**Impact**:

- Svært at navigere
- Uklart hvad der er aktiv vs legacy
- Mixing concerns (config, scripts, tests)

**Anbefaling**:

```bash
Flyt til:

- config/ for tsconfig, vite, playwright
- scripts/migrations/ for migration scripts
- scripts/tests/ for test scripts
- .docker/ for Docker configs

```

#### 2. Scattered Test Infrastructure

**Problem**: Test-filer spredt over 3+ locations

```bash
tests/                  # Playwright E2E tests
test-results/          # Playwright output
playwright-report/     # HTML reports
client/src/__tests__/  # Component tests
server/__tests__/      # Backend tests
*.spec.ts (root)       # Isolated specs

```

**Impact**:

- Inkonsistent test location
- Svært at finde relevante tests
- Mixed test outputs

**Anbefaling**:

```bash
Konsolider til:
tests/
├── e2e/              # Playwright tests
├── integration/      # API tests
├── unit/            # Unit tests
└── results/         # Test outputs (gitignored)

```

#### 3. Temporary/Unused Directories

**Problem**: Flere mapper med lav/ingen anvendelse

```text
tasks/              - 2 files (næsten tom)
tmp/                - 1 file (temp data)
logs/               - 1 file (runtime logs)
migration-check/    - 2 files (legacy)
development-notes/  - 1 file (moved to docs)
figma-analysis/     - 6 files (design research)
AI Apps/            - 0 files (TOM)

```

**Impact**:

- Forvirring om formål
- Overlap med docs/
- Ikke clear cleanup policy

**Anbefaling**:

```text
Cleanup plan:

1. Slet tomme mapper (AI Apps, tasks)
2. Flyt figma-analysis → docs/design/
3. Flyt development-notes → docs/development-notes/
4. .gitignore tmp/ og logs/ (runtime only)
5. Arkivér migration-check/ → archive/

```

#### 4. Archive Fragmentation

**Problem**: 2 archive locations

```text
archive/               # Root-level archive
docs/archive/         # Docs archive
  ├── root/           # 102 files (old root docs)
  ├── tasks/          # 100 files (old tasks)
  └── test-results/   # 8 files

```

**Impact**:

- Unklart hvor ting arkiveres
- Duplikat struktur

**Anbefaling**:

```text
Konsolider til:
archive/
├── docs/           # Gammel dokumentation
├── code/           # Deprecated code
└── migrations/     # Old migration scripts

```

#### 5. Config File Sprawl

**Problem**: 13 config filer i root

```bash
.markdownlint.json
ai-eval-config.yaml
components.json
docker-compose.yml
docker-compose.supabase.yml
drizzle.config.ts
eslint.config.js
playwright.config.ts
promptfooconfig.yaml
tsconfig.json + 3 variants
vite.config.ts
vitest.config.ts

```

**Impact**:

- Root clutter
- Svært at finde rigtige config

**Anbefaling**:

```bash
Vurder mulighed for:
config/
├── typescript/      # tsconfig variants
├── build/          # vite.config.ts
├── test/           # playwright, vitest
├── lint/           # eslint, markdownlint
└── docker/         # docker-compose files

Note: Nogle tools kræver root placement (package.json, tsconfig.json)

```

#### 6. Script Organization

**Problem**: 19+ standalone scripts i root

```text
Migration scripts:

- add-alias-columns.ts
- add-missing-columns.ts
- check-*.ts (5 files)
- create-tables-directly.ts
- fix-emails-table.ts
- migrate-emails-schema.ts
- run-*.ts/mjs (6 files)

Test scripts:

- test-*.mjs (8 files)
- run-*-tests.ts (3 files)

```

**Impact**:

- Root pollution
- Uklart hvilke er aktive vs one-off
- Ingen organisering efter formål

**Anbefaling**:

```text
scripts/
├── migrations/
│   ├── active/      # Current migrations
│   └── archive/     # Historical migrations
├── testing/
│   ├── e2e/
│   ├── performance/
│   └── integration/
└── setup/
    └── database/

```

### 🔍 Component-Level Observations

#### Client Components (client/src/components/)

```text
✅ Positive:

- Feature-based organization (inbox, crm, leads, chat)
- Shared UI components isolated (ui/)
- Test co-location (__tests__/)

⚠️  Improvements:

- Nogle features har mange filer (inbox/ har 20+ components)
- Overvej sub-folder organization i store features
- Manglende Storybook stories for mange components

```

#### Server Organization (server/)

```text
✅ Positive:

- Clear router organization (routers/)
- Integration isolation (integrations/)
- Shared utilities (lib/, utils/)
- Core framework (_core/)

⚠️  Improvements:

- Root-level har mange loose files (60+ filer)
- Overvej domain-folders: server/domains/{email,crm,ai,billing}/
- AI logic spredt: friday-*.ts, ai-*.ts, llm-*.ts

```

## Detailed Recommendations

### Priority 1: High Impact, Low Effort

#### 1.1 Remove Empty/Unused Directories

```bash
# Remove completely empty
rmdir "AI Apps"

# Archive barely-used
git mv tasks archive/tasks
git mv migration-check archive/migrations

```text

**Impact**: Immediate visual cleanup
**Effort**: 5 minutes
**Risk**: Minimal (empty/archived)

#### 1.2 Consolidate Temporary Folders

```bash
# Add to .gitignore
echo "tmp/" >> .gitignore
echo "logs/" >> .gitignore
echo "*.log" >> .gitignore

```text

**Impact**: Prevent runtime clutter
**Effort**: 2 minutes
**Risk**: None

### Priority 2: Medium Impact, Medium Effort

#### 2.1 Organize Root Scripts

```bash
# Create structure
mkdir -p scripts/{migrations/archive,testing,setup}

# Move migration scripts
git mv add-alias-columns.ts scripts/migrations/archive/
git mv check-*.ts scripts/migrations/archive/
git mv fix-emails-table.ts scripts/migrations/archive/
git mv migrate-emails-schema.ts scripts/migrations/archive/

# Move test scripts
git mv test-*.mjs scripts/testing/
git mv run-*-tests.ts scripts/testing/

```text

**Impact**: Major root cleanup (19 files → 0)
**Effort**: 30 minutes (include path updates)
**Risk**: Low (update package.json scripts)

#### 2.2 Consolidate Test Structure

```bash
# Move Playwright
git mv tests tests-e2e
mkdir -p tests/{e2e,integration,unit}
git mv tests-e2e/* tests/e2e/

# Consolidate outputs
mkdir tests/results
git mv test-results tests/results/playwright
git mv playwright-report tests/results/reports

# Update .gitignore
echo "tests/results/" >> .gitignore

```text

**Impact**: Unified test discovery
**Effort**: 1 hour (update configs)
**Risk**: Medium (must update CI/CD)

### Priority 3: Low Impact / High Effort

#### 3.1 Server Domain Organization

```
Current: 60+ files in server/
Proposed: server/domains/{email,crm,ai,billing}/

Benefits:

- Better feature cohesion
- Easier to navigate large codebase
- Clearer ownership

Challenges:

- Large refactor (200+ files affected)
- Must update all imports
- Test updates required

```text

**Recommendation**: Defer til større refactor window

#### 3.2 Config Consolidation

```
Current: 13 config files in root
Proposed: config/ subfolder

Benefits:

- Cleaner root
- Grouped by purpose

Challenges:

- Many tools expect root configs
- Breaking change for team
- Tooling compatibility issues

```bash

**Recommendation**: Evaluate on case-by-case basis

## Migration Checklist

### Immediate (Today)

- [x] Docs migration (COMPLETED)
- [ ] Delete AI Apps/ (empty)
- [ ] Gitignore tmp/ and logs/
- [ ] Archive tasks/ and migration-check/

### Short-term (This Week)

- [ ] Move root scripts to scripts/
- [ ] Update package.json script paths
- [ ] Consolidate test outputs
- [ ] Archive figma-analysis/ to docs/design/

### Medium-term (This Month)

- [ ] Reorganize test structure
- [ ] Update CI/CD for new paths
- [ ] Archive duplicate docs/archive/ content
- [ ] Document folder conventions in README

### Long-term (Future)

- [ ] Evaluate server domain organization
- [ ] Consider config/ subfolder
- [ ] Component library extraction
- [ ] Storybook coverage

## Comparison: Before & After

### Root Directory

```
Before docs cleanup:

- 83 markdown files
- 50 config/script files
- Total: 133 files

After docs cleanup:

- 3 markdown files (README, CHANGELOG, plan)
- 50 config/script files
- Total: 53 files

After full cleanup (proposed):

- 3 markdown files
- 13 config files (minimum required in root)
- Total: ~16 files

```text

### Test Organization

```
Before:
tests/, test-results/, playwright-report/, *.spec.ts

After (proposed):
tests/
├── e2e/
├── integration/
├── unit/
└── results/ (gitignored)

```bash

## Known Issues

### Docs System Git Lock Error

**Problem**: Docs service fejler ved startup med git index.lock error

```
ERROR: [GitSync] Initialization failed
fatal: Unable to create '.git/index.lock': File exists.

```bash

**Root Cause**:

- Vores tidligere git commit operation blev afbrudt (timeout)
- Efterlod en .git/index.lock fil
- Docs service bruger simple-git til at sync docs
- Git afviser alle operationer når lock file eksisterer

**Fix**:

```bash
# Fjern stale lock file
Remove-Item .git\index.lock -Force

# Eller manuelt
rm .git/index.lock

# Restart dev server
npm run dev

```

**Prevention**:

- Undgå at afbryde git operationer
- Docs service bør have bedre error handling
- Overvej at disable git sync i development mode

## Conclusion

### Overall Grade: B+ (8/10)

**Strengths**:

- Solid architectural foundation (monorepo + TypeScript)
- Modern tooling choices
- Comprehensive documentation (now organized!)
- Good component modularity

**Weaknesses**:

- Root directory still cluttered with scripts
- Test structure fragmented
- Some temporary/unused folders
- Config sprawl
- Docs service git dependency fragile

**Priority Fixes**:

1. Fix git lock issue (CRITICAL - blocks dev server)
1. Move root scripts → scripts/ (HIGH impact, LOW effort)
1. Consolidate test outputs (MEDIUM impact, MEDIUM effort)
1. Clean up empty/archive folders (LOW impact, LOW effort)

**Recommendation**:

1. Immediate: Fix git lock issue
1. This week: Execute Priority 2 cleanups
1. Defer larger refactors (domain organization, config consolidation) til dedicated refactor sprint
1. Improve docs service robustness (better error handling, optional git sync)

---

**Next Steps**:

1. ✅ Fix git lock issue (DONE)
1. Review this assessment med team
1. Godkend cleanup priorities
1. Execute immediate actions
1. Schedule short-term migrations
1. Document new conventions
1. Improve docs service error handling
