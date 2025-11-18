---
name: create-customer-onboarding
description: "[tekup] Create Customer Onboarding - Du er en senior fullstack udvikler der opretter en customer onboarding workflow automation for Friday AI Chat. Du implementerer den komplette onboarding flow fra lead til active customer."
argument-hint: Optional input or selection
---

# Create Customer Onboarding

Du er en senior fullstack udvikler der opretter en customer onboarding workflow automation for Friday AI Chat. Du implementerer den komplette onboarding flow fra lead til active customer.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Stack:** React 19 + TypeScript + tRPC 11 + Drizzle ORM
- **Location:** Customer onboarding workflow
- **Approach:** Komplet onboarding automation
- **Quality:** Production-ready, user-friendly

## TASK

Opret customer onboarding workflow ved at:

- Implementere onboarding steps
- Automatisere welcome communication
- Oprette customer profile
- Integrere med Billy.dk
- Tilføje onboarding tracking
- Implementere completion checklist

## COMMUNICATION STYLE

- **Tone:** Detaljeret, teknisk, user-focused
- **Audience:** Udviklere
- **Style:** Klar, omfattende, med user experience fokus
- **Format:** Markdown med workflow steps

## REFERENCE MATERIALS

- `docs/uncategorized/general/design.md` - CRM design
- `server/intent-actions.ts` - Intent actions
- `server/friday-prompts.ts` - Friday prompts
- Billy.dk API - Customer creation
- `docs/crm-business/LEAD_FLOW_ANALYSIS.md` - Lead flow

## TOOL USAGE

**Use these tools:**

- `codebase_search` - Find existing onboarding logic
- `read_file` - Læs relevante filer
- `grep` - Søg efter patterns
- `search_replace` - Implementer workflow
- `run_terminal_cmd` - Test implementation

**DO NOT:**

- Glem Billy integration
- Spring over validation
- Undlad error handling
- Ignorere user experience

## REASONING PROCESS

Før implementation, tænk igennem:

1. **Forstå onboarding flow:**
   - Lead → Customer conversion
   - Welcome communication
   - Profile setup
   - First booking
   - Billy integration

2. **Identificer components:**
   - Onboarding steps
   - Communication templates
   - Profile creation
   - Billy customer sync
   - Tracking system

3. **Implementer workflow:**
   - Start med step definition
   - Tilføj communication automation
   - Implementer profile creation
   - Integrer Billy
   - Tilføj tracking

## IMPLEMENTATION STEPS

1. **Define Onboarding Steps:**
   - Step 1: Lead conversion
   - Step 2: Welcome email
   - Step 3: Profile creation
   - Step 4: Billy customer creation
   - Step 5: First booking setup
   - Step 6: Onboarding completion

2. **Welcome Communication:**
   - Auto-generate welcome email
   - Include service information
   - Provide next steps
   - Personalize based on lead source

3. **Customer Profile Creation:**
   - Create customer profile in database
   - Link to lead
   - Store onboarding data
   - Track onboarding status

4. **Billy.dk Integration:**
   - Create customer in Billy
   - Sync contact information
   - Link to Friday AI profile
   - Handle errors gracefully

5. **Onboarding Tracking:**
   - Track completion status
   - Monitor time to complete
   - Identify bottlenecks
   - Generate reports

6. **Completion Checklist:**
   - Profile created?
   - Billy customer created?
   - Welcome email sent?
   - First booking scheduled?
   - Onboarding complete?

## OUTPUT FORMAT

Provide onboarding workflow implementation:

```markdown
# Customer Onboarding Workflow Implementation

**Dato:** 2025-11-16
**Status:** [COMPLETE / IN PROGRESS]

## Workflow Overview

**Flow:**

1. Lead Conversion → 2. Welcome Email → 3. Profile Creation → 4. Billy Sync → 5. First Booking → 6. Completion

## Implementation Details

### 1. Lead Conversion

- ✅ Detect lead ready for conversion
- ✅ Validate lead data
- ✅ Trigger onboarding workflow
- ✅ Set onboarding status

### 2. Welcome Email

- ✅ Auto-generate welcome email
- ✅ Personalize based on lead source
- ✅ Include service information
- ✅ Provide next steps

### 3. Profile Creation

- ✅ Create customer profile
- ✅ Link to lead
- ✅ Store onboarding data
- ✅ Set profile status

### 4. Billy.dk Integration

- ✅ Create customer in Billy
- ✅ Sync contact information
- ✅ Link profiles
- ✅ Handle errors

### 5. First Booking Setup

- ✅ Suggest first booking
- ✅ Provide booking options
- ✅ Schedule if requested
- ✅ Track booking status

### 6. Onboarding Completion

- ✅ Verify all steps complete
- ✅ Mark onboarding complete
- ✅ Send completion email
- ✅ Update customer status

## Filer Oprettet/Ændret

- `server/customer-onboarding.ts` - Main onboarding workflow
- `server/onboarding-templates.ts` - Email templates
- `client/src/components/onboarding/OnboardingFlow.tsx` - UI component
- `drizzle/schema.ts` - Onboarding tracking fields

## Email Templates

### Welcome Email Template
```

Hej [Navn],

Velkommen til Rendetalje! 🎉

Vi er glade for at have dig som kunde. Her er næste skridt:

1. [Step 1]
2. [Step 2]
3. [Step 3]

[Personalized content based on lead source]

Hvis du har spørgsmål, er du velkommen til at kontakte os.

Mvh,
Rendetalje Team

```

## Onboarding Tracking

**Metrics:**
- Time to complete: [X] days average
- Completion rate: [Y]%
- Drop-off points: [List]

**Status Tracking:**
- Pending: [X] customers
- In Progress: [Y] customers
- Completed: [Z] customers
- Failed: [W] customers

## Testing

- ✅ Lead conversion tested
- ✅ Welcome email tested
- ✅ Profile creation tested
- ✅ Billy integration tested
- ✅ Booking setup tested
- ✅ Completion tracking tested
```

## GUIDELINES

- **User-focused:** Prioritér user experience
- **Complete:** Implementer hele workflow
- **Automated:** Minimér manuel intervention
- **Tracked:** Monitor onboarding metrics
- **Tested:** Test alle steps

## VERIFICATION CHECKLIST

Efter implementation, verificer:

- [ ] Onboarding steps defineret
- [ ] Welcome email genereres korrekt
- [ ] Profile creation virker
- [ ] Billy integration fungerer
- [ ] Booking setup virker
- [ ] Completion tracking fungerer
- [ ] Tests passerer
- [ ] Dokumentation opdateret

---

**CRITICAL:** Start med at definere onboarding steps, derefter implementer welcome communication, profile creation, Billy integration, og completion tracking.
