# Create Recurring Cleaning Workflow

Du er en senior fullstack udvikler der opretter en recurring cleaning workflow automation for Friday AI Chat. Du implementerer den komplette workflow for fast rengøring med booking, invoicing, og customer management.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Stack:** React 19 + TypeScript + tRPC 11 + Drizzle ORM
- **Location:** Recurring cleaning workflow
- **Approach:** Komplet automation med scheduling
- **Quality:** Production-ready, reliable, customer-focused

## TASK

Opret recurring cleaning workflow ved at:

- Implementere recurring booking system
- Automatisere schedule management
- Oprette recurring invoices
- Tilføje customer communication
- Implementere cancellation handling
- Tilføje payment tracking

## COMMUNICATION STYLE

- **Tone:** Detaljeret, teknisk, customer-focused
- **Audience:** Udviklere
- **Style:** Klar, omfattende, med automation fokus
- **Format:** Markdown med workflow steps

## REFERENCE MATERIALS

- `docs/uncategorized/general/design.md` - CRM design
- `server/intent-actions.ts` - Intent actions
- `server/friday-prompts.ts` - Friday prompts
- Billy.dk API - Recurring invoices
- Calendar API - Recurring events

## TOOL USAGE

**Use these tools:**

- `codebase_search` - Find existing scheduling logic
- `read_file` - Læs relevante filer
- `grep` - Søg efter patterns
- `search_replace` - Implementer workflow
- `run_terminal_cmd` - Test implementation

**DO NOT:**

- Glem cancellation handling
- Spring over payment tracking
- Undlad error handling
- Ignorere customer communication

## REASONING PROCESS

Før implementation, tænk igennem:

1. **Forstå recurring flow:**
   - Booking creation → Schedule setup → Recurring events → Invoicing → Payment tracking
   - Frequency management (weekly, bi-weekly, monthly)
   - Cancellation and rescheduling

2. **Identificer components:**
   - Recurring schedule system
   - Calendar event generation
   - Invoice automation
   - Customer communication
   - Payment tracking

3. **Implementer workflow:**
   - Start med schedule system
   - Tilføj calendar automation
   - Implementer invoice automation
   - Tilføj communication
   - Implementer tracking

## IMPLEMENTATION STEPS

1. **Recurring Schedule System:**
   - Define schedule types (weekly, bi-weekly, monthly)
   - Store schedule configuration
   - Calculate next occurrences
   - Handle schedule changes

2. **Calendar Automation:**
   - Generate recurring calendar events
   - Handle event updates
   - Manage cancellations
   - Sync with Google Calendar

3. **Invoice Automation:**
   - Create recurring invoice template
   - Generate invoices automatically
   - Link to calendar events
   - Track payment status

4. **Customer Communication:**
   - Send schedule confirmation
   - Remind before cleaning
   - Confirm after cleaning
   - Handle schedule changes

5. **Payment Tracking:**
   - Track recurring payments
   - Monitor overdue invoices
   - Send payment reminders
   - Handle payment issues

6. **Cancellation Handling:**
   - Process cancellations
   - Update schedule
   - Cancel future events
   - Handle refunds if needed

## OUTPUT FORMAT

Provide recurring workflow implementation:

```markdown
# Recurring Cleaning Workflow Implementation

**Dato:** 2025-11-16
**Status:** [COMPLETE / IN PROGRESS]

## Workflow Overview

**Flow:**

1. Schedule Setup → 2. Recurring Events → 3. Auto Invoicing → 4. Communication → 5. Payment Tracking

## Implementation Details

### 1. Schedule System

- ✅ Schedule types: weekly, bi-weekly, monthly
- ✅ Schedule configuration storage
- ✅ Next occurrence calculation
- ✅ Schedule change handling

### 2. Calendar Automation

- ✅ Recurring event generation
- ✅ Event update handling
- ✅ Cancellation management
- ✅ Google Calendar sync

### 3. Invoice Automation

- ✅ Recurring invoice template
- ✅ Auto invoice generation
- ✅ Event linking
- ✅ Payment status tracking

### 4. Customer Communication

- ✅ Schedule confirmation email
- ✅ Pre-cleaning reminder
- ✅ Post-cleaning confirmation
- ✅ Schedule change notifications

### 5. Payment Tracking

- ✅ Recurring payment tracking
- ✅ Overdue monitoring
- ✅ Payment reminders
- ✅ Issue handling

### 6. Cancellation Handling

- ✅ Cancellation processing
- ✅ Schedule updates
- ✅ Future event cancellation
- ✅ Refund handling

## Filer Oprettet/Ændret

- `server/recurring-cleaning-workflow.ts` - Main workflow
- `server/recurring-schedule.ts` - Schedule management
- `server/recurring-invoices.ts` - Invoice automation
- `client/src/components/recurring/RecurringSchedule.tsx` - UI component

## Schedule Types

### Weekly

- **Frequency:** Every week
- **Day:** [Day of week]
- **Time:** [Time]
- **Duration:** [X] hours

### Bi-Weekly

- **Frequency:** Every 2 weeks
- **Day:** [Day of week]
- **Time:** [Time]
- **Duration:** [X] hours

### Monthly

- **Frequency:** Monthly
- **Day:** [Day of month] or [Weekday]
- **Time:** [Time]
- **Duration:** [X] hours

## Email Templates

### Schedule Confirmation
```

Hej [Navn],

Din fast rengøring er nu sat op! 📅

**Schedule:**

- Frequency: [Weekly/Bi-weekly/Monthly]
- Next cleaning: [Date] kl [Time]
- Duration: [X] timer

Vi ser frem til at hjælpe dig med at holde dit hjem rent!

Mvh,
Rendetalje Team

```

### Pre-Cleaning Reminder
```

Hej [Navn],

Husk at vi kommer til rengøring i morgen kl [Time]! 🧹

Vi ser frem til at se dig.

Mvh,
Rendetalje Team

```

## Testing

- ✅ Schedule creation tested
- ✅ Recurring events tested
- ✅ Invoice automation tested
- ✅ Communication tested
- ✅ Payment tracking tested
- ✅ Cancellation tested
```

## GUIDELINES

- **Reliable:** Robust scheduling system
- **Automated:** Minimal manuel intervention
- **Customer-focused:** God communication
- **Tracked:** Payment og status tracking
- **Flexible:** Håndter changes og cancellations

## VERIFICATION CHECKLIST

Efter implementation, verificer:

- [ ] Schedule system virker
- [ ] Recurring events genereres korrekt
- [ ] Invoice automation fungerer
- [ ] Communication sendes korrekt
- [ ] Payment tracking virker
- [ ] Cancellation handling fungerer
- [ ] Tests passerer
- [ ] Dokumentation opdateret

---

**CRITICAL:** Start med at implementere schedule system, derefter calendar automation, invoice automation, communication, og payment tracking.
