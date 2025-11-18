# Subscription Manual Testing Guide

**Dato:** 2025-01-28  
**Status:** ✅ Test Scripts Oprettet

---

## Oversigt

Denne guide beskriver hvordan man manuelt tester subscription features i Friday AI Chat.

---

## Test Scripts

### 1. Unit/Integration Tests (Vitest)

**Kør alle subscription tests:**

```bash
pnpm test:subscription
```

**Kør specifik test:**

```bash
pnpm exec vitest run server/__tests__/subscription-smoke.test.ts
```

**Tests dækker:**

- ✅ Subscription creation
- ✅ Email delivery (mocked)
- ✅ Usage tracking
- ✅ Renewal flow
- ✅ Cancellation flow
- ✅ Background jobs
- ✅ Helper functions

---

### 2. Email Delivery Test

**Test Gmail API email sending:**

```bash
pnpm test:subscription:email
```

**Hvad testes:**

- Welcome email
- Renewal email
- Cancellation email
- Overage warning email

**Forudsætninger:**

- Gmail API credentials konfigureret i `.env.dev`
- `GOOGLE_SERVICE_ACCOUNT_KEY` sat
- `GOOGLE_IMPERSONATED_USER` sat

**Resultat:**

- Tjek Gmail inbox for test emails
- Alle emails skal være sendt til `test-subscription@example.com`

---

### 3. Renewal Flow Test

**Test end-to-end renewal flow:**

```bash
pnpm test:subscription:renewal
```

**Hvad testes:**

- Manual renewal via `processRenewal()`
- Background job renewal via `processMonthlyRenewals()`
- Invoice creation (Billy.dk integration)
- Next billing date update

**Forudsætninger:**

- Database connection
- Billy.dk integration konfigureret
- Test user ID sat i `TEST_USER_ID` env var (default: 1)

**Resultat:**

- Renewal skal oprette faktura
- Next billing date skal opdateres
- Background job skal processere renewals

---

### 4. Usage Tracking Test

**Test usage tracking fra bookings:**

```bash
pnpm test:subscription:usage
```

**Hvad testes:**

- Calculate booking hours
- Track booking usage
- Verify usage recorded
- Sync historical usage

**Forudsætninger:**

- Database connection
- Test subscription oprettet
- Test booking oprettet

**Resultat:**

- Usage skal trackes korrekt
- Hours skal beregnes korrekt
- Historical sync skal virke

---

## Manual UI Testing

### 1. Subscription Creation

**Steps:**

1. Naviger til `/crm/customers`
2. Vælg en kunde
3. Gå til "Subscriptions" tab
4. Klik "Create Subscription"
5. Vælg plan (tier1, tier2, tier3, flex_basis, flex_plus)
6. Sæt start date
7. Aktiver/deaktiver auto-renew
8. Klik "Create Subscription"

**Expected:**

- Subscription oprettes
- Welcome email sendes
- Subscription vises i liste
- Status badge viser "Active"

---

### 2. Subscription List

**Steps:**

1. Naviger til customer detail page
2. Gå til "Subscriptions" tab
3. Se subscription liste

**Expected:**

- Active subscriptions vises først
- Churn risk badge vises (hvis risk >= 50%)
- Usage display vises for active subscriptions
- Cancel button vises for active subscriptions

---

### 3. Usage Display

**Steps:**

1. Se subscription card
2. Se usage display under subscription

**Expected:**

- Progress bar viser usage percentage
- Overage warning vises hvis usage > included hours
- Usage history vises
- Booking links vises

---

### 4. Churn Risk Prediction

**Steps:**

1. Se subscription card med `showChurnRisk={true}`
2. Check churn risk badge

**Expected:**

- Churn risk badge vises hvis risk >= 50%
- Color coding: Red (>=70%), Yellow (50-69%)
- Tooltip viser risk percentage og timeline

---

### 5. Subscription Cancellation

**Steps:**

1. Find active subscription
2. Klik "Cancel Subscription"
3. Bekræft cancellation
4. Tjek subscription status

**Expected:**

- Subscription status ændres til "cancelled"
- Cancellation email sendes
- Subscription forsvinder fra active list
- Subscription vises i "Other Subscriptions"

---

## Integration Testing

### 1. Billy.dk Invoice Integration

**Test:**

1. Opret subscription
2. Process renewal
3. Check Billy.dk for invoice

**Expected:**

- Invoice oprettes i Billy.dk
- Product ID korrekt (SUB-001 til SUB-005)
- Price korrekt
- Customer linked korrekt

---

### 2. Google Calendar Integration

**Test:**

1. Opret subscription
2. Check calendar for recurring events

**Expected:**

- Recurring bookings oprettes
- Events matcher subscription plan
- Frequency korrekt (monthly)

---

### 3. Booking Usage Tracking

**Test:**

1. Opret booking for subscription customer
2. Mark booking as "completed"
3. Check subscription usage

**Expected:**

- Usage tracked automatically
- Hours calculated correctly
- Usage vises i usage display

---

## Background Jobs Testing

### 1. Monthly Renewal Job

**Test:**

```bash
# Via tRPC endpoint
trpc.subscription.processRenewals.mutate({ userId: 1 })
```

**Expected:**

- All due subscriptions processed
- Invoices created
- Emails sent
- Next billing dates updated

---

### 2. Cron Job Setup

**Manual Setup Required:**

1. Configure cron job to run daily
2. Call `trpc.subscription.processRenewals.mutate()`
3. Monitor logs for errors

**Example cron (Linux/Mac):**

```bash
0 2 * * * cd /path/to/project && pnpm exec dotenv -e .env.prod -- tsx server/scripts/run-renewal-job.ts
```

---

## Test Data Setup

### Create Test Customer

```typescript
const testCustomer = {
  name: "Test Customer",
  email: "test@example.com",
  phone: "+45 12 34 56 78",
  status: "active",
  customerType: "private",
};
```

### Create Test Subscription

```typescript
const subscription = await createSubscription(userId, customerId, "tier1", {
  autoRenew: true,
});
```

---

## Troubleshooting

### Email Not Sending

**Check:**

- Gmail API credentials
- Service account permissions
- Impersonated user email
- Network connectivity

**Debug:**

```bash
# Check logs
pnpm logs:email

# Test Gmail API directly
pnpm test:email-smoke
```

---

### Renewal Not Processing

**Check:**

- Next billing date set correctly
- Subscription status is "active"
- Auto-renew enabled
- Billy.dk integration working

**Debug:**

```bash
# Check subscription status
SELECT * FROM subscriptions WHERE status = 'active' AND next_billing_date < NOW();

# Test renewal manually
pnpm test:subscription:renewal
```

---

### Usage Not Tracking

**Check:**

- Booking has customer profile
- Booking status is "completed"
- Subscription exists for customer
- Booking has scheduledStart and scheduledEnd

**Debug:**

```bash
# Test usage tracking
pnpm test:subscription:usage

# Check usage records
SELECT * FROM subscription_usage WHERE subscription_id = ?;
```

---

## Test Checklist

### ✅ Automated Tests

- [ ] Unit tests pass (`pnpm test:subscription`)
- [ ] Email tests pass (`pnpm test:subscription:email`)
- [ ] Renewal tests pass (`pnpm test:subscription:renewal`)
- [ ] Usage tests pass (`pnpm test:subscription:usage`)

### ✅ Manual UI Tests

- [ ] Subscription creation works
- [ ] Subscription list displays correctly
- [ ] Usage display shows correct data
- [ ] Churn risk badge displays
- [ ] Cancellation works

### ✅ Integration Tests

- [ ] Billy.dk invoices created
- [ ] Google Calendar events created
- [ ] Booking usage tracked
- [ ] Emails sent correctly

### ✅ Background Jobs

- [ ] Monthly renewal job runs
- [ ] Cron job configured
- [ ] Error handling works
- [ ] Logging works

---

## Next Steps

1. **Run all automated tests:**

   ```bash
   pnpm test:subscription
   pnpm test:subscription:email
   pnpm test:subscription:renewal
   pnpm test:subscription:usage
   ```

2. **Manual UI testing:**
   - Test subscription creation
   - Test subscription list
   - Test usage display
   - Test cancellation

3. **Integration testing:**
   - Test Billy.dk integration
   - Test Google Calendar integration
   - Test booking usage tracking

4. **Background jobs:**
   - Configure cron job
   - Test renewal processing
   - Monitor logs

---

**Last Updated:** 2025-01-28  
**Status:** ✅ READY FOR TESTING
