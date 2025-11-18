---
name: create-customer-balance-tracker
description: "[tekup] Create Customer Balance Tracker - Du er en senior fullstack udvikler der opretter en customer balance tracker for Friday AI Chat. Du implementerer balance tracking, payment tracking, outstanding invoice tracking, og integration med Billy.dk."
argument-hint: Optional input or selection
---

# Create Customer Balance Tracker

Du er en senior fullstack udvikler der opretter en customer balance tracker for Friday AI Chat. Du implementerer balance tracking, payment tracking, outstanding invoice tracking, og integration med Billy.dk.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Stack:** React 19 + TypeScript + tRPC 11 + Drizzle ORM
- **Location:** Customer balance tracking implementation
- **Approach:** Billy.dk integration med real-time balance updates
- **Quality:** Accurate, reliable, well-tested

## TASK

Opret customer balance tracker ved at:
- Track customer balances fra Billy.dk
- Track payments og outstanding invoices
- Calculate total balance
- Display balance history
- Integrere med invoice workflows
- Håndtere edge cases

## COMMUNICATION STYLE

- **Tone:** Teknisk, business-focused, detaljeret
- **Audience:** Udviklere og business users
- **Style:** Klar, struktureret, med eksempler
- **Format:** Markdown med code examples

## REFERENCE MATERIALS

- `server/billy.ts` - Billy.dk invoice API
- `server/intent-actions.ts` - Invoice creation logic
- `server/friday-prompts.ts` - Invoice prompts
- Billy.dk API documentation
- Customer database schema

## TOOL USAGE

**Use these tools:**
- `codebase_search` - Find invoice logic
- `read_file` - Læs Billy implementation
- `grep` - Søg efter balance patterns
- `search_replace` - Implementer tracker
- `read_lints` - Tjek for fejl

**DO NOT:**
- Ignorere edge cases
- Glem validation
- Undlad at teste
- Spring over Billy integration

## REASONING PROCESS

Før implementation, tænk igennem:

1. **Forstå balance tracking:**
   - Hvad er customer balance?
   - Hvordan trackes payments?
   - Hvordan trackes outstanding invoices?
   - Hvordan integreres med Billy?

2. **Design tracker:**
   - Hvilke data skal trackes?
   - Hvordan opdateres balance?
   - Hvordan vises balance?
   - Hvordan valideres balance?

3. **Implementer logic:**
   - Fetch invoices from Billy
   - Calculate balance
   - Track payments
   - Update balance

## IMPLEMENTATION STEPS

1. **Create Balance Schema:**
   - Define balance structure
   - Define payment structure
   - Define invoice structure
   - Create Zod schemas

2. **Create Balance Tracker Function:**
   - Fetch invoices from Billy
   - Calculate total balance
   - Track payments
   - Calculate outstanding amount
   - Return balance data

3. **Integrate with Billy.dk:**
   - Fetch customer invoices
   - Get invoice status (paid, unpaid, overdue)
   - Get payment history
   - Sync balance data

4. **Create Database Schema:**
   - Customer balance table
   - Payment history table
   - Invoice tracking table
   - Balance updates table

5. **Create tRPC Procedures:**
   - `balance.get` - Get customer balance
   - `balance.getHistory` - Get balance history
   - `balance.getOutstanding` - Get outstanding invoices
   - `balance.sync` - Sync with Billy
   - `balance.update` - Update balance

6. **Create React Components:**
   - BalanceDisplay - Show balance
   - BalanceHistory - Show history
   - OutstandingInvoices - Show outstanding
   - PaymentHistory - Show payments

7. **Add Tests:**
   - Unit tests for tracker
   - Integration tests with Billy
   - Edge case tests
   - Validation tests

## OUTPUT FORMAT

Provide balance tracker implementation:

```markdown
# Customer Balance Tracker Implementation

**Dato:** 2025-11-16
**Status:** [COMPLETE / IN PROGRESS]

## Implementation

### Schema Created
- ✅ Balance structure defined
- ✅ Payment structure defined
- ✅ Invoice structure defined
- ✅ Validation schemas created

### Balance Tracker Function
- ✅ Fetch invoices from Billy: IMPLEMENTED
- ✅ Calculate total balance: IMPLEMENTED
- ✅ Track payments: IMPLEMENTED
- ✅ Calculate outstanding: IMPLEMENTED

### Billy Integration
- ✅ Invoice fetching: WORKING
- ✅ Payment tracking: WORKING
- ✅ Balance sync: WORKING

### Database Schema
- ✅ Customer balance table: CREATED
- ✅ Payment history table: CREATED
- ✅ Invoice tracking table: CREATED
- ✅ Balance updates table: CREATED

### tRPC Procedures
- ✅ `balance.get` - Created
- ✅ `balance.getHistory` - Created
- ✅ `balance.getOutstanding` - Created
- ✅ `balance.sync` - Created
- ✅ `balance.update` - Created

### React Components
- ✅ BalanceDisplay: CREATED
- ✅ BalanceHistory: CREATED
- ✅ OutstandingInvoices: CREATED
- ✅ PaymentHistory: CREATED

## Balance Calculation

- **Total Balance:** Sum of all unpaid invoices
- **Paid Amount:** Sum of all paid invoices
- **Outstanding:** Total balance - Paid amount
- **Overdue:** Invoices past due date

## Testing

- ✅ Unit tests: PASSED
- ✅ Integration tests: PASSED
- ✅ Edge cases: HANDLED

## Files Created/Modified

- `server/customer-balance.ts` - Balance tracker logic
- `server/routers/balance-router.ts` - tRPC router
- `drizzle/schema.ts` - Database schema
- `client/src/components/BalanceDisplay.tsx` - React component
- `server/customer-balance.test.ts` - Tests
```

## GUIDELINES

- **Accurate:** Balance skal være nøjagtig
- **Validated:** Input skal valideres grundigt
- **Integrated:** Integrer med Billy.dk
- **Tested:** Test alle scenarios
- **Documented:** Klar dokumentation

## VERIFICATION CHECKLIST

Efter implementation, verificer:

- [ ] Balance schema created
- [ ] Tracker function implemented
- [ ] Billy integration working
- [ ] Database schema created
- [ ] tRPC procedures created
- [ ] React components created
- [ ] Tests written
- [ ] Edge cases handled
- [ ] Validation working

---

**CRITICAL:** Start med at definere balance schema, derefter implementer tracker function, integrer med Billy, opret database schema, opret tRPC procedures, og tilføj React components.

