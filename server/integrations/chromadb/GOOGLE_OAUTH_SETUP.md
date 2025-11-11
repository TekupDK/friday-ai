# Google OAuth Setup Guide for V4.3 Data Collection

## Problem: `unauthorized_client` Error

If you see this error:
```
❌ Google OAuth Failed:
unauthorized_client: Client is unauthorized to retrieve access tokens using this method, 
or client not authorized for any of the scopes requested.
```

**Root Cause**: Service Account has Domain-Wide Delegation enabled, but the required scopes are not authorized in Google Workspace Admin Console.

---

## ✅ Solution: Authorize Scopes

### Step 1: Get Service Account Client ID

Your service account:
```
Email: renos-319@renos-465008.iam.gserviceaccount.com
Client ID: 113277186090139582531
```

### Step 2: Configure Domain-Wide Delegation

1. **Go to Google Workspace Admin Console**:
   ```
   https://admin.google.com/ac/owl/domainwidedelegation
   ```

2. **Click "Add new"** (or edit existing if service account already listed)

3. **Enter Client ID**:
   ```
   113277186090139582531
   ```

4. **Enter OAuth Scopes** (copy-paste this EXACTLY):
   ```
   https://www.googleapis.com/auth/calendar.readonly,https://www.googleapis.com/auth/gmail.readonly
   ```

5. **Click "Authorize"**

6. **Wait 5-10 minutes** for Google to propagate changes

### Step 3: Verify Setup

Run the collection script again:
```bash
npx tsx server/integrations/chromadb/scripts/1-collect-and-link-v4_3.ts
```

You should see:
```
✅ Google OAuth authenticated
📧 Collecting Gmail threads...
```

---

## 🔍 Troubleshooting

### Still Getting `unauthorized_client`?

**Check 1: Correct Client ID**
```bash
# Get Client ID from service account JSON
cat .env.dev | grep GOOGLE_SERVICE_ACCOUNT_KEY | jq -r '.client_id'
```

**Check 2: Correct Scopes**
Make sure you added BOTH scopes (comma-separated, no spaces):
- ✅ `https://www.googleapis.com/auth/calendar.readonly,https://www.googleapis.com/auth/gmail.readonly`
- ❌ NOT separate entries!

**Check 3: Impersonated User Exists**
```
Impersonating: info@rendetalje.dk
```
- This email must exist in your Google Workspace
- Service account will act on behalf of this user

**Check 4: Wait for Propagation**
- Google can take up to 15 minutes to apply changes
- Try again after waiting

---

## 📊 What Data Will Be Collected

Once OAuth is working:

### Gmail Threads
- Time range: July 1 - November 30, 2025
- Filters: Inbox, sent, archived
- Data: Subject, from/to, date, body snippet, labels

### Calendar Events
- Time range: July 1 - November 30, 2025
- Calendar: `c_39570a852bf141658572fa37bb229c7246564a6cca47560bc66a4f9e4fec67ff@group.calendar.google.com`
- Data: Event summary, description, start/end times, attendees, location

### Billy Invoices
- Time range: July 1 - November 30, 2025
- States: approved, sent, paid only
- Data: Invoice number, amount, hours, customer info, line items

---

## 🔗 Expected Output

After successful collection:

```json
{
  "metadata": {
    "version": "4.3",
    "stage": "raw",
    "counts": {
      "total": 662,
      "withGmail": 662,
      "withCalendar": 234,
      "withBilly": 89
    }
  },
  "leads": [ /* 662 linked leads */ ]
}
```

Output file: `server/integrations/chromadb/test-data/raw-leads-v4_3.json`

---

## 🚀 Next Steps After OAuth Fix

1. ✅ Fix OAuth (this guide)
2. Run Script 1: `npx tsx scripts/1-collect-and-link-v4_3.ts`
3. Run Script 2: `npx tsx scripts/2-calculate-metrics-v4_3.ts`
4. Run Script 3: `npx tsx scripts/3-pipeline-analysis-v4_3.ts`
5. Build Customer Cards V5.1

---

## 💡 Alternative: Use Existing V4.2 Data

If you can't fix OAuth right now, you can convert existing V4.2 data:

```bash
# Convert V4.2 → V4.3 format (preserves real data)
npx tsx scripts/1-convert-v4_2-to-v4_3.ts
```

This will:
- ✅ Use your existing production data
- ✅ Apply new V4.3 structure
- ✅ Calculate all metrics
- ⚠️ Won't have newest data (last V4.2 run)

---

## 📞 Support

If you're still stuck:
1. Check service account has domain-wide delegation enabled in GCP Console
2. Verify `info@rendetalje.dk` has access to Gmail and Calendar
3. Try with a different impersonated user email
4. Check Google Workspace audit logs for denied API requests
