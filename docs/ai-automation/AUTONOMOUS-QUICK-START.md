# 🚀 Autonomous Lead Intelligence - Quick Start

Get Friday AI's autonomous operations running in 5 minutes.

## ✅ Prerequisites

- Node.js 18+ installed

- Supabase database configured

- `.env` file with required variables

## 📦 What You Get

- ✅ **231 AI-enriched leads** imported into Supabase

- ✅ **Automatic insight detection** (missing bookings, at-risk, upsell)

- ✅ **Follow-up task creation** every 4 hours

- ✅ **Friday AI integration** with customer intelligence API

- ✅ **Daily pipeline refresh** at 02:30

## 🎯 Step 1: Verify Environment (30 seconds)

Check your `.env` file has:

```ini
DATABASE_URL=postgresql://...?schema=friday_ai
OWNER_OPEN_ID=owner-friday-ai-dev
JWT_SECRET=your-secure-secret
VITE_APP_ID=tekup-friday-dev

```text

## 🎯 Step 2: Run Import (2 minutes)

```bash

# Import v4.3.5 data

npx tsx server/scripts/import-pipeline-v4_3_5.ts

# Validate (optional)

npx tsx server/scripts/validate-import.ts

```text

**Expected output:**

```text
✅ Dataset loaded (version 4.3 → import as 4.3.5)
   Leads: 231

================= Import Summary =================
Created leads:         231
Customers linked:      231
Invoices upserted:     95
Errors:                0
=================================================

```text

## 🎯 Step 3: Test Action Handler (1 minute)

```bash

# Dry run (no database changes)

npx tsx server/scripts/action-handler.ts --dry-run

```text

**Expected output:**

```text
📊 ACTION HANDLER SUMMARY
Total insights:     25
Actions created:    23  (would create in dry run)

By Type:
   missing_booking     : 15
   at_risk            : 5
   upsell             : 5

```text

## 🎯 Step 4: Schedule Automation (1 minute)

### Windows

```powershell

# Run PowerShell as Administrator

cd C:\Users\empir\Tekup\services\tekup-ai-v2

# Schedule import (daily at 02:30)

.\scripts\register-import-schedule.ps1

# Schedule action handler (every 4 hours)

.\scripts\register-action-schedule.ps1

```text

### Linux/Mac

```bash

# Edit crontab

crontab -e

# Add these lines

30 2 * * * cd /path/to/tekup-ai-v2 && npx tsx server/scripts/import-pipeline-v4_3_5.ts >> logs/import.log 2>&1

0 */4 * * * cd /path/to/tekup-ai-v2 && npx tsx server/scripts/action-handler.ts >> logs/actions.log 2>&1

```text

## 🎯 Step 5: Start Server & Test API (30 seconds)

```bash

# Start Friday AI server

npm run dev

# In another terminal, test API endpoint

curl <http://localhost:3000/api/trpc/fridayLeads.getDashboardStats>

```text

## ✅ Verification Checklist

- [ ] Import ran successfully (231 leads)

- [ ] Validation passed

- [ ] Action handler detected insights (dry run)

- [ ] Scheduled tasks registered (Windows) or cron configured (Linux/Mac)

- [ ] Server starts without errors

- [ ] API endpoints respond

## 📊 What's Running Now

| Component                   | Schedule      | Purpose                               |
| --------------------------- | ------------- | ------------------------------------- |

| `import-pipeline-v4_3_5.ts` | Daily 02:30   | Refresh lead data from v4.3.5 dataset |
| `action-handler.ts`         | Every 4 hours | Detect insights & create tasks        |
| Friday AI Server            | Always on     | Serve `fridayLeads` API endpoints     |

## 🔍 Monitor Status

```bash

# View logs

Get-Content logs/import-pipeline-$(Get-Date -Format 'yyyyMMdd').log -Tail 20
Get-Content logs/action-handler-$(Get-Date -Format 'yyyyMMdd').log -Tail 20

# Check scheduled tasks (Windows)

Get-ScheduledTask -TaskName "Friday-AI-*"

# View recent actions

psql $DATABASE_URL -c "SELECT * FROM friday_ai.tasks WHERE metadata->>'generatedBy' = 'action_handler' ORDER BY created_at DESC LIMIT 10;"

```

## 🎉 You're Done

Friday AI now autonomously:

- ✅ Imports and tracks 231 enriched leads

- ✅ Detects missing bookings from recurring customers

- ✅ Flags at-risk customers for review

- ✅ Identifies upsell opportunities (VIPs >10K kr)

- ✅ Creates follow-up tasks automatically

- ✅ Provides customer intelligence to Friday AI conversations

## 📚 Next Steps

- **Full docs**: See `docs/AUTONOMOUS-OPERATIONS.md`

- **API reference**: Check `server/routers/friday-leads-router.ts`

- **Customize schedules**: Edit PowerShell scripts in `scripts/`

- **Wire Friday AI**: Use `trpc.fridayLeads.*` endpoints in chat

## 🆘 Troubleshooting

**Import fails**: Check `OWNER_OPEN_ID` in `.env`
**No insights**: Run `npx tsx server/scripts/validate-import.ts`
**Task not running**: Verify with `Get-ScheduledTask` and check logs
**API errors**: Ensure server is running and database is accessible

---

**Status**: ✅ Production Ready
**Version**: v4.3.5
**Last Updated**: November 10, 2024
