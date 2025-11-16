# Shortwave-Inspired Smart Workspace

## Core Concept: Context-Aware Right Panel

Baseret på Shortwave.ai workflow - højre panel skal være **ultra-intelligent**og**context-aware**.

## Architecture

```text
┌──────────┬─────────────────────┬──────────────────┐
│    AI    │   Email Center      │  Smart Workspace │
│   20%    │       60%           │       20%        │
│          │                     │                  │
│  Friday  │  Email List (kun)   │  Context Analyzer│
│  Chat    │                     │  Auto-detects:   │
│          │  Selected email ────┼─→ • Lead        │
│          │                     │   • Booking      │
│          │  Mini-tabs:         │   • Invoice      │
│          │  [📄][📅][👥][✅]  │   • Customer     │
└──────────┴─────────────────────┴──────────────────┘

```

## 5 Context States

### 1. LEAD EMAIL → Lead Analyzer

- Auto-detect: m², adresse, ønsket dato
- AI estimat: pris, tid, team
- Kalender-check (real-time)
- Lignende opgaver
- Quick actions: Send tilbud, Book, Mark lost

### 2. BOOKING EMAIL → Booking Manager

- Booking detaljer
- Team assignment
- Profit calculation
- Timeline & reminders
- Quick actions: Update, Invoice, Reminder

### 3. INVOICE EMAIL → Invoice Tracker

- Payment status
- Risk analysis
- Email historik
- Recommendations
- Quick actions: Reminder, Call, Discount

### 4. CUSTOMER EMAIL → Customer Profile

- Booking historik
- Lifetime value
- Preferences & notes
- Trends
- Quick actions: Book next, Thank you

### 5. NO EMAIL → Business Dashboard

- Today's bookings
- Urgent actions
- Week/month stats
- Quick stats
- Quick actions: Follow up, Chase payments

## Mini-Tabs (Bottom)

Collapsed: `[📄] [📅] [👥] [✅]`

Expanded (drawer/modal):

- 📄 Fakturaer: Ubetalte, betalt, stats
- 📅 Kalender: I dag, i morgen, uge
- 👥 Leads: Needs reply, venter, i kalender
- ✅ Opgaver: Urgent, today, week

## Time Savings

- Lead → Booking: 60 min → 14 min (76% reduction)
- Per month (50 leads): 38 timer spart!

## Implementation

1. Email Center cleanup (kun EmailTab)
1. WorkspacePanel med context detection
1. Mini-tabs med drawer system
1. AI integration
1. Automation
