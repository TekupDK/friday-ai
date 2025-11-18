================================================================================
FRIDAY AI - DETAILED DIRECTORY TREE
================================================================================

friday-ai/
│
├─ CLIENT (React Frontend - Vite)
│  └─ client/src/
│     ├─ components/                    [78+ Production Components]
│     │  ├─ chat/                       [Chat UI components]
│     │  ├─ inbox/                      [Email tab, threading, pipeline]
│     │  ├─ crm/                        [Lead, customer, opportunity mgmt]
│     │  ├─ workspace/                  [Dashboard, analytics panels]
│     │  ├─ panels/                     [AI assistant, floating windows]
│     │  ├─ email-intelligence/         [AI summaries, label suggestions]
│     │  ├─ interactive/                [ApprovalCard, ThinkingIndicator]
│     │  ├─ subscription/               [Plan selection, billing]
│     │  ├─ ui/                         [Radix UI + custom components]
│     │  ├─ showcase/                   [78+ component showcase demo]
│     │  ├─ admin/                      [Admin dashboard]
│     │  ├─ docs/                       [Documentation UI]
│     │  ├─ workflow/                   [Automation workflows]
│     │  ├─ ai/                         [AI-specific components]
│     │  ├─ leads/                      [Lead management UI]
│     │  └─ __tests__/                  [Component tests]
│     │
│     ├─ pages/                         [Route pages]
│     │  ├─ EmailTab.tsx
│     │  ├─ CalendarTab.tsx
│     │  ├─ LeadsTab.tsx
│     │  ├─ TasksTab.tsx
│     │  ├─ InvoicesTab.tsx
│     │  ├─ ChatPage.tsx
│     │  ├─ CRMDashboard.tsx
│     │  ├─ AdminPanel.tsx
│     │  ├─ SettingsPage.tsx
│     │  └─ NotFoundPage.tsx
│     │
│     ├─ hooks/                        [React Custom Hooks]
│     │  ├─ useFridayChat*
│     │  ├─ useEmailTab*
│     │  ├─ useCRM*
│     │  ├─ useCalendar*
│     │  ├─ useSubscription*
│     │  └─ ...
│     │
│     ├─ lib/                          [Library code]
│     │  ├─ trpc.ts                    [tRPC client setup]
│     │  ├─ auth.ts                    [Auth helpers]
│     │  ├─ api.ts                     [API utilities]
│     │  └─ ...
│     │
│     ├─ context/                      [React Context providers]
│     │  ├─ AuthContext.tsx
│     │  ├─ ChatContext.tsx
│     │  └─ ...
│     │
│     ├─ services/                     [Business logic]
│     │  ├─ email.ts
│     │  ├─ chat.ts
│     │  ├─ crm.ts
│     │  └─ ...
│     │
│     ├─ styles/                       [CSS stylesheets]
│     │  ├─ globals.css
│     │  ├─ theme.css
│     │  └─ ...
│     │
│     ├─ utils/                        [Utility functions]
│     │  ├─ date.ts
│     │  ├─ format.ts
│     │  ├─ validation.ts
│     │  └─ ...
│     │
│     ├─ constants/                    [App constants]
│     │  ├─ roles.ts
│     │  ├─ statuses.ts
│     │  └─ ...
│     │
│     ├─ __tests__/                    [Frontend tests]
│     │
│     ├─ App.tsx                       [Root component]
│     ├─ main.tsx                      [Entry point]
│     ├─ index.css                     [Global styles]
│     └─ const.ts                      [App constants]
│
│
├─ SERVER (Express Backend - Node.js)
│  └─ server/
│     ├─ _core/                        [Server bootstrap]
│     │  ├─ index.ts                   [Main server entry]
│     │  ├─ env.ts                     [Environment config]
│     │  ├─ logger.ts                  [Pino logging setup]
│     │  ├─ context.ts                 [tRPC context]
│     │  ├─ trpc.ts                    [tRPC server setup]
│     │  ├─ oauth.ts                   [OAuth routes]
│     │  ├─ vite.ts                    [Vite dev server]
│     │  ├─ systemRouter.ts            [System endpoints]
│     │  └─ ...
│     │
│     ├─ routers/                      [tRPC endpoint routers - 24 files]
│     │  ├─ crm-extensions-router.ts   [51 CRM endpoints]
│     │  ├─ crm-customer-router.ts     [Customer operations]
│     │  ├─ crm-lead-router.ts         [Lead management]
│     │  ├─ crm-booking-router.ts      [Booking operations]
│     │  ├─ crm-service-template-router.ts
│     │  ├─ crm-stats-router.ts
│     │  ├─ crm-activity-router.ts
│     │  ├─ chat-router.ts             [Chat endpoints]
│     │  ├─ chat-streaming.ts          [Streaming chat]
│     │  ├─ email-intelligence-router.ts
│     │  ├─ friday-leads-router.ts     [AI lead integration]
│     │  ├─ auth-router.ts             [Authentication]
│     │  ├─ subscription-router.ts     [Billing]
│     │  ├─ automation-router.ts       [Workflows]
│     │  ├─ admin-user-router.ts       [Admin features]
│     │  ├─ inbox-router.ts            [Email, calendar, tasks]
│     │  ├─ docs-router.ts             [Documentation API]
│     │  ├─ ai-metrics-router.ts       [AI analytics]
│     │  ├─ ui-analysis-router.ts      [UI testing]
│     │  ├─ reports-router.ts          [Business reports]
│     │  ├─ workspace-router.ts        [Workspace mgmt]
│     │  ├─ friday-router.ts           [Legacy endpoints]
│     │  └─ inbox/                     [Inbox sub-routers]
│     │
│     ├─ integrations/                 [External service integrations]
│     │  ├─ chromadb/                  [Vector search]
│     │  ├─ openai/                    [OpenAI integration]
│     │  ├─ anthropic/                 [Claude integration]
│     │  └─ ...
│     │
│     ├─ modules/                      [Feature modules]
│     │  ├─ crm/
│     │  ├─ email/
│     │  ├─ chat/
│     │  └─ ...
│     │
│     ├─ api/                          [API utilities]
│     │  ├─ validators/
│     │  ├─ middleware/
│     │  └─ ...
│     │
│     ├─ scripts/                      [Database & utility scripts]
│     │  ├─ crm-seed.ts                [Create test data]
│     │  ├─ crm-cleanup.ts             [Remove test data]
│     │  ├─ email-smoke-test.ts        [Email integration test]
│     │  ├─ test-subscription-*.ts     [Subscription tests]
│     │  ├─ validate-import.ts         [Data quality checks]
│     │  ├─ migrate-*.ts               [Database migrations]
│     │  └─ ...
│     │
│     ├─ __tests__/                    [Backend unit tests]
│     │  ├─ crm-smoke.test.ts          [CRM features]
│     │  ├─ subscription-smoke.test.ts [Billing]
│     │  └─ ...
│     │
│     ├─ email-intelligence/           [Email AI features]
│     │  ├─ ai-email-summary.ts        [AI summaries]
│     │  ├─ ai-label-suggestions.ts    [Auto-labeling]
│     │  ├─ email-enrichment.ts
│     │  └─ ...
│     │
│     ├─ routes/                       [Express routes]
│     │
│     ├─ lib/                          [Libraries]
│     │  ├─ db.ts                      [Database client]
│     │  ├─ google-api.ts              [Google services]
│     │  ├─ billy.ts                   [Billy integration]
│     │  ├─ mcp.ts                     [MCP framework]
│     │  └─ ...
│     │
│     ├─ utils/                        [Utilities]
│     │  ├─ logger.ts
│     │  ├─ validators.ts
│     │  └─ ...
│     │
│     ├─ types/                        [TypeScript types]
│     │
│     ├─ analysis/                     [Analysis tools]
│     │
│     ├─ docs/                         [Documentation service]
│     │
│     ├─ utcp/                         [UTCP integration]
│     │
│     ├─ ai-router.ts                  [AI routing logic - 39KB]
│     ├─ friday-tool-handlers.ts       [Tool execution]
│     ├─ friday-tools.ts               [Tool definitions]
│     ├─ friday-prompts.ts             [AI system prompts]
│     ├─ intent-actions.ts             [Action detection]
│     ├─ customer-router.ts            [Customer management]
│     ├─ db.ts                         [Core DB operations]
│     ├─ customer-db.ts                [Customer queries]
│     ├─ lead-db.ts                    [Lead queries]
│     ├─ workflow-automation.ts        [Automation engine]
│     ├─ subscription-*.ts             [Subscription features - 7 files]
│     ├─ lead-source-*.ts              [Lead source tracking]
│     ├─ email-*.ts                    [Email features]
│     ├─ billy-*.ts                    [Invoice features]
│     ├─ metrics*.ts                   [Analytics]
│     ├─ rate-limit*.ts                [Rate limiting]
│     ├─ notification-service.ts       [Notifications]
│     ├─ idempotency.ts                [Idempotent operations]
│     ├─ llm-*.ts                      [LLM utilities]
│     ├─ notification-service.ts       [User notifications]
│     ├─ import-historical-data.ts     [Data import]
│     ├─ routers.ts                    [Main router export]
│     └─ ...
│
│
├─ DATABASE (Drizzle ORM + PostgreSQL)
│  └─ drizzle/
│     ├─ schema.ts                     [Database schema - 21 tables]
│     ├─ 0001_*.sql                    [Migration files]
│     ├─ 0002_*.sql
│     ├─ 0003_*.sql
│     └─ ...
│
│
├─ SHARED CODE
│  └─ shared/
│     ├─ types.ts                      [Shared TypeScript types]
│     ├─ schemas/
│     │  ├─ lead.ts
│     │  └─ ...
│     ├─ const.ts                      [Shared constants]
│     └─ _core/
│        └─ errors.ts                  [Error types]
│
│
├─ TESTS (Vitest + Playwright)
│  └─ tests/
│     ├─ ai/                           [AI conversation tests]
│     │  ├─ friday-ai-agent.test.ts
│     │  ├─ visual-regression.test.ts
│     │  ├─ performance.test.ts
│     │  └─ accessibility.test.ts
│     │
│     ├─ e2e/                          [End-to-end tests]
│     │  ├─ crm-comprehensive.spec.ts  [CRM E2E suite]
│     │  ├─ email-integration.spec.ts
│     │  └─ ...
│     │
│     ├─ integration/                  [Integration tests]
│     ├─ unit/                         [Unit tests]
│     ├─ a11y/                         [Accessibility tests]
│     ├─ manual/                       [Manual test guides]
│     ├─ ui-analysis/                  [UI testing]
│     │
│     ├─ helpers/                      [Test utilities]
│     │  ├─ auth.ts
│     │  ├─ db.ts
│     │  └─ ...
│     │
│     ├─ global-setup.ts               [Playwright setup]
│     ├─ setup.ts                      [Vitest setup]
│     └─ results/                      [Test reports]
│
│
├─ SCRIPTS (Build, deploy, utilities)
│  └─ scripts/
│     ├─ dev/
│     │  ├─ dev-with-tunnel.mjs        [Auto-tunnel setup]
│     │  ├─ tunnel-ngrok.mjs           [ngrok integration]
│     │  └─ ...
│     │
│     ├─ deploy/
│     │  ├─ deploy-prod.sh
│     │  └─ ...
│     │
│     ├─ migrations/
│     │  ├─ run-pipeline-migration.mjs
│     │  └─ ...
│     │
│     ├─ docs/
│     │  ├─ generate-ai-components-docs.ts
│     │  ├─ auto-categorize-docs.ts
│     │  ├─ fix-docs-links.ts
│     │  └─ ...
│     │
│     ├─ python/
│     │  └─ generate_logo.py            [Logo generation]
│     │
│     ├─ utils/
│     │  ├─ monitor-logs.ps1
│     │  ├─ monitor-system-resources.ps1
│     │  ├─ optimize-performance.ps1
│     │  └─ ...
│     │
│     ├─ database/
│     │  └─ ...
│     │
│     ├─ maintenance/
│     │  ├─ backup-db.ps1
│     │  └─ ...
│     │
│     ├─ testing/
│     │  └─ run-ai-tests.ts
│     │
│     ├─ analysis/
│     │  └─ ...
│     │
│     └─ migration-check.mjs
│
│
├─ DOCUMENTATION
│  └─ docs/
│     ├─ AUTONOMOUS-OPERATIONS.md      [Lead automation guide]
│     ├─ AUTONOMOUS-QUICK-START.md     [5-min setup]
│     ├─ AUTONOMOUS-COMPLETION-SUMMARY.md
│     ├─ TESTING_REPORT.md
│     ├─ IMPROVEMENTS_PLAN.md
│     ├─ LOGIN_DEBUG_GUIDE.md
│     ├─ PERFORMANCE_TEST_GUIDE.md
│     │
│     ├─ devops-deploy/                [DevOps guides]
│     │  ├─ SENTRY_SETUP.md
│     │  ├─ DEVOPS_FEATURES_INDEX.md
│     │  └─ ...
│     │
│     ├─ server/                       [Backend docs]
│     │  └─ ...
│     │
│     ├─ crm-business/                 [CRM business logic]
│     │  └─ ...
│     │
│     ├─ guides/                       [Feature guides]
│     │  └─ ...
│     │
│     ├─ qa/                           [QA docs]
│     │  └─ ...
│     │
│     └─ documentation/                [General docs]
│
│
├─ CONFIG FILES
│  ├─ vite.config.ts                   [Vite bundler config]
│  ├─ vitest.config.ts                 [Vitest config + CSS mocks]
│  ├─ playwright.config.ts             [Playwright E2E config]
│  ├─ tsconfig.json                    [TypeScript config]
│  ├─ tailwind.config.js               [Tailwind CSS config]
│  ├─ postcss.config.cjs               [PostCSS config]
│  ├─ .eslintrc.cjs                    [ESLint config]
│  ├─ .prettierrc                      [Prettier config]
│  ├─ .markdownlint.json               [Markdown linting]
│  ├─ docker-compose.yml               [Prod Docker]
│  ├─ docker-compose.dev.yml           [Dev Docker]
│  ├─ docker-compose.db-only.yml       [DB-only Docker]
│  ├─ docker-compose.supabase.yml      [Supabase Docker]
│  ├─ Dockerfile                       [Prod image]
│  ├─ Dockerfile.dev                   [Dev image]
│  ├─ package.json                     [Dependencies + scripts]
│  ├─ pnpm-lock.yaml                   [Dependency lock]
│  ├─ check-env.js                     [Env validation]
│  ├─ .env.dev.template                [Dev env template]
│  ├─ .env.prod.template               [Prod env template]
│  ├─ .env.staging.template            [Staging env]
│  ├─ .env.staging                     [Actual staging env]
│  ├─ .gitignore                       [Git ignore rules]
│  ├─ .cursorignore                    [Cursor IDE ignore]
│  └─ components.json                  [Component config]
│
│
├─ IDE & INTEGRATION CONFIGS
│  ├─ .cursor/                         [Cursor IDE]
│  │  ├─ commands/
│  │  ├─ hooks/
│  │  └─ terminal/
│  │
│  ├─ .claude/                         [Claude Code integration]
│  │
│  ├─ .copilot/                        [GitHub Copilot]
│  │
│  ├─ .vscode/                         [VS Code]
│  │  ├─ settings.json
│  │  └─ extensions.json
│  │
│  ├─ .storybook/                      [Storybook config]
│  │  └─ main.ts
│  │
│  ├─ .github/                         [GitHub config]
│  │  ├─ workflows/
│  │  └─ ...
│  │
│  └─ .cursorrules                     [Cursor rules]
│
│
├─ DATA
│  └─ data/
│     ├─ complete-leads-v*.json        [Mock lead data]
│     └─ ...
│
│
├─ OTHER DIRECTORIES
│  ├─ .test-results/                   [Playwright test results]
│  ├─ .kiro/                           [Kiro specs + handoff docs]
│  ├─ .trae/                           [Trae integration]
│  ├─ .dropstone/                      [Dropstone files]
│  ├─ cli/                             [CLI tools]
│  ├─ config/typescript/               [TS config variations]
│  ├─ database/                        [Database scripts]
│  ├─ doc-auto/                        [Auto-doc generation]
│  ├─ inbound-email/                   [Email webhook handlers]
│  ├─ patches/                         [pnpm patches]
│  └─ .auto-run-config.json            [Auto-run config]
│
│
└─ ROOT FILES
   ├─ README.md                         [Main project README]
   ├─ CHANGELOG.md                      [Version history]
   ├─ QUICK_ENV_REFERENCE.md            [Quick setup guide]
   ├─ ENV_SETUP_GUIDE.md                [Full env guide]
   ├─ LICENSE                           [MIT License]
   ├─ package.json                      [Dependencies + scripts]
   ├─ pnpm-lock.yaml                    [Dependency lock]
   ├─ tsconfig.json                     [TypeScript config]
   └─ [100+ other config files]

================================================================================
TOTAL CODEBASE:
- TypeScript: ~56,000 lines
- Test files: 200+ test files
- Components: 78+ production components
- Routers: 24+ tRPC routers
- Documentation: 54+ markdown files
- Database: 21 tables + 10 enums
================================================================================
