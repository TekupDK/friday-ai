# 📋 CRM Documentation Index

**Status:** ✅ Backend Complete - Ready for Frontend Development  
**Last Updated:** November 11, 2025

---

## 🎯 AKTIV DOKUMENTATION (Kiro Specs)

**Location:** `.kiro/specs/crm-module/`

### For Frontend Development (Kiro)

| Document                                                              | Purpose                                                         | Status      |
| --------------------------------------------------------------------- | --------------------------------------------------------------- | ----------- |
| **[API_REFERENCE.md](./.kiro/specs/crm-module/API_REFERENCE.md)**     | Komplet TRPC endpoint reference med TypeScript examples         | ✅ Complete |
| **[HANDOFF_TO_KIRO.md](./.kiro/specs/crm-module/HANDOFF_TO_KIRO.md)** | Frontend handoff guide, quick start, phase plan                 | ✅ Complete |
| **[requirements.md](./.kiro/specs/crm-module/requirements.md)**       | 20 functional requirements med acceptance criteria              | ✅ Complete |
| **[tasks.md](./.kiro/specs/crm-module/tasks.md)**                     | 4-phase frontend implementation plan (862 lines)                | ✅ Complete |
| **[design.md](./.kiro/specs/crm-module/design.md)**                   | System architecture, component structure, TypeScript interfaces | ✅ Complete |

**Start Here:** [HANDOFF_TO_KIRO.md](./.kiro/specs/crm-module/HANDOFF_TO_KIRO.md)

---

## 🏗️ Backend Implementation Status

### ✅ Completed Backend Routers

| Router                  | Endpoints                                   | File                                            |
| ----------------------- | ------------------------------------------- | ----------------------------------------------- |
| **crm.customer**        | 9 endpoints (profiles + properties + notes) | `server/routers/crm-customer-router.ts`         |
| **crm.lead**            | 4 endpoints (pipeline management)           | `server/routers/crm-lead-router.ts`             |
| **crm.booking**         | 4 endpoints (calendar + scheduling)         | `server/routers/crm-booking-router.ts`          |
| **crm.serviceTemplate** | 5 endpoints (service library)               | `server/routers/crm-service-template-router.ts` |
| **crm.stats**           | 1 endpoint (dashboard metrics)              | `server/routers/crm-stats-router.ts`            |

**Total:** 23 TRPC endpoints ready for frontend consumption

### 🗄️ Database Schema

All tables in `friday_ai` PostgreSQL schema:

```sql
✅ customer_profiles        -- Core customer data
✅ customer_properties      -- Ejendomme (properties)
✅ customer_notes          -- Customer notes/timeline
✅ leads                   -- Lead pipeline
✅ bookings                -- Service bookings
✅ service_templates       -- Standard service library (6 seeded)
✅ customer_invoices       -- Billy integration (read-only)
```

### 🧪 Testing & Seeding

```bash
# TypeScript validation
pnpm run check

# Seed Rendetalje service templates (6 services)
pnpm run crm:seed:templates
pnpm run crm:seed:templates:staging

# CRM smoke tests
pnpm run crm:test:staging
pnpm run crm:test:staging:watch
```

---

## 📚 ARKIVEREDE DOKUMENTER (Reference Only)

**Location:** Root directory

Følgende dokumenter var del af tidligere CRM brainstorming og analyse. De er nu **archived** men kan bruges som reference:

### Strategy & Planning

- `CRM_MODULE_MASTER_INDEX.md` - Tidligere master index (replaced by this file)
- `CRM_IMPLEMENTATION_GUIDE.md` - Gammel implementation guide (se nu `.kiro/specs/`)
- `CRM_REDESIGN_MANUAL_FIRST.md` - Manual-first approach roadmap
- `DEPLOYMENT_ROADMAP.md` - Original deployment plan

### Analysis & Brainstorming

- `CRM_MODULE_ANALYSIS.md` - Teknisk analyse
- `CRM_COMPONENTS_ASSESSMENT.md` - Component breakdown
- `CRM_BRAINSTORM_RENDETALJE.md` - Rendetalje-specific features
- `CRM_REPO_ARCHITECTURE_ANALYSIS.md` - Repository structure analysis
- `CRM_NEXT_STEPS_ACTION_PLAN.md` - Action plan (now superseded)

### UI Documentation

- `CRM_UI_DOCUMENTATION.md` - UI component library (pre-Kiro specs)
- `docs/CUSTOMER_PROFILE_CRM_FEATURES.md` - Customer profile features

**Note:** Disse docs er ikke længere aktive. Brug `.kiro/specs/crm-module/` i stedet.

---

## 🎯 For Developers

### Backend Developers

**Primary Docs:**

- Database schema: `drizzle/schema.ts`
- Router implementations: `server/routers/crm-*.ts`
- API tests: `server/__tests__/crm-smoke.test.ts`

### Frontend Developers (Kiro)

**Primary Docs:**

- **[HANDOFF_TO_KIRO.md](./.kiro/specs/crm-module/HANDOFF_TO_KIRO.md)** - Start here!
- **[API_REFERENCE.md](./.kiro/specs/crm-module/API_REFERENCE.md)** - All endpoints documented
- **[tasks.md](./.kiro/specs/crm-module/tasks.md)** - Implementation tasks

### Product/PM

**Primary Docs:**

- **[requirements.md](./.kiro/specs/crm-module/requirements.md)** - Business requirements
- **[design.md](./.kiro/specs/crm-module/design.md)** - System architecture

---

## 📞 Support

**Backend:** Jonas (jonas@rendetalje.dk)  
**Frontend:** Kiro Team  
**Product:** Rendetalje Management

---

## 🗂️ Document History

| Version | Date         | Changes                                                    |
| ------- | ------------ | ---------------------------------------------------------- |
| 3.0     | Nov 11, 2025 | Complete backend implementation, Kiro handoff docs created |
| 2.0     | Oct 2025     | Kiro specs created (`.kiro/specs/crm-module/`)             |
| 1.5     | Sep 2025     | Original CRM docs (root-level MD files)                    |

**Current Version:** 3.0 (Backend Complete)
