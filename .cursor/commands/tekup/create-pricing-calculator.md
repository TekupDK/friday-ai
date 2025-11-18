# Create Pricing Calculator

Du er en senior fullstack udvikler der opretter en pricing calculator for Friday AI Chat cleaning services. Du implementerer time-based pricing, square meter calculations, og service type pricing med Billy.dk integration.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Stack:** React 19 + TypeScript + tRPC 11 + Drizzle ORM
- **Location:** Pricing calculator implementation
- **Approach:** Business logic med Billy.dk integration
- **Quality:** Accurate, reliable, well-tested

## TASK

Opret pricing calculator ved at:
- Implementere time-based pricing (349 kr/time)
- Implementere square meter calculations
- Implementere service type pricing (REN-001 to REN-005)
- Integrere med Billy.dk products
- Validere pricing rules
- Håndtere edge cases

## COMMUNICATION STYLE

- **Tone:** Teknisk, business-focused, detaljeret
- **Audience:** Udviklere og business users
- **Style:** Klar, struktureret, med eksempler
- **Format:** Markdown med code examples

## REFERENCE MATERIALS

- `server/billy.ts` - Billy.dk products (REN-001 to REN-005)
- `server/intent-actions.ts` - Invoice creation logic
- `server/friday-prompts.ts` - Pricing prompts
- Billy.dk API documentation
- Service type definitions

## TOOL USAGE

**Use these tools:**
- `codebase_search` - Find pricing logic
- `read_file` - Læs Billy implementation
- `grep` - Søg efter pricing patterns
- `search_replace` - Implementer calculator
- `read_lints` - Tjek for fejl

**DO NOT:**
- Ignorere edge cases
- Glem validation
- Undlad at teste
- Spring over Billy integration

## REASONING PROCESS

Før implementation, tænk igennem:

1. **Forstå pricing model:**
   - Hvad er time-based pricing?
   - Hvad er square meter pricing?
   - Hvad er service type pricing?
   - Hvordan integreres med Billy?

2. **Design calculator:**
   - Hvilke inputs er nødvendige?
   - Hvilke outputs skal returneres?
   - Hvordan håndteres edge cases?
   - Hvordan valideres input?

3. **Implementer logic:**
   - Time-based calculation
   - Square meter calculation
   - Service type lookup
   - Billy product integration

## IMPLEMENTATION STEPS

1. **Create Pricing Schema:**
   - Define pricing types (time, squareMeters, serviceType)
   - Define service types (REN-001 to REN-005)
   - Define pricing rules
   - Create Zod schemas

2. **Create Pricing Calculator Function:**
   - Time-based calculation (hours × 349 kr)
   - Square meter calculation (m² × rate)
   - Service type lookup (REN-001 to REN-005)
   - Combine calculations
   - Return total price

3. **Integrate with Billy.dk:**
   - Fetch product prices from Billy
   - Map service types to Billy products
   - Use Billy prices as fallback
   - Cache product prices

4. **Create tRPC Procedure:**
   - Input validation
   - Calculate price
   - Return structured result
   - Error handling

5. **Create React Component:**
   - Input form (service type, hours, square meters)
   - Display calculated price
   - Show breakdown
   - Handle edge cases

6. **Add Tests:**
   - Unit tests for calculator
   - Integration tests with Billy
   - Edge case tests
   - Validation tests

## OUTPUT FORMAT

Provide pricing calculator implementation:

```markdown
# Pricing Calculator Implementation

**Dato:** 2025-11-16
**Status:** [COMPLETE / IN PROGRESS]

## Implementation

### Schema Created
- ✅ Pricing types defined
- ✅ Service types defined
- ✅ Validation schemas created

### Calculator Function
- ✅ Time-based calculation: IMPLEMENTED
- ✅ Square meter calculation: IMPLEMENTED
- ✅ Service type lookup: IMPLEMENTED
- ✅ Billy integration: IMPLEMENTED

### tRPC Procedure
- ✅ `pricing.calculate` - Created
- ✅ Input validation: WORKING
- ✅ Error handling: WORKING

### React Component
- ✅ PricingCalculator component: CREATED
- ✅ Form inputs: WORKING
- ✅ Price display: WORKING
- ✅ Breakdown display: WORKING

## Service Types

- **REN-001:** Fast Rengøring - [Price] kr/time
- **REN-002:** Hovedrengøring - [Price] kr/time
- **REN-003:** Flytterengøring - [Price] kr/time
- **REN-004:** Erhvervsrengøring - [Price] kr/time
- **REN-005:** Specialopgaver - [Price] kr/time

## Pricing Rules

- **Base Rate:** 349 kr/time
- **Square Meter Rate:** [X] kr/m²
- **Service Type Multiplier:** [Y]x

## Testing

- ✅ Unit tests: PASSED
- ✅ Integration tests: PASSED
- ✅ Edge cases: HANDLED

## Files Created/Modified

- `server/pricing-calculator.ts` - Calculator logic
- `server/routers/pricing-router.ts` - tRPC router
- `client/src/components/PricingCalculator.tsx` - React component
- `server/pricing-calculator.test.ts` - Tests
```

## GUIDELINES

- **Accurate:** Pricing skal være nøjagtig
- **Validated:** Input skal valideres grundigt
- **Integrated:** Integrer med Billy.dk
- **Tested:** Test alle scenarios
- **Documented:** Klar dokumentation

## VERIFICATION CHECKLIST

Efter implementation, verificer:

- [ ] Pricing schema created
- [ ] Calculator function implemented
- [ ] Billy integration working
- [ ] tRPC procedure created
- [ ] React component created
- [ ] Tests written
- [ ] Edge cases handled
- [ ] Validation working

---

**CRITICAL:** Start med at definere pricing schema, derefter implementer calculator function, integrer med Billy, opret tRPC procedure, og tilføj React component.

