# Friday AI Autonomous Operations Guide

Complete guide to the autonomous lead intelligence and action handling system for v4.3.5.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Components](#components)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Automated Scripts](#automated-scripts)
- [Monitoring & Logs](#monitoring--logs)
- [Troubleshooting](#troubleshooting)

---

## Overview

The autonomous operations system enables Friday AI to automatically:

1. **Import enriched lead data** from the v4.3.5 AI pipeline into Supabase
1. **Detect actionable insights** (missing bookings, at-risk customers, upsell opportunities)
1. **Create follow-up tasks** automatically for sales/operations teams
1. **Provide intelligent lead context** to Friday AI conversations

### Key Benefits

- **⏱️ Time Savings**: Automated detection of opportunities and risks
- **📈 Revenue Protection**: Proactive outreach to at-risk recurring customers
- **💰 Upsell Detection**: Automatic flagging of high-value VIP customers
- **🤖 Zero Manual Work**: Fully autonomous operation with scheduled tasks
- **📊 Data Quality**: Single source of truth for customer intelligence

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    v4.3.5 Lead Pipeline                      │
│  (ChromaDB + AI Enhancement + Deduplication + Metrics)       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ complete-leads-v4.3.3.json
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           Import Script (import-pipeline-v4_3_5.ts)          │
│  • Idempotent upserts (datasetLeadId tracking)              │
│  • Synthetic email generation for missing data              │
│  • Links leads → customer profiles → invoices               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Database                         │
│  • friday_ai.leads                                           │
│  • friday_ai.customer_profiles                               │
│  • friday_ai.customer_invoices                               │
│  • friday_ai.tasks                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│        Friday AI tRPC API (fridayLeads router)               │
│  • lookupCustomer                                            │
│  • getCustomerIntelligence                                   │
│  • getActionableInsights                                     │
│  • getDashboardStats                                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         Action Handler (action-handler.ts)                   │
│  • Detects missing bookings (90+ days)                       │
│  • Flags at-risk customers                                   │
│  • Creates upsell tasks for VIPs (>10K kr)                   │
│  • Runs every 4 hours (scheduled task)                       │
└─────────────────────────────────────────────────────────────┘

```text

---

## Components

### 1. Import Pipeline (`server/scripts/import-pipeline-v4_3_5.ts`)

Loads enriched lead data from the v4.3.5 dataset and upserts into Supabase.

**Features:**

- ✅ Idempotent (uses `datasetLeadId` in metadata)
- ✅ Synthetic email generation for missing data
- ✅ Links leads → customer profiles → invoices
- ✅ Rich metadata preservation (quality, financial, pipeline stage)
- ✅ Detailed logging and error handling

**Usage:**

```bash
# Default dataset path
npx tsx server/scripts/import-pipeline-v4_3_5.ts

# Custom dataset
npx tsx server/scripts/import-pipeline-v4_3_5.ts path/to/dataset.json

```text

**Output:**

```text
================= Import Summary =================
Processed leads:       231
Created leads:         231
Updated leads:         0
Skipped leads:         0
Customers linked:      231
Invoices upserted:     95
Synthetic emails used: 0
Errors:                0
=================================================

```text

### 2. Validation Script (`server/scripts/validate-import.ts`)

Validates import data quality and generates a detailed report.

**Checks:**

- Lead counts by status
- Customer profile linkage
- Invoice data completeness
- Data quality metrics (missing emails/phones, synthetic emails)

**Usage:**

```bash
npx tsx server/scripts/validate-import.ts

```text

**Output:**

```text
📋 VALIDATION REPORT
=================================================
📌 LEADS:
   Total:                  231
   From v4.3.5:            231
   With customer profiles: 231
   Premium customers:      45
   Recurring customers:    67

👥 CUSTOMER PROFILES:
   Total:              231
   Total invoiced:     1,234,567.00 kr
   Total paid:         1,150,000.00 kr

💰 INVOICES:
   Total:         95
   Total amount:  1,234,567.00 kr

🔍 DATA QUALITY:
   Leads without phone:       12
   Synthetic emails used:     0

✅ All validation checks passed!

```text

### 3. Friday Leads Router (`server/routers/friday-leads-router.ts`)

tRPC API endpoints for Friday AI integration.

**Endpoints:**

#### `fridayLeads.lookupCustomer`

Search for customer by name, email, or phone.

```typescript
const result = await trpc.fridayLeads.lookupCustomer.query({
  query: "John Doe",
  includeInvoices: true,
});

```text

#### `fridayLeads.getCustomerIntelligence`

Get comprehensive customer intelligence for Friday AI.

```typescript
const intel = await trpc.fridayLeads.getCustomerIntelligence.query({
  leadId: 123,
  // OR customerId: 456
  // OR email: "<customer@example.com>"
});

```text

**Response:**

```json
{
  "customer": {
    "id": 123,
    "name": "John Doe",
    "email": "<john@example.com>",
    "status": "vip",
    "tags": ["recurring", "premium"]
  },
  "financial": {
    "totalInvoiced": 250000,
    "totalPaid": 240000,
    "balance": 10000,
    "invoiceCount": 15
  },
  "behavioral": {
    "isRecurring": true,
    "recurringFrequency": "monthly",
    "hasComplaints": false,
    "lastContactDate": "2024-11-01T00:00:00Z"
  },
  "insights": {
    "aiResume": "15 historiske bookinger • Frekvens: monthly • Lifetime value: 25,000 kr",
    "pipelineStage": "active",
    "quality": { "dataCompleteness": 95 }
  }
}

```text

#### `fridayLeads.getActionableInsights`

Get autonomous action recommendations.

```typescript
const insights = await trpc.fridayLeads.getActionableInsights.query({
  insightType: "all", // or "missing_bookings", "at_risk", "upsell"
  limit: 20,
});

```text

**Response:**

```json
{
  "insights": [
    {
      "type": "missing_booking",
      "priority": "high",
      "customer": {
        "id": 123,
        "name": "John Doe",
        "email": "<john@example.com>"
      },
      "message": "Recurring customer John Doe has no bookings in the last 90 days",
      "actionable": true,
      "suggestedAction": "reach_out"
    }
  ],
  "count": 15,
  "generatedAt": "2024-11-10T22:00:00Z"
}

```text

#### `fridayLeads.getDashboardStats`

Get high-level dashboard statistics.

```typescript
const stats = await trpc.fridayLeads.getDashboardStats.query();

```text

### 4. Action Handler (`server/scripts/action-handler.ts`)

Autonomous detection and action creation for insights.

**Actions:**

- 📞 **Missing Bookings**: Creates follow-up tasks for recurring customers without recent activity (90+ days)
- ⚠️ **At-Risk Customers**: Creates review tasks for customers flagged as at-risk
- 💎 **Upsell Opportunities**: Creates upsell tasks for VIP customers with high lifetime value (>10K kr)

**Usage:**

```bash
# Dry run (no database changes)
npx tsx server/scripts/action-handler.ts --dry-run

# Production run
npx tsx server/scripts/action-handler.ts

```text

**Output:**

```text
📊 ACTION HANDLER SUMMARY
=================================================
Total insights:     25
Actions created:    23
Actions failed:     2

By Type:
   missing_booking     : 15
   at_risk            : 5
   upsell             : 5

📋 Recent Actions:
   ✅ missing_booking • John Doe: Follow-up task created
   ✅ at_risk • Jane Smith: Review task created
   ✅ upsell • Bob Johnson: Upsell task created

```text

---

## Setup Instructions

### 1. Environment Configuration

Create/update `.env.supabase`:

```ini
# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME?schema=friday_ai&sslmode=require

# Owner User
OWNER_OPEN_ID=owner-friday-ai-dev

# Security
JWT_SECRET=your-secure-jwt-secret-min-32-chars

# App
VITE_APP_ID=tekup-friday-dev

# Optional: Disable ChromaDB during import
CHROMA_ENABLED=false

```text

### 2. Initial Import

```bash
# 1. Run import
npx tsx server/scripts/import-pipeline-v4_3_5.ts

# 2. Validate
npx tsx server/scripts/validate-import.ts

# 3. Test action handler (dry run)
npx tsx server/scripts/action-handler.ts --dry-run

```text

### 3. Schedule Autonomous Tasks

#### Windows Task Scheduler

**Import Pipeline** (daily at 02:30):

```powershell
# Run as Administrator
.\scripts\register-import-schedule.ps1

# Custom time
.\scripts\register-import-schedule.ps1 -StartTime "03:00"

# Remove
.\scripts\register-import-schedule.ps1 -Unregister

```text

**Action Handler** (every 4 hours):

```powershell
# Run as Administrator
.\scripts\register-action-schedule.ps1

# Custom interval
.\scripts\register-action-schedule.ps1 -IntervalHours 6

# Remove
.\scripts\register-action-schedule.ps1 -Unregister

```text

#### Linux/Mac Cron

**Import Pipeline** (daily at 02:30):

```bash
30 2 * * * cd /path/to/tekup-ai-v2 && npx tsx server/scripts/import-pipeline-v4_3_5.ts >> logs/import-pipeline.log 2>&1

```text

**Action Handler** (every 4 hours):

```bash
0 */4 * * * cd /path/to/tekup-ai-v2 && npx tsx server/scripts/action-handler.ts >> logs/action-handler.log 2>&1

```text

### 4. Wire Friday AI Integration

The `fridayLeadsRouter` is already registered in `server/routers.ts`. Friday AI can now use these endpoints:

```typescript
// In Friday AI conversation context
const customerInfo = await trpc.fridayLeads.lookupCustomer.query({
  query: userMessage.extractedEmail,
});

if (customerInfo.found) {
  // Include in AI prompt context
  const intelligence = await trpc.fridayLeads.getCustomerIntelligence.query({
    customerId: customerInfo.customers[0].profile.id,
  });
}

```text

---

## Monitoring & Logs

### Log Files

All scripts log to `logs/` directory:

- `logs/import-pipeline-YYYYMMDD.log` - Import runs
- `logs/action-handler-YYYYMMDD.log` - Action handler runs

### View Logs

```bash
# Latest import log
Get-Content logs/import-pipeline-$(Get-Date -Format 'yyyyMMdd').log -Tail 50

# Latest action handler log
Get-Content logs/action-handler-$(Get-Date -Format 'yyyyMMdd').log -Tail 50

# Watch live
Get-Content logs/action-handler-$(Get-Date -Format 'yyyyMMdd').log -Wait

```text

### Task Status

```powershell
# View scheduled tasks
Get-ScheduledTask -TaskName "Friday-AI-*"

# Run manually
Start-ScheduledTask -TaskName "Friday-AI-Pipeline-Import"
Start-ScheduledTask -TaskName "Friday-AI-Action-Handler"

# View last run result
Get-ScheduledTaskInfo -TaskName "Friday-AI-Pipeline-Import"

```text

### Database Checks

```sql
-- Count leads from v4.3.5
SELECT COUNT(*)
FROM friday_ai.leads
WHERE metadata->>'datasetVersion' = '4.3.5';

-- Recent tasks created by action handler
SELECT *
FROM friday_ai.tasks
WHERE metadata->>'generatedBy' = 'action_handler'
ORDER BY created_at DESC
LIMIT 10;

-- Customer profile stats
SELECT
  status,
  COUNT(*) as count,
  SUM(total_invoiced)/100 as total_invoiced_kr
FROM friday_ai.customer_profiles
GROUP BY status;

```text

---

## Troubleshooting

### Import Issues

**Problem**: "OWNER_OPEN_ID missing"
**Solution**:

```bash
# Set in .env.supabase
OWNER_OPEN_ID=your-owner-openid

# Or create user by logging into Friday AI once

```

**Problem**: "Owner user not found"
**Solution**: The script now auto-creates the user via `upsertUser` if missing.

**Problem**: Duplicate leads
**Solution**: Import is idempotent using `datasetLeadId`. Re-running updates existing records.

### Action Handler Issues

**Problem**: No insights generated
**Solution**:

- Check if customer_profiles have `tags` array with "recurring"
- Verify `status` field is set correctly ("at_risk", "vip")
- Run validation script to check data quality

**Problem**: Task creation fails
**Solution**:

- Ensure `friday_ai.tasks` table exists
- Check user permissions on tasks table
- Run with `--dry-run` to test logic without DB writes

### Scheduled Task Issues

**Problem**: Task doesn't run
**Solution**:

- Verify task status: `Get-ScheduledTask -TaskName "Friday-AI-*"`
- Check task history: `Get-ScheduledTaskInfo`
- Ensure user has login rights and network access
- Run manually to test: `Start-ScheduledTask`

**Problem**: Task runs but no output
**Solution**:

- Check log files in `logs/` directory
- Verify working directory is set correctly
- Test script manually from project root

---

## Next Steps

### Phase 2: Enhanced Friday AI Integration

- [ ] Wire `lookupCustomer` into Friday AI conversation context
- [ ] Add "Customer Intelligence" card to email threads
- [ ] Show actionable insights in Friday AI dashboard
- [ ] Add voice commands: "Show me at-risk customers"

### Phase 3: Advanced Automation

- [ ] Email notifications for high-priority insights
- [ ] Slack/Teams integration for action alerts
- [ ] Automatic booking reminder emails (with user approval)
- [ ] Revenue forecasting based on pipeline health

### Phase 4: AI-Powered Actions

- [ ] LLM-generated personalized email drafts
- [ ] Sentiment analysis on customer communications
- [ ] Predictive churn modeling
- [ ] Dynamic pricing recommendations for VIP customers

---

## Support

For questions or issues:

- Check logs in `logs/` directory
- Run validation: `npx tsx server/scripts/validate-import.ts`
- Test manually: `npx tsx server/scripts/action-handler.ts --dry-run`
- Review this documentation

**Status**: ✅ Production Ready (v4.3.5)
**Last Updated**: November 10, 2024
