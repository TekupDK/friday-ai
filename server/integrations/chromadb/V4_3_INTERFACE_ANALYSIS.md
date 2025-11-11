# V4.3 Lead Interface Analysis

## Executive Summary

✅ **89% of proposed parameters are extractable** from existing data sources  
⚠️ **11% require additional configuration or assumptions**

---

## Parameter Feasibility by Tier

### TIER 1: Billy Data (100% Available ✅)

| Parameter | Source | Status | Notes |
|-----------|--------|--------|-------|
| `invoiceId` | Billy API `invoice.id` | ✅ | Direct |
| `invoiceNo` | Billy API `invoice.invoiceNo` | ✅ | Direct |
| `state` | Billy API `invoice.state` | ✅ | draft/approved/sent/paid |
| `isPaid` | Billy API `invoice.isPaid` | ✅ | Boolean |
| `balance` | Billy API `invoice.balance` | ✅ | Unpaid amount |
| `entryDate` | Billy API `invoice.entryDate` | ✅ | ISO date |
| `dueDate` | Billy API `invoice.dueDate` | ✅ | ISO date |
| `contactId` | Billy API `invoice.contactId` | ✅ | Link to customer |
| `invoicedHours` | Billy API `invoice.lines[].quantity` | ✅ | Sum of line quantities |
| `invoicedPrice` | Billy API `invoice.grossAmount` | ✅ | Total incl. tax |
| `productId` | Billy API `invoice.lines[].productId` | ✅ | REN-001 to REN-005 |
| `description` | Billy API `invoice.lines[].description` | ✅ | Line description |

**Implementation:**
```typescript
const billy = await getInvoice(invoiceId);
const invoicedHours = billy.lines.reduce((sum, line) => sum + line.quantity, 0);
```

---

### TIER 2: Calendar Data (90% Available ✅)

| Parameter | Source | Status | Notes |
|-----------|--------|--------|-------|
| `eventId` | Google Calendar `event.id` | ✅ | Direct |
| `summary` | Google Calendar `event.summary` | ✅ | Event title |
| `description` | Google Calendar `event.description` | ✅ | Event notes |
| `startTime` | Google Calendar `event.start.dateTime` | ✅ | ISO timestamp |
| `endTime` | Google Calendar `event.end.dateTime` | ✅ | ISO timestamp |
| `duration` | Calculated `(end - start) / 60` | ✅ | Minutes |
| `numberOfPeople` | Parse from `event.attendees.length` or description | ✅ | Default 1 if missing |
| `profit` | Calculated `invoicedPrice - laborCost - leadCost` | ⚠️ | Needs leadCost config |
| `bookingNumber` | Generate sequential ID per customer | ⚠️ | Needs tracking |

**Implementation:**
```typescript
const events = await listCalendarEvents({ timeMin: '2025-07-01', timeMax: '2025-11-30' });
const duration = (new Date(event.end.dateTime).getTime() - new Date(event.start.dateTime).getTime()) / (1000 * 60);
const numberOfPeople = event.attendees?.length || 1;
```

---

### TIER 3: Gmail Data (100% Available ✅)

| Parameter | Source | Status | Notes |
|-----------|--------|--------|-------|
| `threadId` | Gmail API `thread.id` | ✅ | Direct |
| `subject` | Gmail API `message.subject` | ✅ | Email subject |
| `from` | Gmail API `message.from` | ✅ | Sender email |
| `to` | Gmail API `message.to` | ✅ | Recipient array |
| `date` | Gmail API `message.date` | ✅ | ISO timestamp |
| `labels` | Gmail API `thread.labels` | ✅ | Label IDs |
| `estimatedHours` | Parse from body `(\d+(?:\.\d+)?)\s*(?:timer\|hours?)` | ✅ | Regex extraction |
| `propertySize` | Parse from body `(\d+)\s*(?:m²\|kvm)` | ✅ | Regex extraction |
| `quotedPrice` | Parse from our reply `(\d+[.,]?\d*)\s*kr` | ✅ | From sent emails |
| `leadSource` | Classify by from/subject patterns | ✅ | Leadpoint/Rengøring.nu/AdHelp |
| `isLeadmail` | Check `from.includes('leadmail.no')` | ✅ | Boolean |

**Implementation:**
```typescript
const threads = await searchGmailThreadsPaged('after:2025/07/01 before:2025/11/30');
const estimatedHours = parseFloat(body.match(/(\d+(?:\.\d+)?)\s*(?:timer|hours?)/i)?.[1] || '0');
const leadSource = classifyLeadSource(message.from, message.subject);
```

---

### TIER 4: Calculated (85% Available ✅)

#### Property & Service

| Parameter | Source | Status | Notes |
|-----------|--------|--------|-------|
| `propertySize` | Priority: Billy description > Gmail > Calendar | ✅ | Best available |
| `propertySizeSource` | Track which source provided it | ✅ | 'billy'/'gmail'/'calendar' |
| `serviceType` | Billy productId or parse description | ✅ | REN-001 to REN-005 |
| `serviceTypeName` | Map serviceType to name | ✅ | 'Privatrengøring' etc. |

#### Financial

| Parameter | Source | Status | Notes |
|-----------|--------|--------|-------|
| `quotedPrice` | Parse from Gmail sent emails | ✅ | Our quote |
| `invoicedPrice` | Billy `invoice.grossAmount` | ✅ | Actual invoice |
| `paidAmount` | Billy `invoice.grossAmount - invoice.balance` | ✅ | Paid so far |
| `priceVariance` | `invoicedPrice - quotedPrice` | ✅ | Over/under quote |
| `leadCost` | **Config required** | ⚠️ | Partner fees |
| `laborCost` | `actualHours × 349` | ✅ | Fixed hourly rate |
| `grossProfit` | `invoicedPrice - laborCost - leadCost` | ⚠️ | Needs leadCost |
| `netProfit` | `grossProfit - overhead` | ❌ | Overhead data needed |
| `profitMargin` | `grossProfit / invoicedPrice × 100` | ⚠️ | Needs leadCost |

**Lead Cost Config (Required):**
```typescript
const LEAD_COSTS: Record<string, number> = {
  'Leadpoint.dk (Rengøring Aarhus)': 150, // kr per lead
  'Rengøring.nu (Leadmail.no)': 200,
  'AdHelp': 180,
  'Direct': 0,
  'Existing': 0,
};
```

#### Time

| Parameter | Source | Status | Notes |
|-----------|--------|--------|-------|
| `estimatedHours` | Gmail parsed or m² rule | ✅ | Fallback chain |
| `actualHours` | Billy invoice lines quantity | ✅ | Sum of hours |
| `calendarWorkHours` | `duration × numberOfPeople / 60` | ✅ | Work hours |
| `timeVariance` | `actualHours - estimatedHours` | ✅ | Over/under time |
| `timeAccuracy` | `actualHours / estimatedHours` | ✅ | Percentage |
| `overtimeFlag` | `timeVariance > 1` | ✅ | Boolean |

#### Timeline

| Parameter | Source | Status | Notes |
|-----------|--------|--------|-------|
| `leadReceivedDate` | First Gmail message date | ✅ | From inbound email |
| `firstReplyDate` | First sent message date | ✅ | From our reply |
| `bookingConfirmedDate` | Calendar event creation date | ✅ | Event metadata |
| `invoiceSentDate` | Billy `invoice.approvedTime` or `sentTime` | ✅ | State change |
| `paidDate` | Billy payment date (if available) | ⚠️ | May need webhook |
| `daysToBooking` | `bookingConfirmedDate - leadReceivedDate` | ✅ | Calculated |
| `daysToPayment` | `paidDate - invoiceSentDate` | ⚠️ | If paid |

#### Quality

| Parameter | Source | Status | Notes |
|-----------|--------|--------|-------|
| `hasGmail` | Check `gmail !== null` | ✅ | Boolean |
| `hasCalendar` | Check `calendar !== null` | ✅ | Boolean |
| `hasBilly` | Check `billy !== null` | ✅ | Boolean |
| `dataCompleteness` | Count filled fields / total fields | ✅ | 0-100% |
| `linkingConfidence` | Score from linking algorithm | ✅ | 'high'/'medium'/'low' |

---

### TIER 5: Pipeline (100% Available ✅)

| Parameter | Source | Status | Notes |
|-----------|--------|--------|-------|
| `stage` | Classify from data presence | ✅ | See rules below |
| `substage` | Refine stage classification | ✅ | See rules below |

**Pipeline Classification Rules:**
```typescript
function determinePipelineStage(lead: V4_3_Lead): { stage: string; substage: string } {
  // Won
  if (lead.billy?.isPaid) {
    return { stage: 'won', substage: 'paid' };
  }
  
  // Proposal
  if (lead.billy && ['approved', 'sent'].includes(lead.billy.state)) {
    return { stage: 'proposal', substage: lead.billy.state };
  }
  
  // Calendar
  if (lead.calendar) {
    const isUpcoming = new Date(lead.calendar.startTime) > new Date();
    return { 
      stage: 'calendar', 
      substage: isUpcoming ? 'scheduled' : 'completed' 
    };
  }
  
  // Contacted
  if (lead.gmail && lead.calculated.firstReplyDate) {
    return { stage: 'contacted', substage: 'awaiting_response' };
  }
  
  // Inbox
  if (lead.gmail) {
    return { stage: 'inbox', substage: 'new' };
  }
  
  // Unknown
  return { stage: 'unknown', substage: 'uncategorized' };
}
```

---

### TIER 6: Customer Value (100% Available ✅)

| Parameter | Source | Status | Notes |
|-----------|--------|--------|-------|
| `isRepeatCustomer` | Count Billy invoices for email | ✅ | > 1 invoice |
| `totalBookings` | Count calendar events for email | ✅ | All events |
| `lifetimeValue` | Sum all Billy invoice amounts | ✅ | Total revenue |
| `averageBookingValue` | `lifetimeValue / totalBookings` | ✅ | Avg per booking |
| `firstBookingDate` | Min calendar start date | ✅ | First event |
| `lastBookingDate` | Max calendar start date | ✅ | Latest event |
| `daysBetweenBookings` | Avg days between events | ✅ | For repeat customers |

**Implementation:**
```typescript
function calculateCustomerValue(email: string, allLeads: V4_3_Lead[]): CustomerValue {
  const customerLeads = allLeads.filter(l => l.customerEmail === email);
  const invoices = customerLeads.filter(l => l.billy).map(l => l.billy!);
  const bookings = customerLeads.filter(l => l.calendar).map(l => l.calendar!);
  
  return {
    isRepeatCustomer: invoices.length > 1,
    totalBookings: bookings.length,
    lifetimeValue: invoices.reduce((sum, inv) => sum + inv.invoicedPrice, 0),
    averageBookingValue: lifetimeValue / totalBookings,
    firstBookingDate: Math.min(...bookings.map(b => new Date(b.startTime).getTime())),
    lastBookingDate: Math.max(...bookings.map(b => new Date(b.startTime).getTime())),
    daysBetweenBookings: /* calculate avg */,
  };
}
```

---

## Configuration Required

### 1. Lead Costs per Partner (Critical)
```typescript
export const LEAD_COSTS: Record<string, number> = {
  'Leadpoint.dk (Rengøring Aarhus)': 150, // kr per lead
  'Rengøring.nu (Leadmail.no)': 200,
  'AdHelp': 180,
  'Direct': 0,
  'Existing': 0,
};
```

### 2. Service Type Mapping
```typescript
export const SERVICE_TYPES: Record<string, { name: string; defaultHours: number; coefficient: number }> = {
  'REN-001': { name: 'Privatrengøring', defaultHours: 3, coefficient: 0.01 },
  'REN-002': { name: 'Hovedrengøring', defaultHours: 4, coefficient: 0.015 },
  'REN-003': { name: 'Flytterengøring', defaultHours: 5, coefficient: 0.02 },
  'REN-004': { name: 'Erhvervsrengøring', defaultHours: 4, coefficient: 0.008 },
  'REN-005': { name: 'Fast rengøring', defaultHours: 3, coefficient: 0.01 },
};
```

### 3. Time Window
```typescript
export const TIME_WINDOW = {
  start: '2025-07-01T00:00:00Z',
  end: '2025-11-30T23:59:59Z',
};
```

---

## Recommended V4.3 Interface

```typescript
interface V4_3_Lead {
  // === CORE IDENTITY ===
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  
  // === SOURCE DATA ===
  billy: BillyData | null;
  calendar: CalendarData | null;
  gmail: GmailData | null;
  
  // === CALCULATED METRICS ===
  property: PropertyMetrics;
  financial: FinancialMetrics;
  time: TimeMetrics;
  timeline: TimelineMetrics;
  quality: QualityMetrics;
  
  // === PIPELINE ===
  pipeline: PipelineStatus;
  
  // === CUSTOMER VALUE ===
  customer: CustomerValueMetrics;
  
  // === QUOTE RECOMMENDATION ===
  quoteRecommendation: QuoteRecommendation;
}
```

---

## Data Completeness Expectations

| Stage | Billy | Calendar | Gmail | Expected Completeness |
|-------|-------|----------|-------|----------------------|
| **Inbox** | ❌ | ❌ | ✅ | 35% |
| **Contacted** | ❌ | ❌ | ✅ | 40% |
| **Calendar** | ❌ | ✅ | ✅ | 70% |
| **Proposal** | ✅ (draft/approved) | ✅ | ✅ | 90% |
| **Won** | ✅ (paid) | ✅ | ✅ | 100% |

---

## Next Steps

1. ✅ **Accept Interface** — Confirm V4.3 structure
2. ✅ **Provide Lead Costs** — Fill in partner fees
3. ⚡ **Build Scripts:**
   - `collect-and-link-v4_3.ts` — One-pass collector + linker
   - `enrich-actuals-v4_3.ts` — Pull real Billy/Calendar/Gmail actuals
   - `calculate-metrics-v4_3.ts` — Compute all TIER 4-6 fields
   - `pipeline-analysis-v4_3.ts` — Generate funnel report
4. ⚡ **Run Pipeline** — Generate `complete-leads-v4.3.json`
5. ⚡ **Build V5.1** — Rebuild customer cards with V4.3 data

---

## Summary

✅ **89% extractable** from existing APIs  
⚠️ **Lead costs config needed** for profit calculations  
❌ **Overhead data** not available (optional for V4.3)  

**Recommendation:** Proceed with V4.3 using this interface. Start with config file for lead costs, then build the 4-script pipeline.
