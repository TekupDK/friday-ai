# Referral Program - Quick Start Guide

**5-Minute Setup** ⚡

---

## Step 1: Database Migration (2 min)

Run migration to create tables:

```bash
npm run db:push:dev
```

✅ Creates 3 tables: `referral_codes`, `referral_rewards`, `referral_history`

---

## Step 2: Add Route (1 min)

Add to your router configuration:

```typescript
import { ReferralPage } from "@/pages/ReferralPage";

{
  path: "/referrals",
  element: <ReferralPage />,
}
```

---

## Step 3: Add Navigation Link (30 sec)

Add to your navigation menu:

```typescript
{
  name: "Referral Program",
  href: "/referrals",
  icon: GiftIcon,
}
```

---

## Step 4: Test It (1 min)

```bash
npm run test:referral
```

✅ Should see: "ALL TESTS PASSED!"

---

## Step 5: Integrate in Signup (30 sec)

Add to subscription form:

```typescript
import { ReferralCodeInput } from "@/components/referral";

<ReferralCodeInput
  value={referralCode}
  onChange={setReferralCode}
/>

// In subscription creation:
createSubscription({
  ...data,
  referralCode,  // ← Add this
})
```

---

## Done! 🎉

**Your referral program is ready:**

✅ Users can create referral codes at `/referrals`
✅ New customers get 200 kr discount
✅ Referrers earn 200 kr per successful referral
✅ Full analytics dashboard
✅ Leaderboard for gamification

---

## Next Steps

📖 **Read Full Guide:** `/docs/features/REFERRAL_PROGRAM_GUIDE.md`

🔧 **Customize Config:** Modify `REFERRAL_CONFIG` in `server/referral-helpers.ts`

📧 **Setup Emails:** Configure SendGrid notifications (optional)

🤖 **Automate Rewards:** Setup cron job for automated reward distribution (optional)

---

## Need Help?

Run tests:
```bash
npm run test:referral
```

Check logs:
```bash
# Look for [Referral] prefix in server logs
```

View database:
```sql
SELECT * FROM friday_ai.referral_codes;
SELECT * FROM friday_ai.referral_rewards;
```

---

**Documentation:** `/docs/features/REFERRAL_PROGRAM_GUIDE.md`
**Support:** Check the troubleshooting section in the full guide
