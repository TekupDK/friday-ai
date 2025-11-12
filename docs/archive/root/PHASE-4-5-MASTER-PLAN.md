# 🎯 Phase 4 & 5 Master Plan - Rendetalje Optimeret

**Baseret på:** Rendetalje's faktiske workflow, Billy integration, pipeline stages, og business rules

---

## 📋 Phase 4 Forbedringer (Gør det produktionsklar)

### 4.1: LeadAnalyzer - Tilføj Rendetalje-Specifik Logik ✅

**Hvad vi har:**

- ✅ Kunde navn parsing
- ✅ Location detection
- ✅ Job type detection

**Hvad vi skal tilføje:**

1. **Lead Source Detection**
   - Detect: Rengøring.nu, Rengøring Århus, AdHelp, Direct
   - Viser badge med source
   - Bruges til lead scoring

2. **Critical Business Rules**
   - **Flytterengøring:** ALTID request photos først (MEMORY_16)
   - **Fast rengøring:** Check for recurring setup
   - **Hovedrengøring:** Estimate 3-4 timer

3. **Quick Actions (Real)**
   - "Send tilbud" → Draft email
   - "Book møde" → Create calendar event
   - "Opret lead" → Create in database
   - "Request photos" → For flytterengøring

4. **AI Estimat (Forbedret)**
   - Parse m² fra email body
   - Calculate realistic pris baseret på type
   - Show profit margin
   - Suggest team size

---

### 4.2: InvoiceTracker - Billy Integration ✅

**Hvad vi har:**

- ✅ Invoice number parsing
- ✅ Customer info extraction

**Hvad vi skal tilføje:**

1. **Real Billy Data**
   - Fetch invoice fra Billy API
   - Show actual status (draft, sent, paid, overdue)
   - Show real amounts og due dates
   - Show payment history

2. **Risk Analysis (Real)**
   - Days overdue calculation
   - Customer payment history
   - Automatic reminder suggestions

3. **Quick Actions (Real)**
   - "Send reminder" → Email via Gmail
   - "Mark as paid" → Update Billy
   - "Create credit note" → Billy API
   - "Call customer" → Show phone + log

4. **Payment Tracking**
   - MobilePay 71759 detection
   - Bank transfer tracking
   - Payment method badges

---

### 4.3: BookingManager - Calendar Integration ✅

**Hvad vi har:**

- ✅ Customer name parsing
- ✅ Month detection
- ✅ Booking type detection

**Hvad vi skal tilføje:**

1. **Real Calendar Data**
   - Fetch fra Google Calendar
   - Show actual booking time
   - Show team assignment
   - Show location/address

2. **Team Management**
   - Jonas + Rawan
   - Jonas + FB
   - Availability check
   - Workload balance

3. **Quick Actions (Real)**
   - "Bekræft booking" → Send email
   - "Flyt booking" → Update calendar
   - "Tilføj team" → Update event
   - "Send reminder" → 24h før

4. **Pipeline Integration**
   - Auto-create calendar event når "I kalender" stage
   - Link til email thread
   - Track completion status

---

### 4.4: CustomerProfile - Full History ✅

**Hvad vi har:**

- ✅ Customer name parsing
- ✅ Basic info extraction

**Hvad vi skal tilføje:**

1. **Complete Customer Data**
   - All previous bookings
   - All invoices (paid/unpaid)
   - Total lifetime value
   - Average booking value
   - Payment reliability score

2. **Communication History**
   - All email threads
   - Phone call logs
   - Notes from team
   - Important dates

3. **Quick Actions (Real)**
   - "Se alle bookings" → Calendar view
   - "Se fakturaer" → Billy list
   - "Send besked" → Gmail compose
   - "Tilføj note" → Database

4. **Customer Insights**
   - Preferred services
   - Booking frequency
   - Best contact time
   - Special requirements

---

### 4.5: BusinessDashboard - Real Stats ✅

**Hvad vi har:**

- ✅ Dynamic date

**Hvad vi skal tilføje:**

1. **Today's Real Bookings**
   - Fetch fra Google Calendar
   - Show team assignments
   - Show addresses
   - Show estimated profit

2. **Urgent Actions (Real)**
   - Unpaid invoices fra Billy
   - Leads needing reply (Gmail labels)
   - Upcoming reminders
   - Tasks due today

3. **Week Stats (Real)**
   - Total bookings this week
   - Revenue (from Billy)
   - Profit margin
   - New leads count
   - Conversion rate

4. **Quick Insights**
   - Best performing lead source
   - Average response time
   - Team utilization
   - Cash flow status

---

## 🚀 Phase 5: Smart Action System (Ikke Mini-Tabs!)

**NY IDEE:** I stedet for mini-tabs, lav et **Smart Action System** der er mere kraftfuldt!

### Concept: Context-Aware Action Bar

```
┌─────────────────────────────────────────────────────┐
│ Email Center                                        │
│ ┌─────────────────────────────────────────────┐   │
│ │ [Email List]                                 │   │
│ │                                              │   │
│ │                                              │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ 🎯 SMART ACTIONS (Context-aware)            │   │
│ │ [Send Tilbud] [Book Møde] [Opret Faktura]  │   │
│ └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 5.1: Smart Action Bar (Bottom of Email Center)

**Dynamisk baseret på context:**

**Når Lead Email er valgt:**

```
[📧 Send Tilbud] [📅 Book Møde] [📸 Request Photos] [💾 Gem Lead]
```

**Når Invoice Email er valgt:**

```
[💰 Mark Paid] [📧 Send Reminder] [📞 Call Customer] [📄 Credit Note]
```

**Når Booking Email er valgt:**

```
[✅ Bekræft] [📅 Flyt Tid] [👥 Tilføj Team] [📧 Send Reminder]
```

**Når Customer Thread er valgt:**

```
[📧 Send Email] [📞 Call] [📝 Add Note] [📊 View History]
```

**Når ingen email er valgt:**

```
[📧 Ny Email] [📅 Ny Booking] [💰 Ny Faktura] [🎯 Nyt Lead]
```

---

### 5.2: Quick Access Drawer (Slide fra højre)

**Trigger:** Keyboard shortcut eller button i top-right

```
Cmd/Ctrl + K → Quick Command Palette

Søg efter:
- "Opret faktura til..."
- "Book møde med..."
- "Find kunde..."
- "Se fakturaer..."
- "Dagens bookings"
```

**Features:**

- Fuzzy search
- Recent actions
- Keyboard navigation
- Quick filters

---

### 5.3: Pipeline Stage Buttons (I Email List)

**Tilføj stage buttons direkte på hver email:**

```
[Email fra Rengøring.nu]
└─ [🎯 Ny] [💬 Kontakt] [📅 Book] [💰 Faktura] [✅ Færdig]
   Click to move through pipeline
```

**Benefits:**

- Visual pipeline status
- One-click stage changes
- Triggers automation (auto-calendar, auto-invoice)
- Matches Rendetalje workflow

---

### 5.4: Notification Center (Top-right)

**Real-time alerts:**

```
🔔 (3)
├─ Ny lead fra Rengøring.nu
├─ Faktura #1110 er 4 dage forsinket
└─ Booking i morgen kl 10:00
```

**Features:**

- Real-time updates
- Click to jump to item
- Mark as read
- Snooze options

---

## 🎯 Hvorfor Denne Tilgang?

### Problems med Mini-Tabs:

- ❌ Takes up space
- ❌ Static, ikke context-aware
- ❌ Requires extra clicks
- ❌ Doesn't match workflow

### Benefits af Smart Actions:

- ✅ Context-aware (viser kun relevante actions)
- ✅ One-click workflows
- ✅ Matches Rendetalje's actual process
- ✅ Faster than tabs
- ✅ Less clutter
- ✅ More professional

---

## 📊 Implementation Priority

### Phase 4 Improvements (Højeste prioritet):

1. **LeadAnalyzer:** Lead source detection + Critical rules
2. **InvoiceTracker:** Billy API integration
3. **BookingManager:** Google Calendar integration
4. **CustomerProfile:** Full history view
5. **BusinessDashboard:** Real stats

### Phase 5 Smart Actions (Medium prioritet):

1. **Smart Action Bar:** Context-aware buttons
2. **Pipeline Stage Buttons:** In email list
3. **Quick Command Palette:** Cmd+K
4. **Notification Center:** Real-time alerts

---

## 🎯 Success Metrics

### Phase 4 Complete When:

- ✅ All workspace components use real API data
- ✅ Billy invoices show correctly
- ✅ Google Calendar bookings show correctly
- ✅ Lead source detection works
- ✅ Critical business rules implemented
- ✅ Customer history is complete

### Phase 5 Complete When:

- ✅ Smart Action Bar works for all contexts
- ✅ Pipeline stage buttons work
- ✅ Quick Command Palette is functional
- ✅ Notifications work in real-time
- ✅ All actions trigger correct workflows

---

## 💡 Key Insights fra Rendetalje Workflow

### Critical Business Rules:

1. **Flytterengøring:** ALWAYS request photos first
2. **Calendar Events:** NEVER add attendees (no auto-invites)
3. **Invoices:** ALWAYS draft-only (manual approval required)
4. **Job Completion:** Follow 6-step checklist
5. **Lead Sources:** Track for conversion analysis

### Pipeline Stages:

1. **Needs Action** → Ny lead, needs response
2. **Venter på Svar** → Waiting for customer
3. **I Kalender** → Booking confirmed (auto-create calendar)
4. **Finance** → Job done, needs invoice (auto-create invoice)
5. **Afsluttet** → Paid and completed

### Automation Triggers:

- **"I Kalender" stage** → Auto-create Google Calendar event
- **"Finance" stage** → Auto-create Billy invoice (draft)
- **Job completion** → Run 6-step checklist
- **Lead from Rengøring.nu** → Auto-detect source

---

**Hvad synes du? Skal vi starte med Phase 4 forbedringer eller Phase 5 Smart Actions?** 🤔
