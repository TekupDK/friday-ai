# Documentation Cleanup Plan

**Oprettet**: 2025-11-15
**Status**: Planlagt - Afventer godkendelse

## Problem

Der er 83 markdown filer spredt i roden af workspace istedet for at være organiseret i `docs/` systemet.

## Analyse

### Nuværende distribution

- **Root directory**: 83 .md filer
- **docs/**: 135 filer (godt organiseret)
- **docs/archive/root**: 102 filer (tidligere root-filer)
- **server/integrations/**: 9 filer (teknisk dokumentation)
- **test-results/**: Spredte .md filer fra Playwright

### Filkategorier i roden

#### Status & Progress (31 filer)

```text
PHASE0_*.md (6 filer)
PHASE1_*.md (7 filer)
PHASE2_COMPLETE.md
DAY*_*.md (7 filer)
CRM_PHASE*.md (3 filer)
*_STATUS.md (5 filer)
BUILD_STATUS_59.md
SESSION_FINAL_SUMMARY.md

```

#### AI & Automation (15 filer)

```text
AI_DOCS_*.md (7 filer)
FRIDAY_*.md (5 filer)
AUTONOMOUS-*.md (2 filer)
AGENTIC_RAG_IMPLEMENTATION.md

```

#### Email & CRM Features (9 filer)

```text
EMAIL_*.md (6 filer)
LEAD_FLOW_ANALYSIS.md
SENDER_GROUPING_CHANGE.md
POTENTIAL_INTEGRATIONS_ANALYSIS.md

```

#### Integration & Deployment (9 filer)

```text
LANGFUSE_*.md (3 filer)
LITELLM_DEPLOYMENT_GUIDE.md
CHROMADB_COMPLETE_SUMMARY.md
DEPLOYMENT_ROADMAP.md
INTEGRATION_IMPLEMENTATION_PLAN.md
SECURITY_IMPLEMENTATION.md
TOOL_*.md (2 filer)

```

#### Guides & Documentation (8 filer)

```text
COMPLETE_SHOWCASE_GUIDE.md
DOCS_*.md (3 filer)
*_GUIDE.md (2 filer)
README_GOOGLE_EXTRACTOR.md
DEV_NOTES_2025-11-12.md

```

#### Component & UI (6 filer)

```text
COMPONENT_SUMMARY.md
CHAT_PANEL_STATUS.md
ANIMATIONS_ADDED.md
NEW_UI_COMPONENTS_ADDED.md
SHOWCASE_*.md (2 filer)

```

#### Fixes & Misc (5 filer)

```text
PORT_FIX_COMPLETE.md
LLAMA_SERVER_FIX.md
START_SERVER_DEBUG.md
sample_output.md
CHANGELOG.md

```

## Foreslået Struktur

```text
docs/
├── status-reports/
│   ├── phases/
│   │   ├── phase-0/
│   │   ├── phase-1/
│   │   └── phase-2/
│   ├── daily-progress/
│   └── feature-status/
├── ai-automation/
│   ├── friday-ai/
│   ├── docs-generation/
│   └── agentic-rag/
├── email-system/
│   ├── email-center/
│   ├── intelligence/
│   └── pipeline/
├── integrations/
│   ├── langfuse/
│   ├── litellm/
│   ├── chromadb/
│   └── tools/
├── crm-business/
│   ├── phases/
│   └── leads/
├── ui-frontend/
│   ├── components/
│   └── chat-panel/
├── devops-deploy/
│   ├── deployment/
│   └── security/
├── development-notes/
│   └── fixes/
└── guides/
    ├── quick-start/
    └── showcases/

```

## Migrations Plan

### Fase 1: Status & Progress Reports (PRIORITY HIGH)

**Destination**: `docs/status-reports/`

```bash
# Phase reports
docs/status-reports/phases/phase-0/

  - PHASE0_DARK_MODE_FIX_COMPLETE.md
  - PHASE0_STORYBOOK_COMPLETE.md
  - PHASE0_THEME_VERIFICATION_SESSION.md
  - PHASE0_VERIFICATION_COMPLETE.md

docs/status-reports/phases/phase-1/

  - PHASE1_FINAL_REPORT.md
  - PHASE1_FINAL_STATUS.md
  - PHASE1_PHASE2_FINAL_STATUS.md
  - PHASE1_SCREENSHOT_ANALYSIS.md
  - PHASE1_TEST_GUIDE.md
  - PHASE1_TEST_RESULTS.md
  - PHASE1_TESTS_COMPLETE.md

docs/status-reports/phases/phase-2/

  - PHASE2_COMPLETE.md

docs/status-reports/daily-progress/

  - DAY1_DAY2_COMPLETE.md
  - DAY2_LANGFUSE_SETUP.md
  - DAY3_COMPLETE.md
  - DAY3_LANGFUSE_INTEGRATION_COMPLETE.md
  - DAY4_5_CHROMADB_SETUP_COMPLETE.md
  - DAY4_COMPLETE.md
  - DAY5_COMPLETE.md
  - DEV_NOTES_2025-11-12.md

docs/status-reports/feature-status/

  - BUILD_STATUS_59.md
  - CHAT_PANEL_STATUS.md
  - COMPREHENSIVE_TEST_STATUS.md
  - EMAIL_CENTER_PHASE1_STATUS.md
  - SESSION_FINAL_SUMMARY.md
  - FINAL_SESSION_SUMMARY_NOV8.md

```text

### Fase 2: AI & Automation (PRIORITY HIGH)

**Destination**: `docs/ai-automation/`

```bash
docs/ai-automation/docs-generation/

  - AI_DOCS_COMPONENTS_AI.md
  - AI_DOCS_DEPLOYMENT_CHECKLIST.md
  - AI_DOCS_FINAL_STATUS.md
  - AI_DOCS_GENERATOR_PLAN.md
  - AI_DOCS_IMPLEMENTATION_STATUS.md
  - AI_DOCS_STATUS.md
  - AI_DOCS_STEP3_COMPLETE.md
  - AI_DOCS_TEST_GUIDE.md
  - AI_DOCS_TEST_SUMMARY.md
  - DOCS_COMPLETION_STATUS.md
  - DOCS_DEMO_GUIDE.md
  - DOCS_NEXT_STEPS.md

docs/ai-automation/friday-ai/

  - FRIDAY_AI_COMPONENTS_GUIDE.md
  - FRIDAY_AI_SHOWCASE_GUIDE.md
  - FRIDAY_DOCS_QUICK_REF.md
  - FRIDAY_DOCS_SYSTEM.md
  - FRIDAY_DOCS_UPDATE_COMPLETE.md

docs/ai-automation/agentic-rag/

  - AGENTIC_RAG_IMPLEMENTATION.md
  - AUTONOMOUS-COMPLETION-SUMMARY.md
  - AUTONOMOUS-QUICK-START.md

```text

### Fase 3: Email System (PRIORITY MEDIUM)

**Destination**: `docs/email-system/`

```bash
docs/email-system/email-center/

  - EMAIL_CENTER_ANALYSIS.md
  - EMAIL_CENTER_DESIGN_GAP_ANALYSIS.md
  - EMAIL_CENTER_PHASE1_COMPLETE.md
  - EMAIL_CENTER_PHASE1_STATUS.md (duplicate - moved in Fase 1)
  - EMAIL_CENTER_SHORTWAVE_IMPLEMENTATION_COMPLETE.md

docs/email-system/intelligence/

  - EMAIL_INTELLIGENCE_COMPLETE.md
  - EMAIL_INTELLIGENCE_DESIGN.md

docs/email-system/leads/

  - LEAD_FLOW_ANALYSIS.md
  - SENDER_GROUPING_CHANGE.md

```text

### Fase 4: Integrations (PRIORITY MEDIUM)

**Destination**: `docs/integrations/`

```bash
docs/integrations/langfuse/

  - LANGFUSE_COMPLETE_GUIDE.md
  - LANGFUSE_SETUP_COMPLETE.md
  - LANGFUSE_V3_DEPLOYED.md

docs/integrations/litellm/

  - LITELLM_DEPLOYMENT_GUIDE.md

docs/integrations/chromadb/

  - CHROMADB_COMPLETE_SUMMARY.md

docs/integrations/general/

  - INTEGRATION_IMPLEMENTATION_PLAN.md
  - POTENTIAL_INTEGRATIONS_ANALYSIS.md

docs/integrations/tools/

  - TOOL_CALLING_RATE_LIMITS.md
  - TOOL_EXECUTION_IMPLEMENTATION.md

```text

### Fase 5: CRM Business (PRIORITY MEDIUM)

**Destination**: `docs/crm-business/`

```bash
docs/crm-business/phases/

  - CRM_PHASE1_COMPLETE.md
  - CRM_PHASE2_6_COMPLETE.md
  - CRM_PHASE2_6_IMPLEMENTATION_COMPLETE.md

```text

### Fase 6: UI & Components (PRIORITY LOW)

**Destination**: `docs/ui-frontend/`

```bash
docs/ui-frontend/components/

  - COMPONENT_SUMMARY.md
  - ANIMATIONS_ADDED.md
  - NEW_UI_COMPONENTS_ADDED.md

docs/ui-frontend/chat-panel/

  - CHAT_PANEL_STATUS.md (duplicate - moved in Fase 1)

```text

### Fase 7: Guides & Showcases (PRIORITY LOW)

**Destination**: `docs/guides/`

```bash
docs/guides/showcases/

  - COMPLETE_SHOWCASE_GUIDE.md
  - FINAL_SHOWCASE_COMPLETE.md
  - SHOWCASE_IMPROVEMENTS_ANALYSIS.md
  - SHOWCASE_UPDATE_COMPLETE.md

docs/guides/testing/

  - REAL_WORLD_TEST_RESULTS.md

docs/guides/extraction/

  - README_GOOGLE_EXTRACTOR.md

```text

### Fase 8: DevOps & Deployment (PRIORITY LOW)

**Destination**: `docs/devops-deploy/`

```bash
docs/devops-deploy/deployment/

  - DEPLOYMENT_ROADMAP.md

docs/devops-deploy/security/

  - SECURITY_IMPLEMENTATION.md

```text

### Fase 9: Development Notes & Fixes (PRIORITY LOW)

**Destination**: `docs/development-notes/`

```bash
docs/development-notes/fixes/

  - PORT_FIX_COMPLETE.md
  - LLAMA_SERVER_FIX.md
  - START_SERVER_DEBUG.md
  - sample_output.md

```text

### Fase 10: Root Level Files (KEEP)

**Action**: BEHOLD I ROOT

```bash
# Core documentation
README.md
CHANGELOG.md

```text

## Implementation Steps

### 1. Opret mappestruktur

```powershell
# Create phase directories
New-Item -ItemType Directory -Force -Path "docs\status-reports\phases\phase-0"
New-Item -ItemType Directory -Force -Path "docs\status-reports\phases\phase-1"
New-Item -ItemType Directory -Force -Path "docs\status-reports\phases\phase-2"
New-Item -ItemType Directory -Force -Path "docs\status-reports\daily-progress"
New-Item -ItemType Directory -Force -Path "docs\status-reports\feature-status"

# Create AI directories
New-Item -ItemType Directory -Force -Path "docs\ai-automation\docs-generation"
New-Item -ItemType Directory -Force -Path "docs\ai-automation\friday-ai"
New-Item -ItemType Directory -Force -Path "docs\ai-automation\agentic-rag"

# Create email directories
New-Item -ItemType Directory -Force -Path "docs\email-system\email-center"
New-Item -ItemType Directory -Force -Path "docs\email-system\intelligence"
New-Item -ItemType Directory -Force -Path "docs\email-system\leads"

# Create integration directories
New-Item -ItemType Directory -Force -Path "docs\integrations\langfuse"
New-Item -ItemType Directory -Force -Path "docs\integrations\litellm"
New-Item -ItemType Directory -Force -Path "docs\integrations\chromadb"
New-Item -ItemType Directory -Force -Path "docs\integrations\general"
New-Item -ItemType Directory -Force -Path "docs\integrations\tools"

# Create CRM directories
New-Item -ItemType Directory -Force -Path "docs\crm-business\phases"

# Create UI directories
New-Item -ItemType Directory -Force -Path "docs\ui-frontend\components"
New-Item -ItemType Directory -Force -Path "docs\ui-frontend\chat-panel"

# Create guides directories
New-Item -ItemType Directory -Force -Path "docs\guides\showcases"
New-Item -ItemType Directory -Force -Path "docs\guides\testing"
New-Item -ItemType Directory -Force -Path "docs\guides\extraction"

# Create devops directories
New-Item -ItemType Directory -Force -Path "docs\devops-deploy\deployment"
New-Item -ItemType Directory -Force -Path "docs\devops-deploy\security"

# Create development notes directories
New-Item -ItemType Directory -Force -Path "docs\development-notes\fixes"

```bash

### 2. Flyt filer (med git)

```powershell
# Brug git mv for at bevare historik
git mv PHASE0_DARK_MODE_FIX_COMPLETE.md docs\status-reports\phases\phase-0\
# ... osv for alle filer

```text

### 3. Opret Index filer

```powershell
# Generate README.md in hver subdir med liste over filer

```text

### 4. Opdater root README.md

- Link til docs struktur
- Navigation guide

### 5. Commit changes

```powershell
git add .
git commit -m "docs: Reorganize documentation into structured folders"

```text

## Risici & Mitigations

### Risiko 1: Broken links

**Mitigation**: Search and replace alle interne links efter move

```powershell
# Find all .md files with links
Get-ChildItem -Recurse -Include *.md | Select-String -Pattern "\[.*\]\(.*\.md\)"

```bash

### Risiko 2: External references

**Mitigation**: Check for references i kode (.ts, .tsx, .js files)

```powershell
Get-ChildItem -Recurse -Include *.ts,*.tsx,*.js | Select-String -Pattern "\.md"

```

### Risiko 3: Git history

**Mitigation**: Brug `git mv` istedet for `mv` - bevarer historik

## Success Criteria

- [ ] Alle 83 root .md filer er flyttet til passende docs subdirectories
- [ ] Kun README.md og CHANGELOG.md forbliver i root
- [ ] Alle interne links er opdateret og fungerer
- [ ] INDEX.md eller README.md i hver subdir
- [ ] Git history bevaret
- [ ] Ingen broken references i kode

## Estimeret tid

- Fase 1-2: 30 minutter (høj prioritet)
- Fase 3-5: 30 minutter (medium prioritet)
- Fase 6-9: 30 minutter (lav prioritet)
- Link validation: 15 minutter
- Total: ~2 timer

## Næste skridt

1. Godkendelse af plan
1. Create backup branch
1. Execute migration scripts
1. Test & validate
1. PR & merge

---

**Vil du have mig til at**:
A) Starte migration nu (automated script)
B) Generere migration scripts først til review
C) Starte med kun Fase 1-2 (høj prioritet)
D) Noget andet
