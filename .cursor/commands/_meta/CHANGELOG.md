# Commands Changelog

This changelog tracks all changes to the Friday AI Chat commands system.

## [2025-01-28] - Documentation Auto-Categorization System

### Added

#### Documentation Management (1 new feature)

- Auto-categorization script (`scripts/auto-categorize-docs.ts`) - Automatically organizes 470+ markdown files into structured hierarchy
  - Pattern-based categorization with 50+ rules
  - Priority-based matching system
  - Dry-run and verbose modes
  - Safety features (skip existing, conflict detection, archive protection)
  - 88% automatic categorization rate (413/470 files)

#### NPM Scripts (3 new scripts)

- `docs:categorize` - Execute documentation categorization
- `docs:categorize:dry-run` - Preview categorization changes without moving files
- `docs:categorize:verbose` - Detailed output showing each file operation

#### Documentation Files (2 new guides)

- `docs/DOCS_AUTO_CATEGORIZATION_GUIDE.md` - Complete user guide for auto-categorization
- `docs/DOCS_CATEGORIZATION_STATUS.md` - Status report and progress tracking

### Changed

#### Documentation Organization

- Created structured category hierarchy with 12 main categories:
  - `status-reports/` - Sessions, sprints, phases, reviews, todos
  - `ai-automation/` - AI docs, Friday AI, agentic RAG
  - `email-system/` - Email center, leads, integrations
  - `integrations/` - Langfuse, LiteLLM, ChromaDB, tools
  - `crm-business/` - CRM phases and guides
  - `ui-frontend/` - Components, features, design, branding
  - `devops-deploy/` - Deployment, security, monitoring
  - `development-notes/` - Fixes, debugging, notes, setup
  - `guides/` - General guides, quick-start, testing
  - `core/` - Architecture, API, development guides
  - `features/` - Realtime, specs, implementation
  - `migration/` - Versioning, database migrations

### Statistics

- **Total Files Scanned:** 470 markdown files
- **Files Categorized:** 413 files (88%)
- **Uncategorized:** 57 files (12%)
- **Categorization Rules:** 50+ pattern-based rules
- **Improvement:** 44% reduction in uncategorized files (102 → 57)

### Technical Details

- **Language:** TypeScript
- **Runtime:** Node.js with tsx
- **Pattern Matching:** Regex-based with priority system
- **Safety:** Dry-run mode, conflict detection, archive protection
- **Extensibility:** Easy to add new categorization rules

---

## [2025-11-16] - Major Update: Prompt Engineering v2.2.0 + Date Fixes

### Added

#### Template System (4 new templates)

- `TEMPLATE_AI_FOCUSED.md` - Template for AI-focused commands
- `TEMPLATE_ANALYSIS.md` - Template for analysis commands
- `TEMPLATE_DEBUG.md` - Template for debug commands
- `TEMPLATE_GUIDE.md` - Guide for selecting and using templates

#### Index Improvements (3 new files)

- `COMMANDS_BY_CATEGORY.md` - Commands organized by category with Most Used section
- `COMMANDS_INDEX_ANALYSIS.md` - Comprehensive analysis of command coverage and recommendations
- Updated `COMMANDS_INDEX.md` - Added Most Used section and Quick Links

#### Tekup-Specific Commands (8 new commands)

- `create-lead-workflow.md` - Create lead processing workflow automation
- `create-invoice-approval-workflow.md` - Create invoice approval workflow with Billy.dk
- `create-job-completion-checklist.md` - Create job completion checklist automation
- `test-friday-intent-actions.md` - Test Friday AI's 7 intent actions
- `debug-billy-sync.md` - Debug Billy.dk synchronization issues
- `optimize-billy-queries.md` - Optimize Billy.dk API queries for performance
- `debug-friday-memory-rules.md` - Debug Friday AI's 25 MEMORY business rules
- `optimize-friday-prompt.md` - Optimize Friday AI system prompts for cost and accuracy

#### Session Management (1 new command)

- `uddyb-chat-kontekst.md` - Uddyb chat kontekst fra samtalen med detaljeret gennemgang

#### Analysis & Elaboration Commands (4 new commands)

- `uddyb-feature-implementation.md` - Uddyb feature implementation med tekniske detaljer og kode eksempler
- `uddyb-deployment-plan.md` - Uddyb deployment plan med step-by-step guide og rollback strategier
- `uddyb-test-strategy.md` - Uddyb test strategy med test cases, automation, og quality metrics
- `uddyb-performance-analysis.md` - Uddyb performance analysis med metrics, bottlenecks, og optimizations

#### Task & Work Management Commands (7 new commands)

- `afslut-session.md` - Afslut udviklingssession professionelt med sammenfatning og næste skridt
- `identificer-manglende.md` - Identificer manglende dele, gaps, og ufærdige opgaver med prioritering
- `hvad-nu.md` - Identificer næste skridt og prioriter opgaver baseret på kontekst
- `commit-arbejde.md` - Commit arbejde professionelt med beskrivende commit messages
- `task-faerdig.md` - Marker task som færdig og verificer completion med summary
- `fortsaet-todo.md` - Fortsæt TODO arbejde systematisk med prioritering
- `opdater-todo-status.md` - Opdater TODO status systematisk med status tracking

#### Sprint Management (2 new commands)

- `opdater-sprint.md` - Opdater sprint med nye tasks baseret på fuldførte opgaver og sprint metrics
- `create-sprint-plan.md` - Opret sprint plan med backlog analyse, task prioritering, og daily breakdown

#### Tekup-Specific (2 new commands)

- `create-flytterengøring-workflow.md` - Opret flytterengøring workflow automation med MEMORY_16 compliance
- `create-customer-onboarding.md` - Opret customer onboarding workflow fra lead til active customer

#### Sprint Management (3 additional commands)

- `sprint-retrospective.md` - Faciliter sprint retrospective med learnings og action items
- `sprint-burndown.md` - Analyser sprint burndown med trends og completion projection
- `sprint-velocity.md` - Tracker sprint velocity med trends og capacity planning

#### Tekup-Specific (5 additional commands)

- `create-recurring-cleaning-workflow.md` - Opret recurring cleaning workflow automation med scheduling og invoicing
- `test-billy-integration.md` - Test Billy.dk integration omfattende med alle endpoints og business rules
- `create-pricing-calculator.md` - Opret pricing calculator for cleaning services med time-based og square meter pricing
- `create-job-scheduling.md` - Opret job scheduling system med calendar integration og conflict detection
- `create-customer-balance-tracker.md` - Opret customer balance tracker med Billy.dk integration

#### Documentation (2 additional commands)

- `generate-architecture-docs.md` - Generer architecture documentation fra codebase med diagrams
- `update-api-reference.md` - Opdater API reference documentation fra tRPC routers

#### Code Quality (3 additional commands)

- `enforce-code-standards.md` - Håndhæv code standards og conventions automatisk
- `code-metrics-analysis.md` - Analysér code metrics (complexity, coverage, debt)
- `technical-debt-analysis.md` - Analysér technical debt systematisk med prioritization

#### Chat Context Commands (13 commands - optimeret)

**Alle 13 commands omskrevet til operationsklare, kortfattede prompts:**
- Kortfattet format (maks 8-25 linjer)
- Fokus på praktisk brug i aktiv udvikling
- Ingen lange rapporter, kun facts og actions
- Direkte, actionable output

#### Session Engine Commands (7 commands - opdateret til pair-programming)

**Alle Session Engine commands opdateret til at læse HELE chat sessionen:**
- Læser ALLE beskeder fra bruger OG agent fra start til nu
- Bruger chat historikken til at forstå fuld kontekst
- Fungerer som pair-programmer der arbejder MED dig
- Beslutter næste skridt baseret på chat flow
- Implementerer baseret på chat diskussioner

**Master command:**
- `session-engine.md` - Autonom udviklingsassistent der arbejder med dig i realtime

**5 konsoliderede session commands:**
- `session-init.md` - Forstå projekt + kontekst
- `session-progress.md` - Analysér hvad der er gjort + hvad der mangler
- `session-next-step.md` - Beregn næste skridt
- `session-todos.md` - Generér TODOs + tasks
- `session-implement.md` - Implementér direkte i filer

**Developer Mode:**
- `developer-mode.md` - Cursor-Style Autonomous Mode: Pair-programmer der arbejder løbende

#### Explain Commands (8 new commands)

**Forklar commands til klar, forståelig forklaring:**
- `forklar-kode.md` - Forklar kode: hvad den gør, hvordan den virker, hvorfor
- `forklar-arkitektur.md` - Forklar systemarkitektur, komponenter, og design decisions
- `forklar-beslutning.md` - Forklar beslutning: kontekst, rationale, alternativer, og impact
- `forklar-feature.md` - Forklar feature: funktionalitet, flow, og business value
- `forklar-fejl.md` - Forklar fejl: problem, root cause, og løsning
- `forklar-workflow.md` - Forklar workflow: steps, flow, og rationale
- `forklar-integration.md` - Forklar integration: endpoints, data flow, og business value
- `forklar-database.md` - Forklar database struktur: tabeller, relationer, queries

#### Chat Analysis Commands (2 new commands)

**Commands til at analysere faktiske chat sessioner:**
- `analyser-chat-sessioner.md` - Analysér faktiske chat sessioner fra databasen for at forstå praksis
- `laes-chat-fra-database.md` - Læs faktiske chat samtaler fra databasen via `getConversationMessages`

#### Testing & Improvement Commands (5 new commands)

**Commands til at teste og forbedre commands baseret på faktisk brug:**
- `test-chat-funktion.md` - Test chat funktionalitet end-to-end: send besked, verificer response, test conversation flow
- `test-command.md` - Test en specifik command i praksis: kør den, verificer output, test edge cases
- `test-samtale.md` - Test denne samtale: verificer at commands virker korrekt, test chat flow
- `udvikle-test.md` - Udvikle test kode: skriv test kode, test funktionalitet, valider coverage
- `forbedre-command.md` - Forbedre command baseret på faktisk brug: læs chat historik, identificér problemer, forbedre

**Initial 4 commands:**
- `laes-chat-samtale.md` - Læs chat samtale igennem systematisk og ekstraher informationer
- `analyser-chat-kontekst.md` - Analyser chat kontekst for nuværende arbejde, status, og næste skridt
- `brug-chat-informationer.md` - Brug informationer fra chat samtalen til at udføre opgaver med kontekst
- `ekstraher-chat-data.md` - Ekstraher struktureret data fra chat samtalen (file paths, code snippets, requirements, etc.)

**Additional 9 commands:**
- `sammenfat-chat-samtale.md` - Sammenfat chat samtale til struktureret, omfattende summary
- `opdater-chat-summary.md` - Opdater eksisterende chat summary med nye informationer
- `konverter-chat-til-todos.md` - Konverter action items fra chat til struktureret TODO liste
- `identificer-chat-patterns.md` - Identificer patterns og trends i flere chat samtaler
- `forsta-chat-kontekst.md` - Forstå chat kontekst dybt med implicit kontekst og assumptions
- `ekstraher-chat-requirements.md` - Ekstraher funktionelle og ikke-funktionelle requirements fra chat
- `valider-chat-informationer.md` - Valider informationer fra chat mod codebase for accuracy
- `opret-chat-dokumentation.md` - Opret struktureret dokumentation fra chat samtalen
- `sammenlign-chat-samtaler.md` - Sammenlign flere chat samtaler for at identificere trends og patterns

#### Integration Debugging (3 new commands)

- `debug-calendar-sync.md` - Debug Google Calendar sync issues med systematisk approach
- `debug-google-oauth.md` - Debug Google OAuth issues med systematisk approach
- `optimize-chromadb-queries.md` - Optimér ChromaDB vector queries for performance og accuracy

#### Integration Testing (1 new command)

- `test-google-integration.md` - Test Google integration (Gmail, Calendar, OAuth) omfattende med alle endpoints og business rules

#### Commands Updated to v2.2.0 (3 commands)

- `cleanup-todos.md` - Opdateret med fuld prompt engineering struktur (COMMUNICATION STYLE, REFERENCE MATERIALS, TOOL USAGE, REASONING PROCESS, IMPLEMENTATION STEPS, OUTPUT FORMAT, GUIDELINES, VERIFICATION CHECKLIST)
- `light-review.md` - Opdateret med fuld prompt engineering struktur (IMPLEMENTATION STEPS, OUTPUT FORMAT, VERIFICATION CHECKLIST)
- `continue-conversation.md` - Opdateret med fuld prompt engineering struktur (OUTPUT FORMAT, VERIFICATION CHECKLIST, fjernet duplicate sections)

#### Analysis & Elaboration (1 new command)

- `fortael-naermere.md` - Fortæl nærmere om hvad der er udført med detaljerede forklaringer og eksempler

### Fixed

- Updated all `[DATE]` placeholders in command output templates to `2025-11-16`
- Fixed date formats in 19 commands:
  - `analyze-chat-prompt.md`
  - `analyze-user-intent.md`
  - `start-analysis-from-prompt.md`
  - `optimize-ai-model-selection.md`
  - `analyze-ai-costs.md`
  - `debug-ai-responses.md`
  - `improve-ai-accuracy.md`
  - `test-ai-prompts.md`
  - `test-all-ai-tools.md`
  - `resume-development.md`
  - `get-project-status.md`
  - `track-development-progress.md`
  - `track-system-status.md`
  - `add-documentation.md`
  - `session-summary.md`
  - `plan-next-steps.md`
  - `reflect-on-progress.md`
  - `create-prd.md`
  - `update-feature-status.md`

## [2025-11-16] - Major Update: Prompt Engineering v2.2.0

### Added

#### Session Management Commands (5 new)

- `continue-session.md` - Continue work from previous session
- `session-summary.md` - Create comprehensive session summary
- `reflect-on-progress.md` - Reflect on session progress and identify improvements
- `plan-next-steps.md` - Plan next development steps with priorities
- `maintain-context.md` - Maintain context throughout development session

#### Documentation Commands (4 new)

- `sync-docs-with-code.md` - Sync documentation when code changes
- `find-outdated-docs.md` - Find outdated documentation
- `update-doc-examples.md` - Update code examples in documentation
- `verify-docs-accuracy.md` - Verify documentation accuracy

#### Role-Specific Commands (9 new)

- `benchmark-technology.md` - Benchmark technologies and tools (Engineers)
- `review-system-design.md` - Review system design documents (Engineers)
- `create-migration-plan.md` - Create migration plans (Engineers)
- `visualize-architecture.md` - Create architecture diagrams (Engineers)
- `analyze-logs-data.md` - Analyze logs and data files (Engineers)
- `automate-system-monitoring.md` - Create automated monitoring scripts (IT)
- `create-troubleshooting-guide.md` - Create troubleshooting guides (IT)
- `analyze-competitors.md` - Analyze competitors (Product)
- `create-prd.md` - Create Product Requirements Documents (Product)

#### Test Commands (2 new)

- `test-from-chat-summary.md` - Test precisely from chat conversation summary
- `test-all-ai-tools.md` - Test all AI tools (Gmail, Calendar, Billy, Database)

#### AI-Focused Commands (5 new)

- `test-ai-prompts.md` - Test AI prompts for accuracy and business rules
- `optimize-ai-model-selection.md` - Optimize AI model selection for cost and performance
- `debug-ai-responses.md` - Debug AI responses and fix issues
- `analyze-ai-costs.md` - Analyze AI costs and optimization opportunities
- `improve-ai-accuracy.md` - Improve AI accuracy and response quality

#### Prompt Analysis Commands (3 new)

- `analyze-chat-prompt.md` - Analyze user prompt in chat and start analysis immediately
- `analyze-user-intent.md` - Deeply analyze user intent including implicit requirements
- `start-analysis-from-prompt.md` - Immediately start analysis from user prompt without delay

#### Session Status Commands (3 new)

- `analyze-session-work.md` - Analyze all work done in current chat session
- `get-session-status.md` - Get real-time status of current chat session
- `resume-from-session-point.md` - Resume work from specific point in session

#### Immediate Action Commands (3 new)

- `start-work-immediately.md` - Start work immediately from prompt, no questions asked
- `parse-and-execute.md` - Parse entire prompt and execute all tasks immediately
- `continue-from-prompt.md` - Continue work based on prompt and context

#### Development Assistance Commands (6 new)

- `improve-code-quality.md` - Improve code quality during development
- `guide-feature-development.md` - Guide feature development step-by-step
- `review-code-under-development.md` - Review code while being developed
- `suggest-improvements.md` - Suggest improvements to code during development
- `ensure-best-practices.md` - Ensure best practices are followed during development
- `validate-implementation.md` - Validate implementation during development

#### Ideation Commands (10 new)

- `generate-ideas-from-file.md` - Generate ideas from current file being edited
- `generate-next-steps.md` - Generate next steps from current file/folder
- `generate-ideas-from-diff.md` - Generate ideas from code diff
- `generate-ideas-from-feature.md` - Generate feature-based ideas
- `generate-refactor-ideas.md` - Generate refactor ideas for file
- `generate-test-ideas.md` - Generate test ideas for code
- `generate-api-ideas.md` - Generate API ideas from router/procedure
- `generate-ui-ideas.md` - Generate UI ideas from component
- `generate-architecture-ideas.md` - Generate architecture ideas from directory
- `generate-ai-ideas-for-code.md` - Generate AI augmentation ideas for code

#### Status Tracking Commands (5 new)

- `track-system-status.md` - Track status of all systems
- `track-development-progress.md` - Track development progress on features and tasks
- `get-project-status.md` - Get comprehensive project status overview
- `update-feature-status.md` - Update status of specific features
- `resume-development.md` - Resume development based on current status

### Updated

#### Core Creation Commands (10 updated)

- `create-trpc-procedure.md` - Added all 13 prompt engineering techniques
- `create-database-helper.md` - Added all 13 prompt engineering techniques
- `create-react-component.md` - Added all 13 prompt engineering techniques
- `create-react-page.md` - Added all 13 prompt engineering techniques
- `create-email-workflow.md` - Added all 13 prompt engineering techniques
- `create-crm-feature.md` - Added all 13 prompt engineering techniques
- `create-drizzle-migration.md` - Added all 13 prompt engineering techniques
- `create-shadcn-component.md` - Added all 13 prompt engineering techniques
- `add-ai-tool-handler.md` - Added all 13 prompt engineering techniques
- `setup-new-feature.md` - Added all 13 prompt engineering techniques

#### Debug & Fix Commands (7 updated)

- `debug-issue.md` - Added all 13 prompt engineering techniques
- `chain-of-thought-debugging.md` - Added all 13 prompt engineering techniques
- `root-cause-analysis.md` - Added all 13 prompt engineering techniques
- `fix-bug.md` - Added all 13 prompt engineering techniques
- `help-me-fix-this.md` - Added all 13 prompt engineering techniques
- `fix-typescript-errors.md` - Added all 13 prompt engineering techniques
- `fix-code-quality-issues.md` - Added all 13 prompt engineering techniques

#### Test Commands (4 updated)

- `write-unit-tests.md` - Added all 13 prompt engineering techniques
- `create-playwright-test.md` - Added all 13 prompt engineering techniques
- `test-changed-files.md` - Added all 13 prompt engineering techniques
- `run-tests.md` - Added all 13 prompt engineering techniques

#### Review & Audit Commands (5 updated)

- `ui-ux-review.md` - Added all 13 prompt engineering techniques
- `code-review.md` - Added all 13 prompt engineering techniques
- `security-audit.md` - Added all 13 prompt engineering techniques
- `performance-audit.md` - Added all 13 prompt engineering techniques
- `light-review.md` - Added all 13 prompt engineering techniques

#### Optimization Commands (2 updated)

- `optimize-trpc-query.md` - Added all 13 prompt engineering techniques
- `refactor-code.md` - Added all 13 prompt engineering techniques

#### Workflow Commands (3 updated)

- `implement-scenario-fullstack.md` - Added all 13 prompt engineering techniques
- `wire-ui-to-api.md` - Added all 13 prompt engineering techniques
- `improve-error-handling.md` - Added all 13 prompt engineering techniques

#### Troubleshooting Commands (3 updated)

- `troubleshoot-friday-issue.md` - Added all 13 prompt engineering techniques
- `handle-build-failure.md` - Added all 13 prompt engineering techniques
- `fix-friday-common-problems.md` - Added all 13 prompt engineering techniques

#### Other Commands (6 updated)

- `start-working-on-todos.md` - Added all 13 prompt engineering techniques
- `prioritize-todos.md` - Added all 13 prompt engineering techniques
- `continue-conversation.md` - Added all 13 prompt engineering techniques
- `implement-from-chat-summary.md` - Added all 13 prompt engineering techniques
- `verify-implementation-against-summary.md` - Added all 13 prompt engineering techniques
- `analyze-codebase-health.md` - Added all 13 prompt engineering techniques

#### Documentation Commands (2 updated)

- `add-documentation.md` - Added all 13 prompt engineering techniques
- `documentation-update.md` - Added all 13 prompt engineering techniques

### Changed

#### Structure

- Created `_meta/` directory for metadata files
- Moved `COMMANDS_INDEX.md` to `_meta/`
- Moved `PROMPT_ENGINEERING_GUIDE.md` to `_meta/`
- Moved `COMMANDS_ANALYSIS.md` to `_meta/`
- Created `CHANGELOG.md` in `_meta/` to track changes

#### Metadata Files Added

- `README.md` - Overview of metadata files and structure
- `COMMAND_TEMPLATE.md` - Template for creating new commands
- `QUICK_REFERENCE.md` - Quick reference to most used commands
- `CONTRIBUTING.md` - Guide for creating and updating commands

#### Prompt Engineering

- All updated commands now follow v2.2.0 standard with:
  - ROLE & CONTEXT
  - COMMUNICATION STYLE
  - REFERENCE MATERIALS
  - TOOL USAGE
  - REASONING PROCESS
  - CODEBASE PATTERNS (where relevant)
  - IMPLEMENTATION STEPS
  - VERIFICATION
  - OUTPUT FORMAT
  - GUIDELINES

### Statistics

- **Total Commands:** ~251
- **Updated Commands:** 62+ (25%)
- **New Commands:** 19
- **Commands with v2.2.0 Standard:** 62+

---

## Template for Future Entries

```markdown
## [YYYY-MM-DD] - Description

### Added

- `new-command.md` - Description

### Updated

- `existing-command.md` - What was updated

### Changed

- Structure/Organization changes

### Removed

- `removed-command.md` - Why removed

### Statistics

- Commands added: X
- Commands updated: Y
- Total commands: Z
```
