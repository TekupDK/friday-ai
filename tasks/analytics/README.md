# Analytics Dashboard & Visualization

**Status:** ⏸️ Paused (implementation complete, dashboard pending)  
**Priority:** Medium  
**Owner:** Engineering  
**Created:** November 6, 2025

## Hvad er bygget

### ✅ Færdigt (Nov 6, 2025)

1. **Analytics Exporter** (`server/analytics.ts`)
   - Feature-flagget eksport til eksterne systemer
   - Providers: webhook, Mixpanel, Amplitude
   - Fire-and-forget, non-blocking
   - Fuld test coverage

2. **Metrics Integration** (`server/metrics.ts`)
   - In-memory tracking af alle events
   - Automatisk forward til analytics exporter
   - Events: suggestion_shown, suggestion_accepted, action_executed, action_failed, osv.

3. **ENV Configuration** (`server/_core/env.ts`, `env.template.txt`)
   - ANALYTICS_ENABLED (default: false)
   - ANALYTICS_PROVIDER (webhook, mixpanel, amplitude)
   - ANALYTICS_WEBHOOK_URL + SECRET
   - MIXPANEL_TOKEN, AMPLITUDE_API_KEY

4. **Tests** (`server/__tests__/analytics.test.ts`)
   - Verificerer disabled state
   - Verificerer webhook payload
   - Axios mocking

## 🎯 Næste skridt (Når vi fortsætter)

### 1. Byg Analytics Dashboard

#### Option A: Supabase Dashboard (anbefalet)

- Opret `friday_ai.analytics_events` tabel i DB
- Webhook endpoint gemmer events direkte i Postgres
- Byg simple SQL views for metrics:
  - Acceptance rate pr. action
  - Error rate pr. action
  - Time-to-action histogram
  - Top 5 actions
- Vis i Supabase Studio eller custom UI

#### Option B: Grafana/Metabase

- Peg webhook til time-series DB (InfluxDB/Prometheus)
- Brug Grafana dashboards til visualisering
- Pre-built templates for event tracking

#### Option C: Custom Admin Panel

- Tilføj `/admin/analytics` route i app
- Vis metrics fra `server/metrics.ts` in-memory store
- Real-time charts med Recharts
- Export til CSV

### 2. Add Admin Toggle (Optional)

Tilføj admin UI til at:

- Enable/disable analytics per miljø
- Skifte provider (webhook/mixpanel/amplitude)
- Se current status og test connectivity

**Filer at ændre:**

- `client/src/pages/AdminPanel.tsx` (ny)
- `server/routers.ts` (ny admin.updateAnalyticsConfig endpoint)
- `server/_core/env.ts` (runtime config override support)

### 3. A/B Test Integration

Kobl metrics til feature rollout:

- Track rollout_percentage i events
- Compare cohorts (10% vs 50% vs 100%)
- Automated rollout baseret på acceptance rate

**Filer at ændre:**

- `server/feature-rollout.ts` (add rollout percentage to events)
- `server/metrics.ts` (include rollout metadata)

### 4. Alert System (Nice-to-have)

Send notifikationer når:

- Error rate > 10% for en action
- Acceptance rate < 30% for en action
- Time-to-action > 5 sekunder median

**Implementation:**

- Webhook til Slack/Discord
- Email alerts via Forge API
- SMS via Twilio (for kritiske fejl)

## 📊 Metrics vi tracker nu

| Event                 | Description           | Properties                               |
| --------------------- | --------------------- | ---------------------------------------- |
| `suggestion_shown`    | AI viser et forslag   | actionType, suggestionId, conversationId |
| `suggestion_accepted` | Bruger godkender      | actionType, suggestionId, timeToAction   |
| `suggestion_rejected` | Bruger afviser        | actionType, suggestionId                 |
| `suggestion_ignored`  | Bruger ignorerer      | actionType, suggestionId                 |
| `action_executed`     | Handling udført       | actionType, conversationId, timeToAction |
| `action_failed`       | Handling fejlede      | actionType, errorMessage                 |
| `dry_run_performed`   | Preview af handling   | actionType                               |
| `rollout_check`       | Feature rollout check | feature, userId                          |
| `tool_call`           | Tool execution (audit)| toolName, requiresApproval, approved, success, code, durationMs |

## 🔧 Quick Commands

```powershell
# Enable analytics (dev)
# I .env.dev:
ANALYTICS_ENABLED=true
ANALYTICS_PROVIDER=webhook
ANALYTICS_WEBHOOK_URL=http://localhost:3001/analytics
ANALYTICS_WEBHOOK_SECRET=dev-secret

# Test webhook locally
npm run dev  # Start main app på :3000
# I ny terminal:
node tools/analytics-webhook-mock.js  # Mock webhook server på :3001

# Se metrics summary
curl http://localhost:3000/api/trpc/metrics.getMetricsSummary
```

## 📚 Dokumentation

- **ENV vars:** Se `env.template.txt` sektion "Analytics & Telemetry"
- **API:** `server/analytics.ts` - `trackAnalytics(event)`
- **Tests:** `server/__tests__/analytics.test.ts`
- **Integration:** `server/metrics.ts` - `trackMetric()` caller `trackAnalytics()`

## 🎨 Dashboard Mock (Inspiration)

```text
┌─────────────────────────────────────────────────────┐
│ 📊 Analytics Dashboard                              │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Suggestion Acceptance Rate:  73% ▲ +5%            │
│ Average Time-to-Action:      2.4s ▼ -0.3s         │
│ Action Error Rate:           4.2% ▼ -1.1%         │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ Top Actions (Last 7 Days)                   │   │
│ ├─────────────────────────────────────────────┤   │
│ │ 1. create_task         127 uses  ✅ 82%     │   │
│ │ 2. create_invoice       89 uses  ✅ 76%     │   │
│ │ 3. book_meeting         64 uses  ✅ 71%     │   │
│ │ 4. search_email         52 uses  ✅ 88%     │   │
│ │ 5. create_lead          41 uses  ⚠️  64%     │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ Error Breakdown (Last 24h)                  │   │
│ ├─────────────────────────────────────────────┤   │
│ │ ❌ Billy API timeout (create_invoice)  5x   │   │
│ │ ❌ Invalid email format (create_lead)  3x   │   │
│ │ ❌ Calendar conflict (book_meeting)    2x   │   │
│ └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## 🚀 Estimeret tid

- Dashboard (Option A - Supabase): 2-3 timer
- Dashboard (Option B - Grafana): 4-5 timer
- Dashboard (Option C - Custom UI): 6-8 timer
- Admin toggle: 1-2 timer
- A/B test integration: 2-3 timer
- Alert system: 3-4 timer

**Total (minimum viable):** 2-3 timer  
**Total (full featured):** 10-15 timer

## 🔗 Related Tasks

- `tasks/chat/STATUS.md` - Chat system status
- `tasks/security/RBAC.md` - Role-based access control
- `tasks/testing/PLAN.md` - Test coverage

---

**Note:** Alt kode er klar og testet. Dette dokument beskriver kun de frivillige udvidelser til at visualisere og agere på dataene.
