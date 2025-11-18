# 📋 Abonnementsløsning - Implementation TODOs

**Dato:** 2025-01-28 (Updated)  
**Status:** ✅ Backend Complete | ⏳ Frontend Pending  
**Prioritet:** HIGH

**Note:** This file has been cleaned up. See `SUBSCRIPTION_IMPLEMENTATION_TODOS_CLEANED.md` for organized version.

---

## 📊 TODO Overview

| Area          | Tasks | Priority | Size | Status     |
| ------------- | ----- | -------- | ---- | ---------- |
| Backend       | 8     | P1       | L    | ⏳ Pending |
| Frontend      | 6     | P1       | M    | ⏳ Pending |
| Integration   | 4     | P1       | M    | ⏳ Pending |
| Marketing     | 5     | P2       | S    | ⏳ Pending |
| Testing       | 3     | P1       | S    | ⏳ Pending |
| Documentation | 2     | P2       | S    | ⏳ Pending |

---

## 🔧 Backend Tasks

### Database Schema

- [ ] **Create subscription table** (P1, S)
  - Fields: id, customerId, planType, monthlyPrice, includedHours, startDate, endDate, status, autoRenew
  - Indexes: customerId, status, endDate
  - Location: `drizzle/schema.ts`

- [ ] **Create subscription_usage table** (P1, S)
  - Fields: id, subscriptionId, bookingId, hoursUsed, date, createdAt
  - Track usage vs. included hours
  - Location: `drizzle/schema.ts`

- [ ] **Create subscription_history table** (P2, S)
  - Fields: id, subscriptionId, action, oldValue, newValue, timestamp
  - Audit trail for changes
  - Location: `drizzle/schema.ts`

- [ ] **Create migration file** (P1, S)
  - Generate Drizzle migration
  - Test on dev database
  - Location: `drizzle/migrations/`

### tRPC Router

- [ ] **Create subscription-router.ts** (P1, M)
  - Endpoints:
    - `createSubscription` - Create new subscription
    - `listSubscriptions` - List all subscriptions
    - `getSubscription` - Get single subscription
    - `updateSubscription` - Update subscription (plan change, pause, etc.)
    - `cancelSubscription` - Cancel subscription
    - `getUsage` - Get usage stats for subscription
  - Input validation with Zod
  - Location: `server/routers/subscription-router.ts`

- [ ] **Add subscription helpers** (P1, M)
  - `calculateMonthlyRevenue()` - Calculate MRR
  - `getChurnRate()` - Calculate churn rate
  - `getARPU()` - Calculate Average Revenue Per User
  - `checkOverage()` - Check if customer used more than included hours
  - Location: `server/subscription-helpers.ts`

- [ ] **Add subscription actions** (P1, M)
  - `createSubscription()` - Business logic for creating subscription
  - `processRenewal()` - Auto-renewal logic
  - `processCancellation()` - Cancellation flow
  - `applyDiscount()` - Apply referral/promo discounts
  - Location: `server/subscription-actions.ts`

- [ ] **Add subscription database helpers** (P1, S)
  - `getSubscriptionByCustomerId()`
  - `getActiveSubscriptions()`
  - `getSubscriptionsByStatus()`
  - Location: `server/subscription-db.ts`

### Background Jobs

- [ ] **Create monthly billing job** (P1, M)
  - Run on 1st of each month
  - Generate invoices via Billy.dk
  - Send invoice emails
  - Track payment status
  - Location: `server/jobs/subscription-billing.ts`

- [ ] **Create renewal reminder job** (P2, S)
  - Send reminder 7 days before renewal
  - Send reminder 1 day before renewal
  - Location: `server/jobs/subscription-reminders.ts`

- [ ] **Create usage tracking job** (P1, S)
  - Calculate hours used per subscription
  - Flag overage customers
  - Location: `server/jobs/subscription-usage.ts`

---

## 🎨 Frontend Tasks

### Components

- [ ] **Create SubscriptionPlanSelector component** (P1, M)
  - Display all plan tiers
  - Show pricing and features
  - "Select Plan" button
  - Location: `client/src/components/subscription/SubscriptionPlanSelector.tsx`

- [ ] **Create SubscriptionCard component** (P1, S)
  - Display subscription details
  - Show usage (hours used vs. included)
  - Show next billing date
  - Location: `client/src/components/subscription/SubscriptionCard.tsx`

- [ ] **Create SubscriptionManagement component** (P1, M)
  - List all subscriptions
  - Filter by status
  - Actions: pause, cancel, upgrade, downgrade
  - Location: `client/src/components/subscription/SubscriptionManagement.tsx`

- [ ] **Create UsageChart component** (P2, S)
  - Visualize hours used over time
  - Show included hours limit
  - Overage warnings
  - Location: `client/src/components/subscription/UsageChart.tsx`

- [ ] **Create BillingHistory component** (P2, S)
  - List all invoices
  - Payment status
  - Download invoices
  - Location: `client/src/components/subscription/BillingHistory.tsx`

- [ ] **Add subscription tab to customer profile** (P1, S)
  - Show subscription status
  - Quick actions
  - Location: `client/src/components/crm/CustomerProfile.tsx`

### Pages

- [ ] **Create subscription landing page** (P2, M)
  - Hero section with pricing
  - Plan comparison table
  - CTA buttons
  - Location: `client/src/pages/SubscriptionLanding.tsx`

- [ ] **Create subscription management page** (P1, M)
  - Dashboard with metrics
  - Subscription list
  - Usage charts
  - Location: `client/src/pages/SubscriptionManagement.tsx`

---

## 🔗 Integration Tasks

### Billy.dk Integration

- [ ] **Add subscription product IDs** (P1, S)
  - SUB-001: Tier 1 Abonnement (1,200 kr)
  - SUB-002: Tier 2 Abonnement (1,800 kr)
  - SUB-003: Tier 3 Abonnement (2,500 kr)
  - SUB-004: Flex Basis (1,000 kr)
  - SUB-005: Flex Plus (1,500 kr)
  - Location: `server/friday-prompts.ts` (BILLY_INVOICE_PROMPT)

- [ ] **Create monthly invoice function** (P1, M)
  - Auto-generate invoice on 1st of month
  - Use subscription product ID
  - Set payment terms (14 days)
  - Send via Billy API
  - Location: `server/integrations/billy/subscription-invoicing.ts`

### Google Calendar Integration

- [ ] **Create recurring booking function** (P1, M)
  - Auto-create calendar events based on subscription
  - Handle frequency (weekly, biweekly, monthly)
  - Update on subscription changes
  - Location: `server/integrations/google/calendar/subscription-bookings.ts`

- [ ] **Add subscription reminder emails** (P2, S)
  - Send 24h before booking
  - Include customer details
  - Location: `server/integrations/google/gmail/subscription-reminders.ts`

### Email Automation

- [ ] **Create welcome email template** (P1, S)
  - Welcome message
  - Subscription details
  - Next steps
  - Location: `server/email-templates/subscription-welcome.ts`

- [ ] **Create invoice email template** (P1, S)
  - Invoice details
  - Payment link
  - Location: `server/email-templates/subscription-invoice.ts`

---

## 📢 Marketing Tasks

- [ ] **Create landing page copy** (P2, S)
  - Headlines
  - Benefits
  - Pricing table
  - CTA buttons
  - Location: `docs/marketing/subscription-landing-copy.md`

- [ ] **Create email campaign** (P2, S)
  - Subject lines
  - Email content
  - Send schedule
  - Location: `docs/marketing/subscription-email-campaign.md`

- [ ] **Set up Facebook/Google Ads** (P2, M)
  - Ad copy
  - Targeting
  - Budget: 5,000 kr/måned
  - Location: External (Facebook/Google)

- [ ] **Create referral program** (P2, M)
  - Referral code generation
  - Discount application
  - Tracking
  - Location: `server/referral-system.ts`

- [ ] **Create social media content** (P2, S)
  - Posts for launch
  - Testimonials
  - Before/after content
  - Location: External (Social media)

---

## 🧪 Testing Tasks

- [ ] **Write subscription unit tests** (P1, M)
  - Test subscription creation
  - Test renewal logic
  - Test cancellation flow
  - Test usage tracking
  - Location: `tests/subscription.test.ts`

- [ ] **Write integration tests** (P1, M)
  - Test Billy.dk invoice generation
  - Test calendar booking creation
  - Test email sending
  - Location: `tests/subscription-integration.test.ts`

- [ ] **Beta test with 5-10 customers** (P1, M)
  - Select test customers
  - Onboard to subscription
  - Collect feedback
  - Iterate based on feedback
  - Location: External (Customer testing)

---

## 📚 Documentation Tasks

- [ ] **Create subscription API documentation** (P2, S)
  - Endpoint documentation
  - Request/response examples
  - Error handling
  - Location: `docs/api/subscription-api.md`

- [ ] **Create user guide** (P2, S)
  - How to subscribe
  - How to manage subscription
  - How to cancel
  - FAQ
  - Location: `docs/user-guides/subscription-guide.md`

---

## 🎯 Priority Breakdown

### **P1 - Must Have (MVP)**

1. Database schema (subscription table)
2. tRPC router (create, list, cancel)
3. Billy.dk integration (monthly invoicing)
4. Frontend components (plan selector, management)
5. Basic testing

**Timeline:** 2-3 uger

### **P2 - Should Have (Phase 2)**

1. Usage tracking
2. Renewal reminders
3. Referral program
4. Marketing materials
5. Advanced analytics

**Timeline:** 1-2 måneder

### **P3 - Nice to Have (Future)**

1. Advanced usage charts
2. Predictive analytics
3. AI-powered recommendations
4. Mobile app

**Timeline:** 3+ måneder

---

## 📅 Timeline Estimate

### **Week 1-2: Backend Foundation**

- Database schema
- tRPC router
- Basic helpers

### **Week 3-4: Integration**

- Billy.dk invoicing
- Calendar booking
- Email automation

### **Week 5-6: Frontend**

- Components
- Pages
- UI/UX polish

### **Week 7-8: Testing & Launch**

- Testing
- Beta test
- Launch preparation

**Total:** 8 uger til MVP launch

---

## 💰 Budget Estimate

| Item                   | Cost          | Notes                    |
| ---------------------- | ------------- | ------------------------ |
| Development (40 timer) | 20,000 kr     | Backend + Frontend       |
| Integration (20 timer) | 10,000 kr     | Billy + Calendar + Email |
| Testing (10 timer)     | 5,000 kr      | Unit + Integration tests |
| Marketing Setup        | 5,000 kr      | Landing page + Ads setup |
| **Total**              | **40,000 kr** | MVP Budget               |

**Ongoing:**

- Marketing: 5,000 kr/måned
- Maintenance: 2,000 kr/måned

---

## ✅ Definition of Done

### **MVP Ready When:**

- [ ] All P1 tasks completed
- [ ] Unit tests passing (>80% coverage)
- [ ] Integration tests passing
- [ ] Beta test completed with 5+ customers
- [ ] Documentation complete
- [ ] Marketing materials ready
- [ ] Billy.dk integration tested
- [ ] Calendar booking working
- [ ] Email automation working

---

**Last Updated:** 2025-11-17  
**Next Review:** 2025-11-24
