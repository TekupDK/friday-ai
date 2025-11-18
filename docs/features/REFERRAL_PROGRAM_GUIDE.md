# Referral Program Guide

**Created:** 2025-11-18
**Status:** ✅ Production Ready
**Version:** 1.0.0

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Setup & Configuration](#setup--configuration)
5. [User Guide](#user-guide)
6. [Developer Guide](#developer-guide)
7. [API Reference](#api-reference)
8. [Database Schema](#database-schema)
9. [Testing](#testing)
10. [Analytics & Reporting](#analytics--reporting)

---

## Overview

Friday AI's referral program allows customers to refer new customers and earn rewards. The system includes:

- **Referral Code Generation** - Auto-generated or custom codes
- **Discount Application** - Automatic discount during subscription creation
- **Reward Tracking** - Track referrals from pending to rewarded
- **Analytics Dashboard** - Stats, conversion rates, ROI tracking
- **Leaderboard** - Top referrers gamification

### Default Configuration

```typescript
{
  defaultReferrerReward: 20000,  // 200 kr for referrer
  defaultReferredReward: 20000,  // 200 kr for referred customer
  codeLength: 8,                  // Generated code length
  codePrefix: "REF",              // Code prefix
  validityDays: 365,              // Code validity period
  minSubscriptionMonthsForReward: 1  // Min subscription duration
}
```

---

## Features

### For Customers

✅ **Create Referral Codes**
- Auto-generated unique codes (REF-XXXXXXXX)
- Custom codes (e.g., JANEDOE2024)
- Unlimited code creation per user
- Set expiry dates and usage limits

✅ **Share & Track**
- Copy code to clipboard
- Generate shareable referral links
- Track code usage in real-time
- View pending and completed referrals

✅ **Earn Rewards**
- 200 kr per successful referral (default)
- Track total earnings
- View reward history
- Leaderboard rankings

### For Referred Customers

✅ **Get Discounts**
- 200 kr discount on first month (default)
- Real-time code validation
- Visual feedback during signup
- Automatic application

### For Business

✅ **Analytics**
- Total referrals and conversions
- Conversion rate tracking
- ROI calculation
- Revenue attribution

✅ **Automation**
- Automatic discount application
- Reward tracking
- Email notifications (coming soon)
- Background job processing (coming soon)

---

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                          │
├─────────────────────────────────────────────────────────────┤
│  ReferralDashboard.tsx  │  ReferralCodeInput.tsx           │
│  - Stats & Analytics    │  - Real-time validation          │
│  - Code management      │  - Discount preview              │
│  - Leaderboard          │  - Error handling                │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               │          tRPC API            │
               │                              │
┌──────────────▼──────────────────────────────▼───────────────┐
│                     Backend Layer                           │
├─────────────────────────────────────────────────────────────┤
│  referral-router.ts     │  referral-actions.ts             │
│  - 13 tRPC endpoints    │  - CRUD operations               │
│  - Input validation     │  - Database transactions         │
│  - Auth middleware      │  - Error handling                │
│                         │                                   │
│  referral-helpers.ts    │  subscription-actions.ts         │
│  - Code generation      │  - Referral integration          │
│  - Validation logic     │  - Discount application          │
│  - Analytics/Stats      │  - Reward creation               │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               │      Database Access         │
               │                              │
┌──────────────▼──────────────────────────────▼───────────────┐
│                   Database Layer                            │
├─────────────────────────────────────────────────────────────┤
│  referral_codes         │  referral_rewards                │
│  - Code storage         │  - Reward tracking               │
│  - Usage tracking       │  - Status management             │
│  - Expiry management    │  - Amount tracking               │
│                         │                                   │
│  referral_history       │  subscriptions                   │
│  - Audit trail          │  - Referral metadata             │
│  - Event logging        │  - Discount info                 │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Subscription with Referral Code:**

```
1. User enters referral code in signup form
   ↓
2. ReferralCodeInput validates code (real-time)
   ↓
3. User completes subscription form
   ↓
4. createSubscription() called with referralCode
   ↓
5. Validate code (active, not expired, has uses left)
   ↓
6. Calculate discount amount
   ↓
7. Apply discount to monthly price
   ↓
8. Create subscription with discounted price
   ↓
9. Create referral reward entry (status: pending)
   ↓
10. Increment code usage count
   ↓
11. Store referral info in subscription metadata
   ↓
12. Background job: Monitor subscription duration
   ↓
13. After 1 month: Mark referral as completed
   ↓
14. Give reward to referrer (status: rewarded)
```

---

## Setup & Configuration

### 1. Database Migration

Run migration to create referral tables:

```bash
# Development
npm run db:push:dev

# Production
npm run db:push:prod
```

This creates:
- `friday_ai.referral_status` enum
- `friday_ai.referral_codes` table
- `friday_ai.referral_rewards` table
- `friday_ai.referral_history` table

### 2. Environment Variables

No additional environment variables required. Uses existing database connection.

### 3. Frontend Router Setup

Add referral route to your router:

```typescript
// router.tsx
import { ReferralPage } from "@/pages/ReferralPage";

{
  path: "/referrals",
  element: <ReferralPage />,
}
```

### 4. Navigation Menu

Add link to navigation:

```typescript
{
  name: "Referrals",
  href: "/referrals",
  icon: GiftIcon,
}
```

### 5. Subscription Form Integration

Add ReferralCodeInput to subscription signup:

```typescript
import { ReferralCodeInput } from "@/components/referral";

function SubscriptionForm() {
  const [referralCode, setReferralCode] = useState("");
  const [isValidCode, setIsValidCode] = useState(false);

  return (
    <>
      {/* ... other fields ... */}

      <ReferralCodeInput
        value={referralCode}
        onChange={setReferralCode}
        onValidationChange={(isValid) => setIsValidCode(isValid)}
      />

      <button
        onClick={() => createSubscription({
          ...formData,
          referralCode: isValidCode ? referralCode : undefined
        })}
      >
        Subscribe
      </button>
    </>
  );
}
```

---

## User Guide

### Creating a Referral Code

1. Navigate to **Referrals** page
2. Click **"Create Code"** button
3. (Optional) Enter custom code or leave empty for auto-generated
4. Click **"Create"**
5. Your code appears in the list

### Sharing Your Code

**Method 1: Copy Code**
1. Click the copy icon next to your code
2. Paste in email, message, or social media

**Method 2: Share Link**
1. Click the share icon next to your code
2. Referral link is copied to clipboard
3. Share the link - code is pre-filled on signup

### Tracking Referrals

**Dashboard Stats:**
- **Total Referrals** - All referrals (pending + completed)
- **Converted** - Referrals that became paying customers
- **Total Earned** - Total rewards earned
- **Conversion Rate** - % of referrals that converted

**Referral Status:**
- **Pending** - Customer signed up, subscription active < 1 month
- **Completed** - Customer subscription active ≥ 1 month
- **Rewarded** - Reward has been given to you
- **Expired** - Code expired before use
- **Cancelled** - Referral was cancelled

### Deactivating a Code

1. Find the code in your list
2. Click **"Deactivate"**
3. Confirm deactivation
4. Code can no longer be used

---

## Developer Guide

### Creating Referral Code (Backend)

```typescript
import { createReferralCode } from "./referral-actions";

// Auto-generated code
const result = await createReferralCode({
  userId: 123,
  discountAmount: 20000, // 200 kr in øre
  discountType: "fixed",
  validityDays: 365,
});

// Custom code
const result = await createReferralCode({
  userId: 123,
  customCode: "JOHNDOE2024",
  discountAmount: 1000, // 10% (basis points)
  discountType: "percentage",
  maxUses: 50,
});
```

### Validating Code

```typescript
import { validateReferralCode } from "./referral-helpers";

const validation = await validateReferralCode("REF12345678");

if (validation.valid) {
  console.log("Code is valid!", validation.referralCode);
} else {
  console.log("Invalid:", validation.reason);
}
```

### Applying Code During Subscription

```typescript
import { createSubscription } from "./subscription-actions";

const subscription = await createSubscription(
  userId,
  customerProfileId,
  "tier1",
  {
    referralCode: "REF12345678", // ← Add this
    autoRenew: true,
  }
);

// Discount automatically applied!
// Referral reward created!
```

### Frontend Components

**ReferralDashboard:**
```typescript
import { ReferralDashboard } from "@/components/referral";

<ReferralDashboard />
```

**ReferralCodeInput:**
```typescript
import { ReferralCodeInput } from "@/components/referral";

<ReferralCodeInput
  value={code}
  onChange={setCode}
  onValidationChange={(isValid, discountAmount) => {
    setIsValid(isValid);
    setDiscount(discountAmount);
  }}
/>
```

---

## API Reference

### tRPC Endpoints

All endpoints under `trpc.referral.*`:

**Mutations (Write Operations):**

```typescript
// Create referral code
trpc.referral.createCode.useMutation({
  customerProfileId?: number,
  customCode?: string,
  discountAmount?: number,
  discountType?: "fixed" | "percentage",
  maxUses?: number,
  validityDays?: number,
})

// Apply referral code
trpc.referral.applyCode.useMutation({
  code: string,
  referredCustomerId: number,
  referredSubscriptionId?: number,
})

// Deactivate code
trpc.referral.deactivateCode.useMutation({
  referralCodeId: number,
})

// Complete referral (internal/admin)
trpc.referral.completeReferral.useMutation({
  referralRewardId: number,
})

// Give reward (internal/admin)
trpc.referral.giveReward.useMutation({
  referralRewardId: number,
})
```

**Queries (Read Operations):**

```typescript
// Validate code
trpc.referral.validateCode.useQuery({
  code: string,
})

// List user's codes
trpc.referral.listCodes.useQuery()

// List user's rewards
trpc.referral.listRewards.useQuery()

// Get user stats
trpc.referral.getStats.useQuery()

// Get top referrers
trpc.referral.getTopReferrers.useQuery({
  limit?: number, // default: 10
})

// Get conversion rate
trpc.referral.getConversionRate.useQuery({
  userId?: number, // omit for global
})

// Get referral ROI
trpc.referral.getReferralROI.useQuery()

// Get config
trpc.referral.getConfig.useQuery()
```

---

## Database Schema

### `friday_ai.referral_codes`

| Column            | Type      | Description                        |
| ----------------- | --------- | ---------------------------------- |
| id                | serial    | Primary key                        |
| userId            | integer   | Referrer user ID                   |
| customerProfileId | integer   | Optional customer profile          |
| code              | varchar   | Unique referral code               |
| discountAmount    | integer   | Discount in øre (or basis points)  |
| discountType      | varchar   | "fixed" or "percentage"            |
| maxUses           | integer   | Max times code can be used (null = unlimited) |
| currentUses       | integer   | Current usage count                |
| validFrom         | timestamp | When code becomes valid            |
| validUntil        | timestamp | When code expires (null = no expiry) |
| isActive          | boolean   | Is code active                     |

**Indexes:**
- `idx_referral_codes_user_id` on userId
- `idx_referral_codes_code` on code (unique)
- `idx_referral_codes_active` on isActive

### `friday_ai.referral_rewards`

| Column                  | Type      | Description                   |
| ----------------------- | --------- | ----------------------------- |
| id                      | serial    | Primary key                   |
| referralCodeId          | integer   | Referral code used            |
| referrerId              | integer   | User who referred             |
| referredCustomerId      | integer   | Customer who was referred     |
| referredSubscriptionId  | integer   | Subscription created          |
| rewardAmount            | integer   | Reward amount in øre          |
| status                  | enum      | pending/completed/rewarded/expired/cancelled |
| createdAt               | timestamp | When referral created         |
| completedAt             | timestamp | When referral completed       |
| rewardedAt              | timestamp | When reward given             |

**Indexes:**
- `idx_referral_rewards_referrer_id` on referrerId
- `idx_referral_rewards_referred_customer_id` on referredCustomerId
- `idx_referral_rewards_status` on status

### `friday_ai.referral_history`

| Column           | Type      | Description             |
| ---------------- | --------- | ----------------------- |
| id               | serial    | Primary key             |
| referralCodeId   | integer   | Code that changed       |
| referralRewardId | integer   | Reward that changed     |
| action           | varchar   | Action type             |
| oldValue         | text      | Previous state (JSON)   |
| newValue         | text      | New state (JSON)        |
| performedBy      | integer   | User who made change    |
| createdAt        | timestamp | When change occurred    |
| metadata         | text      | Additional info (JSON)  |

---

## Testing

### Manual Testing

```bash
# Run referral system tests
npm run test:referral

# Expected output:
# ✅ Test 1: Referral code created successfully
# ✅ Test 2: Custom referral code created
# ✅ Test 3: Referral code validated successfully
# ✅ Test 4: Invalid code correctly rejected
# ✅ Test 6: User referral codes retrieved
# ✅ Test 7: Referral statistics retrieved
# ✅ Test 8: Conversion rate calculated
# ✅ Test 9: ROI calculated
# ✅ Test 10: User rewards retrieved
```

### Integration Testing

Test in subscription flow:

1. Create a test referral code
2. Start subscription signup
3. Enter referral code
4. Verify discount applied
5. Complete subscription
6. Verify reward created with status "pending"
7. Check subscription metadata contains referral info

### Unit Testing

Key functions to test:

```typescript
// referral-helpers.ts
✅ generateReferralCode()
✅ validateReferralCode()
✅ calculateReferralDiscount()
✅ getReferralStats()
✅ getTopReferrers()
✅ getReferralConversionRate()
✅ calculateReferralROI()

// referral-actions.ts
✅ createReferralCode()
✅ applyReferralCode()
✅ completeReferral()
✅ giveReferralReward()
```

---

## Analytics & Reporting

### Key Metrics

**User-Level:**
- Total referrals made
- Completed referrals (conversions)
- Pending referrals
- Total rewards earned
- Total rewards paid out
- Conversion rate

**Business-Level:**
- Total active referral codes
- Total referrals across all users
- Global conversion rate
- Total rewards paid
- Total revenue from referrals
- ROI (Return on Investment)

### ROI Calculation

```typescript
ROI = ((Revenue Generated - Rewards Paid) / Rewards Paid) * 100

Example:
- Rewards Paid: 10,000 kr
- Revenue Generated: 180,000 kr (from referred subscriptions)
- ROI: ((180,000 - 10,000) / 10,000) * 100 = 1,700%
```

### Leaderboard

Top referrers ranked by:
1. Number of completed referrals
2. Total rewards earned
3. Conversion rate

---

## Common Use Cases

### 1. Customer Wants Custom Code

```typescript
await createReferralCode({
  userId: customer.id,
  customCode: "JOHNDOE2024",
  discountAmount: 20000, // 200 kr
  discountType: "fixed",
});
```

### 2. Limited-Time Promotion

```typescript
await createReferralCode({
  userId: customer.id,
  discountAmount: 2000, // 20% off
  discountType: "percentage",
  validityDays: 30, // Expires in 30 days
  maxUses: 10, // Max 10 uses
});
```

### 3. Ambassador Program

```typescript
// Create unlimited-use code for brand ambassador
await createReferralCode({
  userId: ambassador.id,
  customCode: "AMBASSADOR",
  discountAmount: 30000, // 300 kr
  discountType: "fixed",
  maxUses: null, // Unlimited
  validityDays: 365,
});
```

### 4. Find Your Best Referrers

```typescript
const topReferrers = await getTopReferrers(10);
// Returns top 10 referrers by conversion count
```

### 5. Calculate Program ROI

```typescript
const roi = await calculateReferralROI();
console.log(`ROI: ${roi.roi.toFixed(2)}%`);
console.log(`Revenue: ${roi.totalRevenueGenerated / 100} kr`);
console.log(`Cost: ${roi.totalRewardsPaid / 100} kr`);
```

---

## Troubleshooting

### Code Validation Fails

**Problem:** Valid code is rejected

**Checklist:**
- ✅ Code is active (`isActive = true`)
- ✅ Current date is after `validFrom`
- ✅ Current date is before `validUntil` (if set)
- ✅ `currentUses < maxUses` (if maxUses set)
- ✅ Code exists in database
- ✅ Code is spelled correctly (case-insensitive)

### Discount Not Applied

**Problem:** Referral code doesn't reduce subscription price

**Debug:**
1. Check `subscription.metadata.referral` contains:
   - `codeId`
   - `discountAmount`
   - `originalPrice`
2. Verify `subscription.monthlyPrice` is reduced
3. Check logs for discount calculation
4. Verify `calculateReferralDiscount()` returns correct amount

### Rewards Not Given

**Problem:** Referrer hasn't received reward

**Checklist:**
- ✅ Referral reward status is "rewarded"
- ✅ Subscription has been active ≥ 1 month
- ✅ `completeReferral()` was called
- ✅ `giveReferralReward()` was called
- ✅ Check `referral_history` for audit trail

---

## Future Enhancements

### Planned Features

- [ ] **Email Notifications**
  - Notify referrer when code is used
  - Notify when referral completes
  - Notify when reward is given

- [ ] **Automated Reward Distribution**
  - Background job to check subscription duration
  - Automatically complete referrals after 1 month
  - Automatically give rewards

- [ ] **Advanced Analytics**
  - Referral source tracking
  - Campaign attribution
  - A/B testing for discount amounts
  - Revenue per referrer

- [ ] **Social Sharing**
  - Pre-built social media posts
  - Facebook/Twitter/LinkedIn integration
  - QR codes for offline sharing

- [ ] **Tiered Rewards**
  - Different rewards based on plan type
  - Bonus rewards for multiple referrals
  - VIP tier for top referrers

---

## Support

### Documentation
- **This Guide:** `/docs/features/REFERRAL_PROGRAM_GUIDE.md`
- **API Docs:** See "API Reference" section above
- **Database Schema:** See "Database Schema" section above

### Code References
- **Backend:** `server/referral-*.ts`, `server/routers/referral-router.ts`
- **Frontend:** `client/src/components/referral/`
- **Tests:** `server/scripts/test-referral-system.ts`

### Testing
```bash
npm run test:referral
```

---

**Last Updated:** 2025-11-18
**Version:** 1.0.0
**Status:** ✅ Production Ready
