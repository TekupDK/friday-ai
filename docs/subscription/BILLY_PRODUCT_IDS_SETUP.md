# Billy.dk Subscription Product IDs Setup Guide

**Created:** 2025-11-18
**Status:** ✅ Configuration Ready

---

## Overview

This guide explains how to create subscription product IDs in Billy.dk and configure them in Friday AI.

---

## Subscription Plans

Friday AI supports 5 subscription plans:

| Plan Type      | Product ID | Name               | Price (kr/month) | Included Hours |
| -------------- | ---------- | ------------------ | ---------------- | -------------- |
| `tier1`        | SUB-001    | Basis Abonnement   | 1,200            | 3              |
| `tier2`        | SUB-002    | Premium Abonnement | 1,800            | 4              |
| `tier3`        | SUB-003    | VIP Abonnement     | 2,500            | 6              |
| `flex_basis`   | SUB-004    | Flex Basis         | 1,000            | 2.5            |
| `flex_plus`    | SUB-005    | Flex Plus          | 1,500            | 4              |

---

## Step 1: Create Products in Billy.dk

1. **Login to Billy.dk**
   - Go to [https://app.billy.dk](https://app.billy.dk)
   - Login with your organization account

2. **Navigate to Products**
   - Click "Settings" or "Indstillinger"
   - Select "Products" or "Produkter"
   - Click "Create New Product" or "Opret nyt produkt"

3. **Create Each Subscription Product**

   For each plan, create a product with these details:

   ### Tier 1 - Basis Abonnement (SUB-001)
   - **Product Code:** SUB-001
   - **Name:** Basis Abonnement
   - **Description:** Månedlig rengøringsabonnement (3 timer inkluderet)
   - **Price:** 1,200 DKK
   - **Unit:** stk (piece)
   - **Account Code:** (your revenue account for subscriptions)

   ### Tier 2 - Premium Abonnement (SUB-002)
   - **Product Code:** SUB-002
   - **Name:** Premium Abonnement
   - **Description:** Premium månedlig rengøringsabonnement (4 timer + hovedrengøring)
   - **Price:** 1,800 DKK
   - **Unit:** stk
   - **Account Code:** (same as Tier 1)

   ### Tier 3 - VIP Abonnement (SUB-003)
   - **Product Code:** SUB-003
   - **Name:** VIP Abonnement
   - **Description:** VIP månedlig rengøringsabonnement (6 timer + hovedrengøring)
   - **Price:** 2,500 DKK
   - **Unit:** stk
   - **Account Code:** (same as Tier 1)

   ### Flex Basis (SUB-004)
   - **Product Code:** SUB-004
   - **Name:** Flex Basis
   - **Description:** Fleksibel rengøringsabonnement (2.5 timer/måned)
   - **Price:** 1,000 DKK
   - **Unit:** stk
   - **Account Code:** (same as Tier 1)

   ### Flex Plus (SUB-005)
   - **Product Code:** SUB-005
   - **Name:** Flex Plus
   - **Description:** Fleksibel rengøringsabonnement (4 timer/måned)
   - **Price:** 1,500 DKK
   - **Unit:** stk
   - **Account Code:** (same as Tier 1)

4. **Note Down Product IDs**
   - After creating each product, Billy.dk will assign it an internal ID
   - This ID will be visible in the product list or product edit page
   - Keep track of these IDs for the next step

---

## Step 2: Configure Environment Variables

1. **Open your .env file**
   ```bash
   # Development
   cp .env.dev.template .env.dev

   # Production
   cp .env.prod.template .env.prod
   ```

2. **Add Product IDs**

   Add the following lines to your `.env` file with the actual product IDs from Billy.dk:

   ```bash
   # Billy.dk Subscription Product IDs
   BILLY_SUBSCRIPTION_TIER1_PRODUCT_ID=<your-product-id-for-SUB-001>
   BILLY_SUBSCRIPTION_TIER2_PRODUCT_ID=<your-product-id-for-SUB-002>
   BILLY_SUBSCRIPTION_TIER3_PRODUCT_ID=<your-product-id-for-SUB-003>
   BILLY_SUBSCRIPTION_FLEX_BASIS_PRODUCT_ID=<your-product-id-for-SUB-004>
   BILLY_SUBSCRIPTION_FLEX_PLUS_PRODUCT_ID=<your-product-id-for-SUB-005>
   ```

   **Example:**
   ```bash
   BILLY_SUBSCRIPTION_TIER1_PRODUCT_ID=abc123def456
   BILLY_SUBSCRIPTION_TIER2_PRODUCT_ID=ghi789jkl012
   BILLY_SUBSCRIPTION_TIER3_PRODUCT_ID=mno345pqr678
   BILLY_SUBSCRIPTION_FLEX_BASIS_PRODUCT_ID=stu901vwx234
   BILLY_SUBSCRIPTION_FLEX_PLUS_PRODUCT_ID=yza567bcd890
   ```

3. **Restart the server**
   ```bash
   npm run dev
   ```

---

## Step 3: Verify Configuration

The subscription system will automatically validate product IDs on startup.

To manually verify:

```typescript
import { validateSubscriptionProductIds } from './server/subscription-config';

const validation = validateSubscriptionProductIds();

if (validation.valid) {
  console.log('✅ All subscription product IDs are configured');
} else {
  console.error('❌ Missing product IDs for plans:', validation.missing);
}
```

---

## How It Works

1. **Product Mapping**
   - The subscription system maps plan types to Billy.dk product IDs
   - See `server/subscription-config.ts` for the mapping logic

2. **Invoice Generation**
   - When a subscription renews, the system creates an invoice in Billy.dk
   - The invoice uses the product ID from the subscription plan
   - Price and description are pulled from the plan configuration

3. **Monthly Billing**
   - Background job runs daily at 9:00 AM (Copenhagen time)
   - Processes all subscriptions with `nextBillingDate <= today`
   - Creates invoices via Billy.dk API
   - Sends renewal confirmation emails

---

## Troubleshooting

### Product ID Not Found
**Error:** "Billy.dk product ID not configured for plan: tier1"

**Solution:**
1. Check your `.env` file has all 5 product IDs
2. Verify product IDs are correct (copy-paste from Billy.dk)
3. Restart the server after updating `.env`

### Invoice Creation Failed
**Error:** "Failed to create Billy.dk invoice"

**Possible causes:**
1. **Invalid product ID** - Product may have been deleted in Billy.dk
2. **API key invalid** - Check `BILLY_API_KEY` is correct
3. **Organization ID mismatch** - Verify `BILLY_ORGANIZATION_ID`

**Solution:**
1. Re-check product IDs in Billy.dk admin panel
2. Test Billy.dk API connection with a simple API call
3. Review server logs for detailed error messages

### Product Price Mismatch
**Issue:** Price in Friday AI doesn't match Billy.dk

**Note:** Friday AI stores subscription prices independently from Billy.dk. This allows for:
- Promotional pricing
- Price changes without modifying Billy.dk products
- Multiple subscription tiers using the same product

**To update prices:**
1. Update `server/subscription-config.ts` → `monthlyPrice` field
2. Optionally update Billy.dk product price (for consistency)

---

## Migration Notes

If you have existing subscriptions before Billy.dk integration:

1. **Create products in Billy.dk** (follow Step 1 above)
2. **Configure environment variables** (follow Step 2 above)
3. **Backfill invoices** (optional):
   ```typescript
   // Create invoices for past billing periods
   import { processMonthlyRenewals } from './server/subscription-jobs';
   await processMonthlyRenewals();
   ```

---

## References

- **Billy.dk API Documentation:** [https://billy.dk/api/](https://billy.dk/api/)
- **Subscription Configuration:** `server/subscription-config.ts`
- **Subscription Helpers:** `server/subscription-helpers.ts`
- **Subscription Actions:** `server/subscription-actions.ts`

---

**Last Updated:** 2025-11-18
