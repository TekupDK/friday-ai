# V4.2 Enrichment Specification

## Overview

V4.2 adds **actual historical data** to V4.1 leads by integrating three key data sources:

1. **Billy Invoices** - Actual hours, prices, and m² from issued invoices
2. **Calendar History** - Booked durations and team composition
3. **Email Confirmations** - Actual vs estimated time and customer feedback

This enables accurate performance tracking and better quote estimation.

---

## Data Sources

### 1. Billy Invoices (Most Precise)

**What we extract:**

- Actual hours worked (from line item quantity)
- Actual price (from invoice amount)
- Actual m² (from invoice description parsing)
- Service type (from product/description)
- Invoice date and status

**Filtering:**

- Only approved, sent, or paid invoices (exclude drafts)
- Match by customer email

**Example:**

```json
{
  "contactEmail": "lars.joenstrup@live.dk",
  "invoiceNo": "INV-2025-001",
  "state": "paid",
  "actualHours": 3.5,
  "actualPrice": 1221.5,
  "actualM2": 110,
  "serviceType": "REN-001",
  "invoiceDate": "2025-10-28"
}
```

**Lead enrichment:**

```json
{
  "actuals": {
    "invoices": [{ ...invoice data... }],
    "summary": {
      "invoicedHours": 3.5,
      "invoicedPrice": 1221.5,
      "invoicedM2": 110,
      "invoiceCount": 1
    }
  }
}
```

---

### 2. Calendar History

**What we extract:**

- Booked duration (end time - start time in minutes)
- Number of attendees/resources
- Calculated work hours (duration × attendees)
- Booking date and title

**Calculation:**

```
Work Hours = (Duration in minutes / 60) × Number of Attendees
```

Example: 2-hour booking with 2 people = 4 work hours

**Example:**

```json
{
  "email": "lars.joenstrup@live.dk",
  "date": "2025-10-31",
  "durationMinutes": 120,
  "attendees": 2,
  "title": "Privatrengøring Park Alle 11"
}
```

**Lead enrichment:**

```json
{
  "actuals": {
    "calendarBookings": [{ ...booking data... }],
    "summary": {
      "bookedDurationHours": 2,
      "totalWorkHours": 4,
      "avgAttendees": 2
    }
  }
}
```

---

### 3. Email Confirmations

**What we extract:**

- Completion emails ("Opgaven er udført")
- Actual hours worked
- Estimated hours (for comparison)
- Customer feedback on timing
- Completion date

**Types:**

- `completion` - Job done, actual vs estimated time
- `feedback` - Customer feedback on timing accuracy
- `time_report` - Detailed time tracking

**Example:**

```json
{
  "email": "lars.joenstrup@live.dk",
  "date": "2025-10-31",
  "type": "completion",
  "actualHours": 3.5,
  "estimatedHours": 3.5,
  "feedback": "Opgaven er udført. Alt var som forventet."
}
```

**Lead enrichment:**

```json
{
  "actuals": {
    "emailConfirmations": [{ ...confirmation data... }],
    "summary": {
      "avgActualHours": 3.5,
      "avgEstimatedHours": 3.5,
      "timeAccuracy": 1.0,
      "completionCount": 1
    }
  }
}
```

---

## Lead Enrichment Structure

Each lead in V4.2 includes an `actuals` object:

```typescript
interface LeadActuals {
  invoices: BillyInvoiceData[];
  calendarBookings: CalendarBooking[];
  emailConfirmations: EmailConfirmation[];
  summary: {
    // From invoices
    invoicedHours?: number;
    invoicedPrice?: number;
    invoicedM2?: number;
    invoiceCount?: number;

    // From calendar
    bookedDurationHours?: number;
    totalWorkHours?: number;
    avgAttendees?: number;

    // From emails
    avgActualHours?: number;
    avgEstimatedHours?: number;
    timeAccuracy?: number; // actual / estimated
    completionCount?: number;
  };
}
```

---

## Matching Strategy

### Email Matching (Primary)

- Normalize email addresses (lowercase, trim)
- Exact match required
- Highest confidence

### Phone Matching (Secondary)

- Remove non-digits
- Exact match on normalized phone
- Used if email not available

### Name + Date Matching (Tertiary)

- Fuzzy name similarity (>50% threshold)
- Date proximity bonus (within 7 days)
- Lower confidence, used as fallback

---

## Data Quality Metrics

### V4.2 Coverage (with mock data)

| Metric                | Count | % of Total |
| --------------------- | ----- | ---------- |
| Total Leads           | 662   | 100%       |
| Enriched with Actuals | 2     | 0.3%       |
| Invoice Matches       | 2     | 0.3%       |
| Calendar Matches      | 2     | 0.3%       |
| Email Matches         | 2     | 0.3%       |

**Note:** Mock data used for demonstration. Real data will come from:

- Billy API (getInvoices, getInvoice)
- Google Calendar API (listEvents)
- Gmail API (searchThreads with "Opgaven er udført" pattern)

---

## Integration Points

### Billy API Integration

```typescript
// Get all invoices
const invoices = await getInvoices();

// Filter by state and customer
const customerInvoices = invoices.filter(
  inv =>
    ["approved", "sent", "paid"].includes(inv.state) &&
    inv.contactId === customerId
);

// Extract line items
const hours = invoice.lines.reduce((sum, line) => sum + line.quantity, 0);
const price = invoice.grossAmount;
```

### Google Calendar API Integration

```typescript
// Get calendar events
const events = await listCalendarEvents({
  timeMin: "2025-07-01T00:00:00Z",
  timeMax: "2025-12-31T23:59:59Z",
});

// Calculate work hours
const durationMs =
  new Date(event.end).getTime() - new Date(event.start).getTime();
const durationHours = durationMs / (1000 * 60 * 60);
const workHours = durationHours * (event.attendees?.length || 1);
```

### Gmail API Integration

```typescript
// Search for completion emails
const threads = await searchGmailThreads(
  'subject:"Opgaven er udført" OR subject:"Job completed"'
);

// Parse actual hours from email body
const hourMatch = emailBody.match(/(\d+(?:\.\d+)?)\s*(?:timer|hours?)/i);
const actualHours = hourMatch ? parseFloat(hourMatch[1]) : null;
```

---

## Usage in Quote Estimation

V4.2 actuals improve the quote estimation engine:

### Hierarchy (Updated)

1. **Actual invoiced hours** (highest confidence)
2. **Average actual hours from completions** (high confidence)
3. **Estimated time from lead** (medium confidence)
4. **m² × coefficient** (lower confidence)
5. **Service type default** (fallback)

### Example

```typescript
function estimateHours(lead: Lead): number {
  // Use actual invoiced hours if available
  if (lead.actuals?.summary?.invoicedHours) {
    return lead.actuals.summary.invoicedHours;
  }

  // Use average actual hours from completions
  if (lead.actuals?.summary?.avgActualHours) {
    return lead.actuals.summary.avgActualHours;
  }

  // Fall back to estimated time
  if (lead.timeEstimate?.estimatedHours) {
    return lead.timeEstimate.estimatedHours;
  }

  // Use m² rule
  if (lead.propertySize && lead.serviceType) {
    const m2 = parseInt(lead.propertySize);
    const coeff = SERVICE_COEFFICIENTS[lead.serviceType] || 0.01;
    return m2 * coeff;
  }

  // Default
  return 3; // 3 hours default
}
```

---

## Time Accuracy Tracking

Track how accurate estimates are:

```typescript
interface TimeAccuracy {
  lead: string;
  estimatedHours: number;
  actualHours: number;
  accuracy: number; // actual / estimated
  variance: number; // actual - estimated
  feedback: string;
}

// Example
{
  lead: "Lars Dollerup",
  estimatedHours: 3.5,
  actualHours: 3.5,
  accuracy: 1.0, // 100% accurate
  variance: 0,
  feedback: "Alt var som forventet"
}
```

---

## Next Steps

### Phase 1: Real Data Integration

- [ ] Connect to Billy API (getInvoices with state filter)
- [ ] Parse invoice line items for hours and m²
- [ ] Extract service type from product/description

### Phase 2: Calendar Integration

- [ ] Fetch calendar events from Google Calendar API
- [ ] Parse attendee count from event
- [ ] Calculate work hours (duration × attendees)

### Phase 3: Email Integration

- [ ] Search Gmail for completion patterns
- [ ] Extract actual hours from email body
- [ ] Parse customer feedback

### Phase 4: Analytics & Reporting

- [ ] Time accuracy dashboard
- [ ] Service type performance metrics
- [ ] Lead source ROI analysis
- [ ] Quote accuracy improvements

### Phase 5: V5 Rebuild

- [ ] Rebuild customer cards with actual data
- [ ] Improve quote engine with time accuracy insights
- [ ] Add performance metrics to UI

---

## Files

- `enrich-v4_2-with-actuals.ts` - V4.2 enrichment script
- `complete-leads-v4.2.json` - V4.2 dataset (with mock data)
- `V4_2_ENRICHMENT_SPEC.md` - This specification

---

## Example Lead (Enriched)

```json
{
  "id": "GMAIL_19a1108ef71817b9",
  "name": "Lars Dollerup",
  "email": "lars.joenstrup@live.dk",
  "phone": "40456319",
  "address": "Park Alle 11, 6. Tv, 8000 Aarhus C",
  "serviceType": "REN-001",
  "propertySize": "110 m²",
  "timeEstimate": {
    "estimatedHours": 3.5
  },
  "actuals": {
    "invoices": [
      {
        "invoiceNo": "INV-2025-001",
        "state": "paid",
        "actualHours": 3.5,
        "actualPrice": 1221.5,
        "actualM2": 110,
        "invoiceDate": "2025-10-28"
      }
    ],
    "calendarBookings": [
      {
        "date": "2025-10-31",
        "durationMinutes": 120,
        "attendees": 2,
        "title": "Privatrengøring Park Alle 11"
      }
    ],
    "emailConfirmations": [
      {
        "date": "2025-10-31",
        "type": "completion",
        "actualHours": 3.5,
        "estimatedHours": 3.5,
        "feedback": "Opgaven er udført. Alt var som forventet."
      }
    ],
    "summary": {
      "invoicedHours": 3.5,
      "invoicedPrice": 1221.5,
      "invoicedM2": 110,
      "bookedDurationHours": 2,
      "totalWorkHours": 4,
      "avgAttendees": 2,
      "avgActualHours": 3.5,
      "avgEstimatedHours": 3.5,
      "timeAccuracy": 1.0,
      "completionCount": 1
    }
  }
}
```
