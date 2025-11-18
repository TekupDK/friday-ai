================================================================================
FRIDAY AI - COMPREHENSIVE REPOSITORY OVERVIEW
================================================================================

PROJECT: Intelligent Email Management & Automation System (v2.0.0)
LANGUAGE: TypeScript (strict mode)
LICENSE: MIT
GIT BRANCH: claude/add-status-image-01HW4D8ioUK8veGgFRVuSRRi

================================================================================
1. PROJECT STRUCTURE & DIRECTORIES
================================================================================

ROOT ORGANIZATION:
├── client/              - Frontend React app (Vite + React 19)
├── server/              - Backend Express server (Node.js)
├── shared/              - Shared TypeScript types and schemas
├── drizzle/             - Database ORM schema definitions
├── tests/               - Test suites (Vitest + Playwright)
├── scripts/             - Build, deployment, and utility scripts
├── docs/                - Comprehensive documentation
├── config/              - Configuration files
├── docker-compose.*     - Docker development environments
└── .cursor, .claude, .copilot - IDE integration files

================================================================================
2. TECHNOLOGY STACK
================================================================================

FRONTEND:
- React 19.1.1 - Latest React with server components support
- TypeScript 5.9.3 - Strict type checking
- Tailwind CSS 4.1.17 - Utility-first styling
- Vite 7.2.2 - Lightning-fast bundler
- Radix UI - Accessible component primitives (15+ components)
- tRPC 11.6.0 - End-to-end type-safe APIs
- React Query 5.90.10 - Server state management
- Framer Motion 12.23.22 - Smooth animations
- Recharts 2.15.2 - Data visualization
- React Hook Form 7.66.1 - Form management
- Streamdown 1.5.1 - Markdown rendering

BACKEND:
- Express 4.21.2 - Node.js web framework
- tRPC 11.6.0 - Type-safe RPC procedures
- Drizzle ORM 0.44.5 - SQL database management
- PostgreSQL (Supabase) - Production database
- Pino 9.4.0 - Structured logging
- Winston - Audit logging
- Helmet 8.1.0 - Security headers
- express-rate-limit 8.2.1 - API rate limiting
- DOMPurify 3.3.0 - XSS protection
- Node-Cron 4.2.1 - Scheduled tasks

INTEGRATIONS:
- Google APIs 165.0.0 - Gmail + Calendar (domain-wide delegation)
- Gemini 2.5 Flash - AI email summaries
- Claude 3.5 Sonnet - AI conversations
- GPT-4o - Multi-model support
- OpenRouter - Cost-effective AI routing
- Billy.dk API - Invoice management
- Sentry v10 - Error tracking (server + client)
- Supabase - PostgreSQL + real-time subscriptions

DEVOPS & MONITORING:
- Dependabot - Automated dependency updates
- npm audit + Snyk - Security scanning
- Codecov - Test coverage reporting
- Sentry - Error tracking and performance monitoring

TESTING:
- Vitest 4.0.10 - Lightning-fast unit testing
- Playwright 1.56.1 - E2E testing (multi-browser)
- @testing-library/react - Component testing
- Jest-axe - Accessibility testing
- Supertest - HTTP assertions

STYLING & BUILD:
- PostCSS - CSS transformations
- Autoprefixer - Browser prefix handling
- esbuild - Ultra-fast JavaScript bundler
- Rollup - Module bundler with visualizer

================================================================================
3. KEY COMPONENTS & FEATURES
================================================================================

A. EMAIL MANAGEMENT (Shortwave-inspired):
   ✅ Unified inbox with Gmail integration
   ✅ Email threading with conversation history
   ✅ AI Email Summaries (150 chars in Danish)
   ✅ Smart auto-labeling with confidence scoring
   ✅ Advanced email search
   ✅ Bulk actions (archive, delete, star)
   ✅ Label mapping (system labels + custom)
   ✅ HTML email rendering with iframe support
   ✅ Keyboard shortcuts (Gmail-style)
   ✅ Rate limiting with adaptive polling

B. CALENDAR & SCHEDULING:
   ✅ Google Calendar integration
   ✅ Day/week/month views (FullCalendar)
   ✅ Drag-and-drop event scheduling
   ✅ Auto-refresh every 60 seconds
   ✅ Event creation and editing

C. CRM & LEAD MANAGEMENT:
   ✅ Lead pipeline with 6 stages
   ✅ Customer profiles with history
   ✅ Opportunity tracking
   ✅ Deal segmentation
   ✅ Activity logging
   ✅ Lead source detection
   ✅ Email enrichment
   ✅ Service templates (51 tRPC endpoints)
   ✅ Autonomous lead intelligence

D. INVOICING & BILLING:
   ✅ Billy.dk integration
   ✅ Invoice caching (database-first)
   ✅ Draft creation (never auto-approve)
   ✅ Subscription management (3 tiers)
   ✅ Usage tracking
   ✅ Payment history

E. TASK MANAGEMENT:
   ✅ Priority-based task system
   ✅ Due date tracking
   ✅ Completion status
   ✅ Autonomous task creation

F. CHAT & AI ASSISTANT:
   ✅ Multi-AI support (Gemini, Claude, GPT-4o)
   ✅ Conversation memory
   ✅ Voice input (Web Speech API)
   ✅ File attachments (PDF, CSV, JSON)
   ✅ Streaming responses
   ✅ Markdown rendering with syntax highlighting

G. BUSINESS AUTOMATION:
   ✅ Intent-based action detection
   ✅ 25 MEMORY business rules
   ✅ Workflow automation
   ✅ Email monitoring
   ✅ Lead source workflows
   ✅ Pipeline tracking

================================================================================
4. BUILD & DEVELOPMENT SETUP
================================================================================

ENVIRONMENT SETUP:
- Node.js 22.x required
- pnpm 9.x+ package manager
- `.env.dev` template provided (copy from `.env.dev.template`)
- `check-env.js` validates required variables at startup

DEVELOPMENT COMMANDS:
pnpm dev              # Start dev server (localhost:3000) + auto-env check
pnpm dev:tunnel      # Start dev + ngrok public tunnel
pnpm dev:vite        # Vite-only frontend dev
pnpm dev:docker      # Full stack Docker development
pnpm check           # TypeScript type checking
pnpm format          # Prettier code formatting

DATABASE COMMANDS:
pnpm db:push         # Push Drizzle schema changes
pnpm db:migrate      # Run migrations
pnpm db:studio       # Open Drizzle Studio

CRM TESTING COMMANDS:
pnpm crm:test:staging        # Run CRM smoke tests
pnpm crm:test:staging:watch  # Watch mode
pnpm crm:seed:staging        # Seed test data
pnpm crm:cleanup:staging     # Dry-run cleanup
pnpm crm:cleanup:staging:apply # Apply cleanup

MONITORING COMMANDS:
pnpm logs            # Monitor all logs
pnpm logs:ai         # AI-related logs only
pnpm logs:email      # Email-related logs only
pnpm monitor:system  # System resource monitoring

BUILD PROCESS:
pnpm build           # Vite client build + esbuild server bundle
Output:              # dist/public/ (frontend) + dist/index.js (backend)

DEPLOYMENT:
pnpm start           # Run production build with .env.prod
Manual:              # Deploy dist/ folder to hosting

HMR OPTIMIZATION:
- Native file system events (no polling)
- WebSocket with latency reduction
- Docker support with VITE_HMR_HOST env var

================================================================================
5. TESTING SETUP
================================================================================

VITEST CONFIGURATION:
- Environment: jsdom (browser simulation)
- Globals: Enabled (no explicit imports needed)
- Setup files: vitest.setup.ts + tests/setup.ts
- Coverage thresholds: 80% lines, functions, statements; 70% branches
- Test discovery: **/*.test.ts, **/*.test.tsx, **/*.spec.tsx
- CSS mock plugin: Prevents CSS import errors

TEST FILES ORGANIZATION:
server/              - Backend unit tests (150+ tests)
  ├── __tests__/
  │   ├── crm-smoke.test.ts        - CRM feature tests
  │   ├── subscription-smoke.test.ts
  │   └── ...
  └── scripts/
      ├── test-*.ts                - Integration test scripts
      └── email-smoke-test.ts

client/              - Frontend component tests
  ├── __tests__/
  └── components/*/
      └── *.test.tsx

tests/               - E2E and specialized tests
  ├── ai/                          - AI conversation tests
  ├── e2e/                         - End-to-end tests
  ├── integration/                 - Integration tests
  ├── unit/                        - Unit tests
  └── a11y/                        - Accessibility tests

PLAYWRIGHT CONFIGURATION:
- Browsers: Chromium (primary), Firefox/WebKit (optional)
- Mobile: Pixel 5, iPhone 12
- Timeout: 60s per test, 30s for AI tests
- Trace: On-first-retry (or always for AI tests)
- Screenshot: Only on failure
- Video: Retain on failure
- HTML Report: tests/results/reports/
- Parallel: 4 workers (1 in CI)

TEST PROJECTS:
- chromium (default)
- Mobile Chrome
- ai-tests (specialized AI testing)
  - Longer timeouts (30s vs 15s)
  - Always traces and screenshots
  - Video recording enabled

TEST COMMANDS:
pnpm test                    # Vitest unit tests
pnpm test:coverage          # With coverage report
pnpm test:playwright        # Run all Playwright tests
pnpm test:playwright:ui     # Interactive Playwright UI
pnpm test:e2e              # E2E suite only
pnpm test:ai:all           # AI-specific tests
pnpm test:screens          # Screenshot tests
pnpm test:email-smoke      # Gmail integration tests
pnpm test:subscription     # Subscription system tests

TEST COVERAGE:
- Email features: 152+ test cases
- CRM module: 51+ tRPC endpoints tested
- Subscription system: Full lifecycle tests
- AI integration: Conversation + streaming tests
- E2E: CRM comprehensive suite

================================================================================
6. DATABASE SCHEMA (21 PostgreSQL Tables)
================================================================================

CORE TABLES:
- users - Authentication (Manus OAuth)
- conversations - Chat threads with context
- messages - Chat messages + AI responses

BUSINESS OPERATIONS:
- email_threads - Gmail caching + threading
- email_attachments - Attachment metadata
- invoices - Billy.dk cache (database-first)
- calendar_events - Google Calendar cache
- leads - CRM with pipeline stages
- tasks - Task management
- customers - Customer profiles + history

CRM EXTENSIONS:
- opportunities - Deal tracking
- segments - Customer segmentation
- service_templates - Service catalog
- activities - CRM activity log
- relationships - Entity relationships
- documents - Document storage

SUBSCRIPTIONS:
- subscriptions - Subscription records
- subscription_usage - Usage tracking
- subscription_plans - Plan definitions

ANALYTICS:
- analytics_events - User behavior tracking
- api_metrics - Performance monitoring
- cache_hits - Cache effectiveness

ENUMS (10 PostgreSQL types):
- calendar_status, customer_invoice_status, email_pipeline_stage
- invoice_status, lead_status, message_role, task_priority, task_status
- theme, user_role, booking_status, service_category, deal_stage
- segment_type, activity_type, subscription_status, subscription_plan_type
- risk_level

FEATURES:
- Row-level security (RLS) for multi-tenant
- Real-time subscriptions via Supabase
- Automatic timestamps + audit trails
- Full-text search indexes

================================================================================
7. API ARCHITECTURE (tRPC Router Structure)
================================================================================

ROOT ROUTERS (22 main categories):
├── system - System operations + health checks
├── customer - Customer management (CRUD + enrichment)
├── auth - Authentication + OAuth
├── workspace - Workspace features
├── inbox - Email, calendar, leads, tasks, invoices
├── docs - Documentation management
├── aiMetrics - AI usage analytics
├── emailIntelligence - Email analysis + suggestions
├── fridayLeads - AI lead integration
├── uiAnalysis - UI/UX analysis
├── admin - Admin user management
├── crm - CRM features:
│   ├── customer - Customer records
│   ├── lead - Lead management
│   ├── booking - Booking operations
│   ├── serviceTemplate - Service catalog
│   ├── stats - CRM statistics
│   ├── activity - Activity tracking
│   └── extensions - Advanced features (phases 2-6)
├── chat - Conversations + messages
├── friday - Legacy AI endpoints
├── automation - Workflow automation
├── chatStreaming - Enhanced chat with streaming
├── reports - Business reports
└── subscription - Subscription management

KEY ROUTERS BY SIZE:
- crm-extensions-router.ts (34KB) - 51 tRPC endpoints
- crm-customer-router.ts (22KB) - Customer operations
- chat-router.ts (10KB) - Chat features
- ai-router.ts (39KB) - AI intent detection (legacy)

ENDPOINT PATTERNS:
- Procedures: query (GET-like), mutation (POST-like)
- Type-safe input/output via Zod schemas
- Context: userId, db connection, Google API client
- Error handling: Standardized error types
- Logging: Structured logging for all operations

================================================================================
8. PROJECT STATISTICS
================================================================================

CODE ORGANIZATION:
- Server files: ~55 major files (41KB combined)
- Router files: 24+ router files (9KB combined)
- Client components: 78+ chat components + 18 component categories
- Test files: 150+ unit + 50+ E2E tests
- Documentation: 54+ MD files

CODEBASE SIZE:
- Backend: ~41,000 lines (server + routers + integrations)
- Frontend: ~15,000+ lines (components + pages + hooks)
- Total: ~56,000+ lines of TypeScript

COMPONENT LIBRARY:
78+ Components organized by category:
- Chat Cards (12)
- Interactive (5)
- ChatGPT-Style (5)
- Email Center (10)
- Intelligence (10)
- Advanced Layouts (9)
- Input/Smart/Realtime (29)

KEY FEATURES:
- 25 MEMORY business rules embedded in system
- 51 tRPC CRM endpoints
- 7 intent-based action types
- 12 CRM module tables
- 3 subscription tiers

================================================================================
9. NOTABLE PATTERNS & ARCHITECTURE
================================================================================

A. MODULAR ARCHITECTURE:
   - Separated routers by domain (crm, chat, email, etc.)
   - Clear responsibility boundaries
   - Easy to extend with new features
   - Lazy-loading of heavy components

B. DATABASE-FIRST STRATEGY:
   - Cache all external API data immediately
   - Reduce API calls (5x performance improvement)
   - Enable offline capabilities
   - Real-time Supabase subscriptions

C. TYPE SAFETY:
   - tRPC for end-to-end type safety
   - Zod schemas for runtime validation
   - TypeScript strict mode enforced
   - Shared types between client/server

D. AI-POWERED FEATURES:
   - Multi-AI support (auto-failover capability)
   - Streaming responses for better UX
   - Memory/context management
   - Cost optimization (free OpenRouter models)

E. ERROR HANDLING:
   - Sentry integration (v10) for production monitoring
   - React Error Boundary with Sentry reporting
   - Express.js error tracking
   - Comprehensive error logging
   - Environment-based configuration

F. RATE LIMITING:
   - express-rate-limit for API protection
   - Adaptive polling with retry logic
   - Redis-backed rate limiting for scale
   - User-friendly rate limit feedback

G. AUTOMATION FRAMEWORK:
   - Intent detection system
   - Business rule engine (MEMORY system)
   - Workflow automation
   - Autonomous action handlers
   - Windows Task Scheduler integration

H. RESPONSIVE DESIGN:
   - Desktop: 60/40 split-panel layout
   - Mobile: Single column with drawer
   - 44px touch targets
   - Tailwind breakpoints (sm, md, lg)

I. TESTING STRATEGY:
   - Unit tests (Vitest + jsdom)
   - E2E tests (Playwright)
   - Component tests (React Testing Library)
   - AI conversation tests
   - Visual regression tests
   - Accessibility tests (jest-axe)

J. PERFORMANCE OPTIMIZATION:
   - Code splitting (manual chunks in Rollup)
   - CSS code splitting
   - HMR optimization (native file events)
   - Bundle analysis (visualizer plugin)
   - Dependency pre-bundling (esbuild)

K. SECURITY:
   - DOMPurify for XSS protection
   - Helmet for HTTP headers
   - CSRF protection
   - Rate limiting
   - XSS sanitization in email rendering

================================================================================
10. DOCUMENTATION & RESOURCES
================================================================================

MAIN DOCS:
- README.md - Complete project overview
- CHANGELOG.md - Version history + features
- QUICK_ENV_REFERENCE.md - Quick environment setup
- ENV_SETUP_GUIDE.md - Full environment guide
- LOGIN_DEBUG.md - Authentication troubleshooting
- AUTONOMOUS-OPERATIONS.md - Lead intelligence guide
- AUTONOMOUS-QUICK-START.md - 5-minute setup

ARCHITECTURE DOCS:
- docs/devops-deploy/ - DevOps and deployment guides
- docs/server/ - Backend documentation
- docs/crm-business/ - CRM business logic
- docs/guides/ - Feature implementation guides
- .kiro/specs/ - CRM API reference + handoff docs

SETUP GUIDES:
- SENTRY_SETUP.md - Error tracking configuration
- DEVOPS_FEATURES_INDEX.md - CI/CD and monitoring
- PERFORMANCE_TEST_GUIDE.md - Performance optimization

DATABASE SCRIPTS:
- server/scripts/crm-seed.ts - Create test data
- server/scripts/test-subscription-email.ts - Email testing
- server/scripts/validate-import.ts - Data quality checks

================================================================================
11. GIT & VERSION CONTROL
================================================================================

Current Status:
- Branch: claude/add-status-image-01HW4D8ioUK8veGgFRVuSRRi
- Status: Clean (no uncommitted changes)
- Recent commits:
  bc130bd - chore: add test-results/ to .gitignore
  637a057 - fix: add models/ to .gitignore and prepare for large file cleanup
  1e530dc - feat(crm): Docker live editing, WebSocket fixes, test improvements
  1d2e49e - feat: Achieve perfect 10/10 Cursor IDE configuration
  661a4dd - test: Complete Phase 1 Foundation - Subscription frontend tests

Commit Conventions:
- feat: - New features
- fix: - Bug fixes
- chore: - Maintenance tasks
- test: - Test additions/improvements
- docs: - Documentation updates
- refactor: - Code restructuring

================================================================================
12. DEPLOYMENT & OPERATIONS
================================================================================

DEPLOYMENT TARGETS:
- Manus Platform (recommended)
  - Save checkpoint in Manus UI
  - Click "Publish" button
  - Auto-deployed with global CDN

- Manual deployment
  - Build: pnpm build
  - Deploy: dist/ folder to hosting
  - Server: pnpm start with .env.prod

PRODUCTION ENVIRONMENT:
- Database: Supabase PostgreSQL (schema: friday_ai)
- Error tracking: Sentry v10
- Logging: Pino structured + Winston audit
- Monitoring: API metrics + cache hits
- Security: Helmet, DOMPurify, rate limiting

ENVIRONMENT VARIABLES:
Required:
- DATABASE_URL (Supabase PostgreSQL)
- JWT_SECRET (min 32 chars)
- OWNER_OPEN_ID (Manus OAuth)
- VITE_APP_ID (app identifier)

Optional but recommended:
- OPENAI_API_KEY
- GEMINI_API_KEY
- GOOGLE_SERVICE_ACCOUNT_KEY
- GOOGLE_IMPERSONATED_USER
- BILLY_API_KEY
- BILLY_ORGANIZATION_ID
- SENTRY_DSN (error tracking)

================================================================================
