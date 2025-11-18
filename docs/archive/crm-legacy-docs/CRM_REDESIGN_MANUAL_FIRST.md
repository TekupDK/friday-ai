# CRM Redesign – Manual‑First Roadmap

Version: 1.0.0
Dato: 2025-11-11
Status: Draft (klar til implementering i Fase 1)

---

## Principper

- Manual kontrol som default (ingen skjult automation)
- AI-assistance kan tilvælges pr. feature (feature flags)
- Tydelige, enkle handlinger og konsekvent UX
- Nem rollback: alle AI-funktioner kan slås fra
- Fokus på Rendetalje’s praksis: ejendom, skabeloner, booking, job‑udførelse

---

## Omfang (Fase 1)

- Customers: CRUD, property‑felter, præferencer
- Leads: import, manual review, assign, convert → customer
- Service Templates: biblioteksvisning, opret/rediger, anvend ved booking
- Bookings: opret, ændr, status, kalender‑synk
- Tasks: opret pr. booking, materiale‑checklist, afslut med rapport
- Notes & Attachments: valgfri for dokumentation/fotos

Ikke i Fase 1

- Auto‑routing, predictive scheduling, fuld AI lead scoring (kommer i Fase 2)

---

## Roadmap

### Sprint 1–2: Fundament

- Datamodel og migreringer (Drizzle)
- Customers & Leads routers (CRUD, assign, convert)
- Customer Profile sidepanel (840px) med lazy‑load faner

### Sprint 3–4: Workflows

- Service Template bibliotek og anvendelse i booking
- Booking Planner + Google Calendar integration
- Task Board for job‑udførelse, materialer, fotos

### Sprint 5–6: Polish & Integrationer

- Billy faktura‑flow ved job completion
- Quick Actions Bar (send email, ny aftale, ny faktura, note)
- Metrics & logging, RBAC, idempotency, e2e tests

---

## UX Retningslinjer

- Sidepanel fremfor modal for at bevare indbakke‑kontekst
- Åbn Customer Profile på Emails‑fanen ved klik fra inbox
- Subtile sync indikatorer (små spinners i faner; "• Syncing…")
- Lazy‑load pr. fane; prefetch ved klik på profil
- Quick Actions altid synlige og tilgængelige

Referencer: `docs/CUSTOMER_PROFILE_CRM_FEATURES.md`

---

## Operationelle Workflows

1. Lead Intake → Review → Assign → Convert → Create Booking
2. Booking → Select Template → Set Price → Calendar Sync → Job Execution
3. Job Completion → Report & Photos → Invoice (Billy) → Follow‑up

Hvert trin er manuelt kontrolleret; automation er opt‑in (fase 2).

---

## Feature Flags (AI)

- AI suggestions for customer updates
- Smart lead assignment
- Template recommendations
- Reminder automations

Flags styres centralt og kan per bruger/rolle.

---

## Detaljerede UX Flows & Actions

### Customers

- Flow: Åbn fra inbox → Customer Profile → Overview
  - Actions: `Edit Profile`, `Add Note`, `Quick Actions` (Send email, Ny aftale, Ny faktura)
  - Data: Felter fra `customer_profiles` (status, tags, balance, counts)
  - Accept: Edit gemmer og opdaterer `updatedAt`; note opretter `customer_notes`‑post

- Flow: Properties fane
  - Actions: `Add Property`, `Assign Template`, `Create Booking`
  - Accept: Oprettet booking får kalender‑event; property metadata vises konsistent

### Leads

- Flow: Import → Review → Assign → Convert
  - Actions: `Assign Owner`, `Set Status`, `Convert to Customer`
  - Data: `leads` felter inkl. `status`, `score`
  - Accept: Convert skaber `customer_profiles` med `leadId`; pipeline transition registreres

### Service Templates

- Flow: Bibliotek → Vælg template → Brug i booking
  - Actions: `Create Template`, `Edit`, `Duplicate`, `Apply to Booking`
  - Accept: Template knyttes til booking; checklist og pris/time anvendes

### Bookings

- Flow: Opret booking → Planlægning → Kalender synk
  - Actions: `Set Date/Time`, `Select Template`, `Assign Worker`, `Sync Calendar`
  - Data: Calendar event med `title`, `description`, `location`
  - Accept: Event oprettes i `calendar_events`; vises i Planner og på profil

### Tasks (Job‑udførelse)

- Flow: Opgaver per booking → Materialer → Fotos → Afslut
  - Actions: `Start/Stop`, `Add Material`, `Upload Photo`, `Mark Complete`
  - Data: `tasks` med `priority`, `status`, `dueDate`
  - Accept: Completion kan trigge faktura; status → `done`; rapport gemmes

### Notes & Attachments

- Flow: Tilføj note/foto → vis i historik
  - Actions: `Add Note`, `Edit Note`, `Delete Note`, `Attach Photo`
  - Accept: CRUD på `customer_notes`; foto knyttes til email/thread eller booking

---

## UI Tilstande & Feedback

- Loading: spinner pr. fane (subtil)
- Saving: inline indikator + toast
- Sync: dot (`• Syncing…`) pr. datakilde (Billy, Calendar)
- Errors: inline fejltekst + retry‑knap

---

## Acceptkriterier (Fase 1)

- Customers: Opret/Rediger/Se; notes fungerer med fuld CRUD
- Leads: Assign/Status/Convert to Customer opdaterer relationer
- Templates: Kan oprettes/ændres og anvendes ved booking
- Bookings: Kalender synk fungerer og vises i Planner + profil
- Tasks: Kan skifte status og afsluttes med rapport
- Quick Actions: Synlige og funktionelle på profil

---

## Referencer

- `docs/CUSTOMER_PROFILE_CRM_FEATURES.md`
- `docs/DATA_INTEGRATION_VERIFICATION.md`
- `AUTONOMOUS-QUICK-START.md` (for Fase 2 flags)

## Acceptkriterier (Fase 1)

- End‑to‑end manual workflows fungerer (lead→customer→booking→task)
- Data modeller dækket af CRUD og validering
- Kalender og faktura‑integrationer virker med rollback‑muligheder
- Grundlæggende tests og metrics på plads

---

## Risici og Mitigation

- Adoption: start simpelt, brug feedback‑loops, forbedr iterativt
- Datakvalitet: stram validering, værktøjer til rettelser
- Integrationer: feature flags, staging, rollbacks

---

## Referencer

- `CRM_MODULE_MASTER_INDEX.md`
- `CRM_MODULE_ANALYSIS.md`
- `docs/AUTONOMOUS-OPERATIONS.md`
- `AUTONOMOUS-QUICK-START.md`
