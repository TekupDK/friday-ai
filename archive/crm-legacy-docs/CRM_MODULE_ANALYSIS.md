# CRM Module – Teknisk Analyse og Arkitektur

Version: 1.0.0
Dato: 2025-11-11
Status: Draft (klar til implementation)

---

## Formål

Dette dokument beskriver den tekniske arkitektur, datamodel, API-design, UI-komponenter, integrationer, sikkerhed og testplan for Friday AI CRM modul til Rendetalje.

CRM’et er manual-first i fase 1 og udbygges gradvist med AI-assistance i fase 2–3.

---

## Arkitektur Overblik

- Klient: `client/` (React + Vite, TypeScript)
- Server: `server/` (TypeScript, tRPC/Express routers, modulær services)
- Database: `drizzle/` + `database/` (Drizzle ORM, migreringer og skemaer)
- Integrations: Billy (`server/billy.ts`), Google Calendar (`server/google-api.ts`), Email pipeline (`inbound-email/`, `server/email-cache.ts`)
- Shared types: `shared/types.ts`, `server/_core/types/`
- Observability: `server/logger.ts`, `server/metrics.ts`, `server/ai-metrics.ts`
- Idempotency: `server/idempotency.ts`

Fase 1 leverer ren CRUD og workflows. Fase 2 introducerer AI-assistance via `server/_core/llm.ts` og tilhørende pipelines.

---

## Domænemodel

### Entiteter

- Customer
  - Stamdata: navn, email, telefon
  - Property (ejendom): adresse, type, størrelse (m²), etager, adgangskode, parkering
  - Preferences: dage/tidspunkter, allergier, betalingsmetode (MobilePay/Faktura), special requests
  - History: totalBookings, LTV, lastBooking, serviceTypes
- Lead
  - Kilde (web, email, telefon), metadata, status, score
- ServiceTemplate
  - Navn, skønnet timer, pris/time, checklist, tasks
- Booking
  - Customer, ServiceTemplate, pris, dato/tid, status
- Task (job-opgave)
  - Booking, assignee (field worker), start/slut, materialer, noter, fotos

### Relationer

- Customer 1–N Booking
- Booking 1–N Task
- ServiceTemplate 1–N Booking
- Lead → Customer (konvertering)

---

## Database Design (Drizzle)

Tabel-udkast (niveau: konceptuelt; implementeres i `drizzle/schema.ts`)

### Eksisterende tabeller og felter (Drizzle)

Denne sektion refererer direkte til felter og enums fra `drizzle/schema.ts` for at forankre CRM’et i den aktuelle database.

- `customer_profiles` (alias: `customerProfiles`)
  - Felter: `id`, `userId`, `leadId`, `billyCustomerId`, `billyOrganizationId`, `email`, `name`, `phone`, `status`, `tags[]`, `customerType` ("private" default), `totalInvoiced`, `totalPaid`, `balance`, `invoiceCount`, `emailCount`, `aiResume`, `lastContactDate`, `lastSyncDate`, `createdAt`, `updatedAt`
  - Enum: `customer_status` værdier `new | active | inactive | vip | at_risk`
  - Indeks: `idx_customer_profiles_email`, `idx_customer_profiles_lead_id`, `idx_customer_profiles_user_id`
  - Brug: Stamdata for CRM‑kundeprofil inkl. opsummeringer og AI‑resume.

- `customer_notes` (alias: `customerNotesInFridayAi`)
  - Felter: `id`, `customerId`, `userId`, `note`, `createdAt`, `updatedAt`
  - Indeks: `idx_customer_notes_customer`, `idx_customer_notes_user`
  - Brug: Noter og dokumentation på kundeprofilen.

- `customers` (alias: `customersInFridayAi`)
  - Felter: supplerende kundetabel (bruges i eksisterende system). CRM’et konsoliderer visning via `customer_profiles`.

- `leads` (alias: `leadsInFridayAi`)
  - Felter: `id`, `userId`, `email`, `name`, `source`, `status`, `score`, `metadata`, `createdAt`, `updatedAt`
  - Enum: `lead_status`
  - Brug: Lead intake og konvertering til customer.

- `emails`, `email_threads`, `email_attachments`
  - Felter: email‑tråde, indhold, afsender/modtager, attachments.
  - Brug: Inbox → åbner Customer Profile; pipeline stages.

- `email_pipeline_state`, `email_pipeline_transitions`
  - Felter: `threadId`, `stage`, transitionshistorik (fra/til, begrundelse).
  - Enum: `email_pipeline_stage`
  - Brug: CRM pipeline (Lead → Contacted → Qualified → Converted …).

- `calendar_events`
  - Felter: `id`, `userId`, `calendarId`, `title`, `description`, `location`, `start`, `end`, `status`, `createdAt`.
  - Enum: `calendar_status`
  - Brug: Booking/kalendersynk; visning på Customer Profile.

- `tasks`
  - Felter: `id`, `userId`, `title`, `description`, `priority`, `status`, `dueDate`, `createdAt`, `updatedAt`
  - Enums: `task_priority`, `task_status`
  - Brug: Job‑opgaver per booking/ejendom.

- `invoices`, `customer_invoices`
  - Felter: fakturahoved og kunde‑specifikke fakturaer; status via enum `invoice_status` / `customer_invoice_status`.
  - Brug: Billy‑integration og regnskab.

Referencer og aliaser fra `schema.ts` sikrer bagudkompatibilitet: f.eks. `export const customerProfiles = customerProfilesInFridayAi;`.

---

## API & Services (kode‑referencer)

Denne sektion peger på helper‑funktioner i `server/customer-db.ts` (navne kan variere afhængig af placering), som CRM‑flowsen skal bruge:

- Kundeprofil
  - `getCustomerProfileByEmail(email)`
  - `getCustomerProfileByLeadId(leadId)`
  - `getCustomerProfileById(id)`
  - `createOrUpdateCustomerProfile(payload)`
  - `updateCustomerBalance(customerId, delta)`
  - `updateCustomerEmailCount(customerId, delta)`
  - Noter: `getCustomerNotes(customerId)`, `addCustomerNote`, `updateCustomerNote`, `deleteCustomerNote`

- Fakturaer & Emails
  - `getCustomerInvoices(customerId)`, `addCustomerInvoice(customerId, data)`
  - `getCustomerEmails(customerId)`, `addCustomerEmail(customerId, data)`

- Samtaler
  - `getCustomerConversation(customerId)`
  - `createCustomerConversation(customerId)`

- Kalender
  - `getCustomerCalendarEvents({ name, email })` – matcher kalender events via title/description

Disse funktioner interagerer med Drizzle‑tabeller og Google Calendar API (hvor relevant) og er direkte anvendelige i routers.

---

## Planlagte Routers (tRPC/Express)

- `crm.customer`
  - `getById`, `getByEmail`, `list`, `createOrUpdate`
  - `notes.list/add/update/delete`
  - `summary` (balance, invoiceCount, emailCount)

- `crm.lead`
  - `list`, `getById`, `assign`, `convertToCustomer`

- `crm.booking`
  - `create`, `update`, `cancel`, `listByCustomer`, `calendarSync`

- `crm.task`
  - `listByBooking`, `create`, `updateStatus`, `addMaterial`, `uploadPhoto`

- `crm.invoice`
  - `listByCustomer`, `createFromJob`, `syncBilly`

---

## UI Komponenter (klient)

- Customer Profile Sidepanel (ca. 840px)
  - Faner: `Overview`, `Properties`, `Bookings`, `Tasks`, `Invoices`, `Emails`, `Notes`
  - Lazy‑load per fane; prefetch ved profilåbning

- Lead Dashboard
  - Pipeline kolonner → drag‑and‑drop mellem `email_pipeline_stage`

- Booking Planner
  - Kalenderintegration; skabelonvalg; prisberegning

- Task Board
  - Job‑opgaveflows; materialer; fotos; completion rapport

Referencer: `docs/CUSTOMER_PROFILE_CRM_FEATURES.md`, `docs/EMAIL_CENTER_PHASE1_COMPLETE.md`.

---

## Sikkerhed & Adgange

- RBAC via `user_role` enum og centrale guards
- Audit logs (`audit_logs`) for vigtige ændringer
- Idempotency for eksterne kald (Billy/Calendar)
- PII‑beskyttelse: `email`, `phone` og noter behandles med restriktioner

---

## Testplan

- Unit tests: helpers i `customer-db.ts` mod Drizzle skema
- Integration tests: routers for `customer`, `lead`, `booking`
- E2E: Åbning af Customer Profile fra inbox; oprettelse af booking; fakturaflow
- Data verifikation: krydstjek mod `docs/DATA_INTEGRATION_VERIFICATION.md`

Acceptkriterier (uddrag)

- Opret/Opdater kundeprofil persistenter felter inkl. `status`, `tags[]`, `balance`
- Noter kan oprettes, redigeres og slettes; audit timestamp opdateres
- Kalender events vises korrekt på `Bookings` fane ved match på `name`/`email`
- Lead kan konverteres til kunde; referencer opdateres (`leadId` på profil)

---

## Faseprogression

- Fase 1: Manual‑first CRUD + workflows (ingen skjult automation)
- Fase 2: AI‑assistance toggles på `lead scoring`, `template recommend`, `reminders`
- Fase 3: Semi‑autonome flows med bruger‑godkendelse (se `AUTONOMOUS-QUICK-START.md`)

---

## Relaterede dokumenter

- `CRM_MODULE_MASTER_INDEX.md`
- `CRM_REDESIGN_MANUAL_FIRST.md`
- `CRM_BRAINSTORM_RENDETALJE.md`
- `docs/CUSTOMER_PROFILE_CRM_FEATURES.md`
- `docs/DATA_INTEGRATION_VERIFICATION.md`
- `AUTONOMOUS-OPERATIONS.md`, `AUTONOMOUS-QUICK-START.md`, `AUTONOMOUS-COMPLETION-SUMMARY.md`

- `customers`
- `properties` (kan være embedded i customers eller separat afh. på normalisering)
- `leads`
- `service_templates`
- `bookings`
- `tasks`
- `notes` (valgfri)
- `attachments` (valgfri, til fotos/dokumenter)

Guidelines

- Brug UUID’er, `created_at`/`updated_at` timestamps, soft-delete hvor relevant
- Indekser på `customer_id`, `booking_id`, `status`, `date`
- Idempotent inserts for eksterne syncs (se `server/idempotency.ts`)

---

## API Design

Transport: tRPC routers (foretrukket) eller REST routes i `server/routers/` og `server/routes/`

Kerne-endpoints

- Customers
  - List: `crm.customers.list()`
  - Get: `crm.customers.get(id)`
  - Create/Update/Delete: `crm.customers.upsert(data)`, `crm.customers.delete(id)`
- Leads
  - List/Get/Upsert/Delete
  - Assign: `crm.leads.assign(leadId, userId)`
  - Convert: `crm.leads.convert(leadId)` → creates Customer & optional Booking
- Service Templates
  - List/Get/Upsert
- Bookings
  - Create: `crm.bookings.create(customerId, templateId, date, price)`
  - Update status: `crm.bookings.updateStatus(id, status)`
  - List by customer: `crm.bookings.byCustomer(customerId)`
- Tasks
  - Create for booking: `crm.tasks.create(bookingId, payload)`
  - Complete: `crm.tasks.complete(taskId, report)`

Kontrakter (types) placeres i `shared/types.ts` og/eller `server/docs/types.ts`.

---

## UI Komponenter

Frontend placering: `client/src/pages` og `client/src/components`

Kerne-views

- Customer Profile (sidepanel, 840px) – se `docs/CUSTOMER_PROFILE_CRM_FEATURES.md`
- Leads Dashboard – import, review, assign, convert
- Service Template Library – standardiserede tilbud
- Booking Planner – kalender, pris, status
- Task Board – job-udførelse, materialer, fotos

UX-principper

- Manual-first: tydelige handlinger, AI-suggestions som option
- Lazy-load per fane, subtil sync-indikatorer, prefetch ved klik

---

## Integrationer

- Billy (fakturaer): `server/billy.ts` – opret faktura efter job-completion
- Google Calendar: `server/google-api.ts` – booking → kalender entry
- Email Pipeline: inbound → lead intake → manual review
- ChromaDB (leads intelligence): se `docs/integrations/ChromaDB/...`

Idempotens og retries anvendes ved eksterne kald.

---

## Sikkerhed & RBAC

- RBAC: roller (admin, manager, worker) via `server/rbac.ts`
- Adgang til kundedata kun for autoriserede roller
- Audit logs for kritiske ændringer
- Rate limiting og input-validering på write-endpoints
- PII-håndtering og data-minimering

---

## Testplan

- Unit: `tests/unit/` – services, utils, data-mapper
- API: `tests/e2e/` – endpoints, auth, idempotency
- UI: `client/src/__tests__/` – views og interaktioner
- Workflows: `tests/ui-analysis/` – scenarier for lead→customer→booking→task

Coverage-mål: 80%+ på kritiske moduler.

---

## Implementationsplan (Fase 1)

1. Datamodel & migreringer (Drizzle)
2. API routers (customers, leads, templates, bookings, tasks)
3. UI views (Customer Profile, Leads, Booking, Task)
4. Integration hooks (Billy, Calendar)
5. RBAC & logging
6. Tests & dokumentation

Exit-kriterier

- CRUD fungerer for alle kernedata
- Manual workflows gennemførbare end-to-end
- Grundlæggende integrationer virker (faktura, kalender)

---

## Risici & Mitigation

- Datakvalitet: stram validering, værktøjer til rettelser
- Adoption: start med manual-first, samle feedback, korte iterationer
- Integrationer: feature flags og rollbacks

---

## Referencer

- `CRM_MODULE_MASTER_INDEX.md`
- `docs/CUSTOMER_PROFILE_CRM_FEATURES.md`
- `docs/AUTONOMOUS-OPERATIONS.md`
- `AUTONOMOUS-QUICK-START.md`
- `AUTONOMOUS-COMPLETION-SUMMARY.md`
