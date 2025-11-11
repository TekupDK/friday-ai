# V4.3 Deduplication & Filtering Strategy

## 🎯 Problem

Din Gmail/Calendar/Billy data indeholder:

1. **Duplicates** — Samme kunde med flere Gmail threads, calendar bookings, invoices
2. **Spam/Noise** — Mærkedage, møder, irrelevante events
3. **Dead Leads** — No response efter 30+ dage
4. **Active Recurring** — Fast rengøring kunder (ongoing)
5. **Lost Leads** — Declined, cancelled, no show

**Mål**: Én canonical lead per customer med korrekt status og aggregated data.

---

## 🔑 Deduplication Strategy

### Step 1: Generate Customer Key

```typescript
// Priority: email > phone > name
function generateCustomerKey(lead) {
  if (lead.email) return `email:${normalize(email)}`;
  if (lead.phone) return `phone:${normalize(phone)}`;
  if (lead.name) return `name:${normalize(name)}`;
  return 'unknown';
}
```

**Example:**
```
lars.joenstrup@live.dk → "email:lars.joenstrup@live.dk"
40456319             → "phone:40456319"
Lars Dollerup        → "name:larsdollerup"
```

### Step 2: Group Leads by Customer Key

```typescript
const groups = new Map();

// Input: 800 raw leads
// Output: ~350 unique customers (rest are duplicates)

groups.set("email:lars.joenstrup@live.dk", [
  { gmailThread1, calendar1, billy1 },
  { gmailThread2, calendar2, billy2 },
  { gmailThread3, null, billy3 },
]);
```

### Step 3: Merge Leads for Same Customer

```typescript
function mergeCustomerLeads(leads) {
  return {
    // Use most recent/complete data
    gmail: mostRecentGmail(leads),
    calendar: mostRecentCalendar(leads),
    billy: mostRecentBilly(leads),
    
    // Aggregate customer value
    customer: {
      isRepeatCustomer: leads.length > 1,
      totalBookings: countCalendarEvents(leads),
      lifetimeValue: sumBillyInvoices(leads),
      firstBookingDate: minDate(leads),
      lastBookingDate: maxDate(leads),
    }
  };
}
```

**Example Output:**
```json
{
  "id": "LEAD_lars_dollerup",
  "customerEmail": "lars.joenstrup@live.dk",
  "gmail": { /* most recent thread */ },
  "calendar": { /* most recent booking */ },
  "billy": { /* most recent invoice */ },
  "customer": {
    "isRepeatCustomer": true,
    "totalBookings": 3,
    "lifetimeValue": 5250.00,
    "firstBookingDate": "2025-07-15",
    "lastBookingDate": "2025-11-10"
  }
}
```

---

## 🚦 Lead Status Classification

### Status Hierarchy (Auto-detected)

```typescript
enum LeadStatus {
  SPAM = 'spam',                    // ❌ Filtered noise
  NEW = 'new',                      // 🆕 No action yet
  CONTACTED = 'contacted',          // 📧 We replied
  NO_RESPONSE = 'no_response',      // ⏰ 7+ days no reply
  DEAD = 'dead',                    // 💀 30+ days no reply
  QUOTED = 'quoted',                // 💰 Quote sent
  SCHEDULED = 'scheduled',          // 📅 Booking confirmed
  INVOICED = 'invoiced',            // 📄 Invoice sent
  PAID = 'paid',                    // ✅ Payment received
  ACTIVE_RECURRING = 'active_recurring', // 🔄 Ongoing customer
  LOST = 'lost',                    // ❌ Declined/cancelled
  CANCELLED = 'cancelled',          // ❌ Booking cancelled
}
```

### Detection Rules

```typescript
function determineLeadStatus(lead) {
  // 1. Check spam labels
  if (lead.gmail.labels.includes('Spam')) return SPAM;
  
  // 2. Check Billy invoice status
  if (lead.billy?.isPaid) {
    // Special case: Fast rengøring = recurring customer
    if (lead.serviceType === 'REN-005') {
      return ACTIVE_RECURRING;
    }
    return PAID;
  }
  if (lead.billy?.state === 'sent') return INVOICED;
  
  // 3. Check calendar booking
  if (lead.calendar) {
    if (isFutureEvent(lead.calendar)) return SCHEDULED;
    return QUOTED; // Past event without invoice
  }
  
  // 4. Check Gmail timeline
  if (lead.firstReplyDate) {
    const daysSinceReply = daysSince(lead.firstReplyDate);
    if (daysSinceReply > 30) return DEAD;
    if (daysSinceReply > 7) return NO_RESPONSE;
    return CONTACTED;
  }
  
  // 5. No action yet
  const daysSinceReceived = daysSince(lead.leadReceivedDate);
  if (daysSinceReceived > 30) return DEAD;
  
  return NEW;
}
```

---

## 🔍 Filtering Options

### Default Filter (Production)

```typescript
const PRODUCTION_FILTER = {
  includeSpam: false,           // ❌ Remove spam
  includeDead: false,           // ❌ Remove dead leads
  includeNoResponse: true,      // ✅ Keep (might convert later)
  minDataCompleteness: 30,      // 30% minimum
  requiredFields: [],           // No requirements
};
```

### Analysis Filter (All Data)

```typescript
const ANALYSIS_FILTER = {
  includeSpam: true,            // ✅ Keep for spam analysis
  includeDead: true,            // ✅ Keep for conversion metrics
  includeNoResponse: true,      // ✅ Keep all
  minDataCompleteness: 0,       // No minimum
  requiredFields: [],
};
```

### Won Deals Only

```typescript
const WON_DEALS_FILTER = {
  includeSpam: false,
  includeDead: false,
  includeNoResponse: false,
  minDataCompleteness: 80,      // High quality only
  requiredFields: ['billy'],    // Must have invoice
};
```

---

## 📊 Expected Output Distribution

### Input (Raw Data)
```
Gmail Threads:     662
Calendar Events:   210
Billy Invoices:    140
Total Raw Leads:   ~800
```

### After Deduplication
```
Unique Customers:  ~350
  ├─ Single lead:    250 (71%)
  ├─ 2-3 leads:       80 (23%)
  └─ 4+ leads:        20 (6%)  ← Repeat customers

Merged/Removed:    ~450 duplicate entries
```

### After Filtering (Production)
```
SPAM:              50  (removed) ❌
DEAD:              80  (removed) ❌
NO_RESPONSE:       60  (kept)    ⚠️
NEW:               40  (kept)    🆕
CONTACTED:         50  (kept)    📧
QUOTED:            30  (kept)    💰
SCHEDULED:         20  (kept)    📅
INVOICED:          15  (kept)    📄
PAID:              45  (kept)    ✅
ACTIVE_RECURRING:  10  (kept)    🔄

Final Output:      270 leads
```

---

## 🔄 Active Recurring Customers

**Special Handling for Fast Rengøring (REN-005)**

```json
{
  "id": "LEAD_recurring_001",
  "serviceType": "REN-005",
  "pipeline": {
    "stage": "active",
    "substage": "recurring",
    "status": "active_recurring"
  },
  "customer": {
    "isRepeatCustomer": true,
    "totalBookings": 12,          // 12 monthly cleanings
    "lifetimeValue": 41880.00,    // 12 × 3490 kr
    "firstBookingDate": "2024-11-01",
    "lastBookingDate": "2025-10-01",
    "daysBetweenBookings": 30      // Every ~30 days
  },
  "billy": {
    "invoicedPrice": 3490.00,
    "state": "paid",
    "isPaid": true
  },
  "calendar": {
    "startTime": "2025-11-15T09:00:00Z", // Next scheduled
    "duration": 120,
    "numberOfPeople": 1
  }
}
```

---

## 📋 Complete Workflow

```
┌─────────────────────────────────────────┐
│ 1. Raw Collection                       │
│    Gmail: 662 threads                   │
│    Calendar: 210 events                 │
│    Billy: 140 invoices                  │
│    = ~800 raw lead objects              │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 2. Link & Merge                         │
│    • Generate customer keys             │
│    • Group by email/phone/name          │
│    • Link Gmail ↔ Calendar ↔ Billy      │
│    = ~350 unique customers              │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 3. Merge Duplicates                     │
│    • Keep most recent data              │
│    • Aggregate customer metrics         │
│    • Track repeat customers             │
│    = 350 merged leads                   │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 4. Determine Status                     │
│    • Auto-classify lead status          │
│    • Identify active recurring          │
│    • Mark dead/no response              │
│    = 350 leads with status              │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 5. Filter (Production)                  │
│    • Remove spam: -50                   │
│    • Remove dead: -80                   │
│    • Keep no_response: +60              │
│    = ~270 production leads ✅           │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 6. Output: complete-leads-v4.3.json     │
│    • 270 deduplicated leads             │
│    • 10 active recurring customers      │
│    • 45 won deals (paid)                │
│    • 60 opportunities (no response)     │
│    • Full 360° data per customer        │
└─────────────────────────────────────────┘
```

---

## ✅ Benefits

### 1. **Clean Data**
- Én lead per kunde (no duplicates)
- Spam og noise filtreret væk
- Dead leads removed (eller markeret)

### 2. **Accurate Metrics**
- Lifetime value baseret på **alle** invoices
- Total bookings = **alle** calendar events
- Repeat customer tracking
- Avg days between bookings

### 3. **Correct Pipeline Stages**
```
ACTIVE_RECURRING: Fast rengøring customers
PAID: Completed one-time jobs
SCHEDULED: Confirmed future bookings
NO_RESPONSE: Follow-up opportunities
DEAD: Archive/ignore
```

### 4. **Smart Filtering**
- Production: Clean, actionable leads only
- Analysis: Full data for insights
- Custom: Filter by any criteria

---

## 🎯 Use Cases

### Sales Dashboard
```typescript
const activeOpportunities = filterLeads(leads, {
  includeSpam: false,
  includeDead: false,
  includeNoResponse: true, // Follow-up targets
  requiredFields: ['gmail'],
});
// → Show leads that need action
```

### Financial Report
```typescript
const wonDeals = filterLeads(leads, {
  includeSpam: false,
  includeDead: false,
  includeNoResponse: false,
  requiredFields: ['billy'],
});
// → Calculate revenue, profit, margins
```

### Customer Retention
```typescript
const recurring = leads.filter(l => 
  l.pipeline.status === 'active_recurring'
);
// → Track fast rengøring customers
```

---

## 📁 Files

- `v4_3-config.ts` — Status enums + detection logic
- `v4_3-deduplication.ts` — Merge + filter functions
- `v4_3-types.ts` — Interface with pipeline.status field
- `V4_3_DEDUPLICATION_STRATEGY.md` — This document

---

**Result**: Ét clean, deduplicated lead per customer med korrekt status og fuld customer history.
