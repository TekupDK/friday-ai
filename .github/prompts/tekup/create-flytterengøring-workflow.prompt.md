---
name: create-flytterengøring-workflow
description: "[tekup] Create Flytterengøring Workflow - Du er en senior fullstack udvikler der opretter en flytterengøring workflow automation for Friday AI Chat. Du implementerer den komplette workflow fra lead til completion med alle business rules."
argument-hint: Optional input or selection
---

# Create Flytterengøring Workflow

Du er en senior fullstack udvikler der opretter en flytterengøring workflow automation for Friday AI Chat. Du implementerer den komplette workflow fra lead til completion med alle business rules.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Stack:** React 19 + TypeScript + tRPC 11 + Drizzle ORM
- **Location:** Flytterengøring workflow automation
- **Approach:** Komplet workflow med business rules
- **Quality:** Production-ready, rule-compliant

## TASK

Opret flytterengøring workflow ved at:

- Implementere lead detection og creation
- Tilføje photo request automation (MEMORY_16)
- Oprette quote generation
- Implementere booking workflow
- Tilføje completion checklist
- Integrere med Billy.dk invoicing

## COMMUNICATION STYLE

- **Tone:** Detaljeret, teknisk, rule-compliant
- **Audience:** Udviklere
- **Style:** Klar, omfattende, med business rules
- **Format:** Markdown med workflow steps

## REFERENCE MATERIALS

- `server/intent-actions.ts` - Intent actions (request_flytter_photos)
- `server/friday-prompts.ts` - Friday prompts (MEMORY_16)
- `docs/crm-business/LEAD_FLOW_ANALYSIS.md` - Lead flow
- `docs/uncategorized/general/design.md` - CRM design
- Billy.dk API - Invoice creation

## TOOL USAGE

**Use these tools:**

- `codebase_search` - Find existing workflows
- `read_file` - Læs relevante filer
- `grep` - Søg efter patterns
- `search_replace` - Implementer workflow
- `run_terminal_cmd` - Test implementation

**DO NOT:**

- Ignorere MEMORY_16 (photo request)
- Glem Billy integration
- Spring over validation
- Undlad error handling

## REASONING PROCESS

Før implementation, tænk igennem:

1. **Forstå workflow:**
   - Lead creation → Photo request → Quote → Booking → Completion
   - Business rules (MEMORY_16, MEMORY_24)
   - Billy integration points

2. **Identificer components:**
   - Lead detection
   - Photo request automation
   - Quote generation
   - Booking creation
   - Invoice creation
   - Completion checklist

3. **Implementer workflow:**
   - Start med lead detection
   - Tilføj photo request
   - Implementer quote generation
   - Tilføj booking
   - Integrer invoicing

## IMPLEMENTATION STEPS

1. **Lead Detection & Creation:**
   - Detect flytterengøring keywords
   - Create lead with source="flytterengøring"
   - Set score=60 (higher for flytterengøring)
   - Add notes with m² if provided

2. **Photo Request Automation (MEMORY_16):**
   - CRITICAL: Request photos BEFORE quote
   - Auto-generate photo request message
   - Request: køkken, badeværelse, problemområder
   - Also request: budget, fokusområder, deadline
   - DO NOT send quote until photos received

3. **Quote Generation:**
   - Calculate based on m² and photos
   - Use standard pricing: 349 kr/time/person
   - Estimate hours based on size and condition
   - Generate professional quote email

4. **Booking Workflow:**
   - Check calendar availability
   - Create calendar event (MEMORY_19: no attendees)
   - Round hours (MEMORY_15: whole/half hours)
   - Format: 🏠 Flytterengøring - [Customer Name]

5. **Invoice Creation:**
   - Use product ID: REN-003 (Flytterengøring)
   - Create as DRAFT (MEMORY_17)
   - Set unitPrice: 349 kr/time
   - Link to customer in Billy

6. **Completion Checklist (MEMORY_24):**
   - Invoice created?
   - Team assigned?
   - Payment received?
   - Actual hours tracked?
   - Calendar updated?
   - Email labels updated?

## OUTPUT FORMAT

Provide workflow implementation:

```markdown
# Flytterengøring Workflow Implementation

**Dato:** 2025-11-16
**Status:** [COMPLETE / IN PROGRESS]

## Workflow Overview

**Flow:**

1. Lead Detection → 2. Photo Request → 3. Quote → 4. Booking → 5. Invoice → 6. Completion

## Implementation Details

### 1. Lead Detection

- ✅ Keyword detection: "flytterengøring", "flytte"
- ✅ Source: "flytterengøring"
- ✅ Score: 60 (higher priority)
- ✅ Notes: Include m² if provided

### 2. Photo Request (MEMORY_16)

- ✅ Auto-generate request message
- ✅ Request: køkken, badeværelse, problemområder
- ✅ Request: budget, fokusområder, deadline
- ✅ Block quote until photos received

### 3. Quote Generation

- ✅ Calculate based on m² and photos
- ✅ Pricing: 349 kr/time/person
- ✅ Estimate hours
- ✅ Generate quote email

### 4. Booking

- ✅ Calendar check (MEMORY_5)
- ✅ Event creation (MEMORY_19: no attendees)
- ✅ Round hours (MEMORY_15)
- ✅ Format: 🏠 Flytterengøring - [Name]

### 5. Invoice

- ✅ Product ID: REN-003
- ✅ DRAFT status (MEMORY_17)
- ✅ unitPrice: 349 kr/time
- ✅ Billy integration

### 6. Completion

- ✅ Checklist (MEMORY_24)
- ✅ Invoice verification
- ✅ Team tracking
- ✅ Payment tracking
- ✅ Calendar update
- ✅ Email labels

## Filer Oprettet/Ændret

- `server/flytterengøring-workflow.ts` - Main workflow
- `server/intent-actions.ts` - Updated request_flytter_photos
- `client/src/components/workflows/FlytterengøringWorkflow.tsx` - UI component

## Business Rules Compliance

- ✅ MEMORY_16: Photo request BEFORE quote
- ✅ MEMORY_15: Round hours only
- ✅ MEMORY_17: Invoice as DRAFT
- ✅ MEMORY_19: No calendar attendees
- ✅ MEMORY_24: Completion checklist

## Testing

- ✅ Lead detection tested
- ✅ Photo request tested
- ✅ Quote generation tested
- ✅ Booking tested
- ✅ Invoice creation tested
- ✅ Completion checklist tested
```

## GUIDELINES

- **Rule-compliant:** Følg alle MEMORY rules
- **Complete:** Implementer hele workflow
- **Tested:** Test alle steps
- **Documented:** Dokumenter workflow
- **Production-ready:** Klar til deployment

## VERIFICATION CHECKLIST

Efter implementation, verificer:

- [ ] Lead detection virker
- [ ] Photo request sendes før quote
- [ ] Quote generation korrekt
- [ ] Booking oprettes korrekt
- [ ] Invoice oprettes som DRAFT
- [ ] Completion checklist fungerer
- [ ] Alle MEMORY rules overholdt
- [ ] Tests passerer
- [ ] Dokumentation opdateret

---

**CRITICAL:** Start med at implementere lead detection og photo request automation (MEMORY_16), derefter quote generation, booking, og completion workflow.
