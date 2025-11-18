# Email Integration Guide

**Created:** 2025-11-18
**Status:** ✅ Production Ready
**Provider:** SendGrid (Primary), AWS SES (Fallback), SMTP (Legacy)

---

## Overview

Friday AI uses a multi-provider email notification system with automatic failover:
1. **SendGrid** (Primary) - Production-ready, high deliverability
2. **AWS SES** (Fallback) - Requires SDK installation
3. **SMTP** (Legacy) - Requires nodemailer package

---

## ✅ **What's Implemented**

### SendGrid Integration (✅ Complete)
- **File:** `server/notification-service.ts`
- **Status:** Production-ready
- **Features:**
  - HTML email formatting with brand colors
  - Custom metadata tracking
  - Priority-based email headers
  - Automatic error handling
  - Message ID tracking

### Twilio SMS Integration (✅ Complete)
- **File:** `server/notification-service.ts`
- **Status:** Production-ready
- **Features:**
  - Multi-recipient SMS sending
  - Phone number validation
  - 160-character message optimization
  - Batch sending with Promise.allSettled

### Subscription Emails (✅ Complete)
- **File:** `server/subscription-email.ts`
- **Status:** Production-ready, migrated to SendGrid
- **Features:**
  - Welcome emails
  - Renewal invoices
  - Cancellation confirmations
  - Overage warnings (Email + SMS)
  - Upgrade reminders

---

## 🚀 **Quick Start**

### 1. Configure SendGrid

Add to your `.env` file:

```bash
# Email Service Configuration
EMAIL_SERVICE_PROVIDER=sendgrid  # "sendgrid" | "aws-ses" | "smtp"

# SendGrid (Primary Provider)
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here
SENDGRID_FROM_EMAIL=noreply@rendetalje.dk
SENDGRID_FROM_NAME=Rendetalje.dk
```

### 2. Get SendGrid API Key

1. Create account at [https://app.sendgrid.com](https://app.sendgrid.com)
2. Navigate to Settings → API Keys
3. Create new API key with "Mail Send" permissions
4. Copy API key to `.env` file

### 3. Verify Domain (Production)

For production, verify your sending domain:

1. Go to Settings → Sender Authentication
2. Click "Authenticate Your Domain"
3. Follow DNS setup instructions
4. Wait for verification (usually 24-48 hours)

### 4. Test Email Sending

```bash
# Test email integration
npm run test:email-integration

# Test subscription renewal email
npm run test:subscription:email
```

---

## 📧 **Usage Examples**

### Basic Email Notification

```typescript
import { sendNotification } from "./notification-service";

const result = await sendNotification({
  channel: "email",
  priority: "normal",
  title: "Welcome to Friday AI",
  message: "Thanks for signing up!",
  recipients: ["customer@example.com"],
  metadata: {
    userId: "123",
    source: "signup",
  },
});

if (result.success) {
  console.log("Email sent:", result.messageId);
} else {
  console.error("Email failed:", result.error);
}
```

### Subscription Email

```typescript
import { sendSubscriptionEmail } from "./subscription-email";

await sendSubscriptionEmail({
  type: "renewal",
  subscriptionId: 123,
  userId: 456,
});
```

### Overage Warning with SMS

```typescript
await sendSubscriptionEmail({
  type: "overage_warning",
  subscriptionId: 123,
  userId: 456,
  sendSMS: true,  // Also send SMS if phone number available
  additionalData: {
    hoursUsed: 5.5,
    includedHours: 4,
    overageHours: 1.5,
    overageCost: 524,
  },
});
```

---

## 🎨 **Email Templates**

### HTML Email Structure

Emails are automatically formatted with:
- Brand colors (priority-based header)
- Responsive design
- Metadata table (if provided)
- Footer with company info
- Pre-wrapped text formatting

### Priority Colors

| Priority | Color | Use Case |
|----------|-------|----------|
| Critical | Red (#dc2626) | System failures, urgent actions |
| High | Orange (#ea580c) | Overage warnings, payment issues |
| Normal | Blue (#2563eb) | Renewals, confirmations |
| Low | Gray (#6b7280) | Marketing, newsletters |

---

## 📱 **SMS Integration (Optional)**

### Configure Twilio

Add to `.env`:

```bash
# SMS Service Configuration
SMS_SERVICE_PROVIDER=twilio  # "twilio" | "aws-sns"

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token-here
TWILIO_FROM_NUMBER=+4512345678
```

### Usage

```typescript
await sendNotification({
  channel: "sms",
  priority: "high",
  title: "Overage Alert",
  message: "You've exceeded your included hours. Check email for details.",
  recipients: ["+4512345678"],
});
```

---

## 🔄 **Fallback Providers**

### AWS SES (Requires SDK)

To enable AWS SES fallback:

1. Install SDK:
   ```bash
   npm install @aws-sdk/client-ses
   ```

2. Configure credentials:
   ```bash
   EMAIL_SERVICE_PROVIDER=aws-ses
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_SES_REGION=us-east-1
   ```

3. Uncomment AWS SES implementation in `notification-service.ts`

### SMTP (Requires Nodemailer)

For legacy SMTP:

1. Install nodemailer:
   ```bash
   npm install nodemailer
   ```

2. Configure SMTP:
   ```bash
   EMAIL_SERVICE_PROVIDER=smtp
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   ```

3. Implement SMTP in `notification-service.ts`

---

## 📊 **Monitoring & Analytics**

### SendGrid Dashboard

View email analytics at [https://app.sendgrid.com](https://app.sendgrid.com):
- Delivery rates
- Open rates
- Click rates
- Bounce rates
- Spam reports

### Log Monitoring

```bash
# Monitor email logs
npm run logs:email

# View all notification logs
grep "\\[Notifications\\]" logs/*.log
```

### Metadata Tracking

All emails include metadata fields:
- `subscriptionId` - Subscription ID
- `emailType` - Type of email (renewal, overage, etc.)
- `planType` - Subscription plan type
- `customerId` - Customer ID

These can be viewed in SendGrid Event Webhook data.

---

## 🛠️ **Troubleshooting**

### Email Not Sending

1. **Check API Key:**
   ```bash
   echo $SENDGRID_API_KEY
   ```

2. **Verify ENV Configuration:**
   ```typescript
   console.log(ENV.emailServiceProvider);  // Should be "sendgrid"
   console.log(ENV.sendgridApiKey);        // Should not be empty
   ```

3. **Test SendGrid API:**
   ```bash
   npm run test:email-integration
   ```

### Email Goes to Spam

1. **Verify Domain:** Authenticate your sending domain in SendGrid
2. **Check SPF/DKIM:** Ensure DNS records are configured
3. **Monitor Reputation:** Check SendGrid reputation score
4. **Avoid Spam Words:** Remove trigger words from subject/body

### Rate Limiting

SendGrid Free Tier:
- 100 emails/day
- Upgrade for production use

If rate limited:
- Implement email queuing
- Add exponential backoff
- Consider AWS SES (62,000 emails/month free)

---

## 🔐 **Security Best Practices**

1. **API Key Storage:**
   - Never commit API keys to Git
   - Use `.env` files (gitignored)
   - Rotate keys every 90 days

2. **Email Validation:**
   - Validate recipient emails
   - Sanitize user input in email bodies
   - Prevent email injection attacks

3. **Rate Limiting:**
   - Implement sending quotas per user
   - Monitor for abuse patterns
   - Use CAPTCHA for signup forms

4. **Content Security:**
   - Escape HTML in user content
   - Validate URLs in email links
   - Use HTTPS for all links

---

## 📈 **Scaling Considerations**

### High Volume (10k+ emails/day)

1. **Use Email Queue:**
   - Implement Redis/Bull queue
   - Process emails asynchronously
   - Batch sending for efficiency

2. **Multiple Providers:**
   - Load balance across SendGrid + AWS SES
   - Automatic failover on errors
   - Track deliverability per provider

3. **Monitoring:**
   - Track send success rate
   - Alert on delivery failures
   - Monitor bounce rates

---

## 📝 **Changelog**

### 2025-11-18 - Email Integration Complete
- ✅ Migrated subscription emails to SendGrid
- ✅ Added SMS support for overage warnings
- ✅ Created test script for email integration
- ✅ Added comprehensive error handling
- ✅ Implemented HTML email templates
- ✅ Added metadata tracking for analytics

---

## 🔗 **References**

- **SendGrid API Docs:** [https://docs.sendgrid.com/api-reference](https://docs.sendgrid.com/api-reference)
- **Twilio SMS Docs:** [https://www.twilio.com/docs/sms](https://www.twilio.com/docs/sms)
- **Email Best Practices:** [https://sendgrid.com/blog/email-best-practices](https://sendgrid.com/blog/email-best-practices)
- **Notification Service:** `server/notification-service.ts`
- **Subscription Emails:** `server/subscription-email.ts`
- **Test Script:** `server/scripts/test-email-integration.ts`

---

**Last Updated:** 2025-11-18
