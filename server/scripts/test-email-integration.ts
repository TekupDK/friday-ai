/**
 * Test Email Integration
 *
 * Tests SendGrid email sending for subscription notifications
 *
 * Usage:
 *   npm run test:email-integration
 *   or
 *   dotenv -e .env.dev -- tsx server/scripts/test-email-integration.ts
 */

import { sendNotification } from "../notification-service";
import { logger } from "../_core/logger";
import { ENV } from "../_core/env";

async function testEmailIntegration() {
  logger.info("[Email Integration Test] Starting email integration tests");

  // Check environment variables
  if (!ENV.sendgridApiKey) {
    logger.error(
      "[Email Integration Test] SENDGRID_API_KEY not configured - cannot test email sending"
    );
    logger.info(
      "[Email Integration Test] Add SENDGRID_API_KEY to your .env file to test email sending"
    );
    process.exit(1);
  }

  if (!ENV.sendgridFromEmail) {
    logger.error(
      "[Email Integration Test] SENDGRID_FROM_EMAIL not configured"
    );
    process.exit(1);
  }

  logger.info({
    provider: ENV.emailServiceProvider,
    fromEmail: ENV.sendgridFromEmail,
    fromName: ENV.sendgridFromName,
  }, "[Email Integration Test] Email configuration loaded");

  // Test 1: Simple email notification
  logger.info("[Email Integration Test] Test 1: Sending simple notification");

  const testEmail = process.env.TEST_EMAIL || ENV.sendgridFromEmail;

  try {
    const result = await sendNotification({
      channel: "email",
      priority: "normal",
      title: "Test Email - Friday AI",
      message: `This is a test email from Friday AI to verify SendGrid integration.

Sent at: ${new Date().toLocaleString("da-DK")}

If you receive this email, the integration is working correctly!`,
      recipients: [testEmail],
      metadata: {
        testId: `test-${Date.now()}`,
        environment: ENV.isProduction ? "production" : "development",
      },
    });

    if (result.success) {
      logger.info(
        {
          messageId: result.messageId,
          recipient: testEmail,
        },
        "[Email Integration Test] ✅ Test 1 PASSED: Email sent successfully"
      );
    } else {
      logger.error(
        { error: result.error },
        "[Email Integration Test] ❌ Test 1 FAILED: Email sending failed"
      );
      process.exit(1);
    }
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "[Email Integration Test] ❌ Test 1 FAILED: Exception occurred"
    );
    process.exit(1);
  }

  // Test 2: Subscription renewal email (simulated)
  logger.info("[Email Integration Test] Test 2: Sending subscription renewal email");

  try {
    const result = await sendNotification({
      channel: "email",
      priority: "normal",
      title: "Faktura for Premium Abonnement - Rendetalje.dk",
      message: `Hej Test Kunde,

Din månedlige faktura for Premium Abonnement er nu oprettet.

**Dit abonnement:**
- Plan: Premium Abonnement
- Beløb: 1.800 kr
- Inkluderet timer: 4 timer/måned

Fakturaen er sendt til din email og kan også findes i Billy.dk.

**Betalingsfrist:**
14 dage fra faktura dato.

**Spørgsmål?**
Kontakt os gerne hvis du har spørgsmål om din faktura.

Med venlig hilsen,
Rendetalje.dk`,
      recipients: [testEmail],
      metadata: {
        subscriptionId: "test-123",
        emailType: "renewal",
        planType: "tier2",
        testId: `test-${Date.now()}`,
      },
    });

    if (result.success) {
      logger.info(
        {
          messageId: result.messageId,
          recipient: testEmail,
        },
        "[Email Integration Test] ✅ Test 2 PASSED: Renewal email sent successfully"
      );
    } else {
      logger.error(
        { error: result.error },
        "[Email Integration Test] ❌ Test 2 FAILED: Renewal email failed"
      );
      process.exit(1);
    }
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "[Email Integration Test] ❌ Test 2 FAILED: Exception occurred"
    );
    process.exit(1);
  }

  // Test 3: High priority overage warning email
  logger.info("[Email Integration Test] Test 3: Sending overage warning email");

  try {
    const result = await sendNotification({
      channel: "email",
      priority: "high",
      title: "Overskridelse af inkluderede timer - Premium Abonnement",
      message: `Hej Test Kunde,

Vi vil gerne informere dig om at din subscription "Premium Abonnement" har overskredet de inkluderede timer denne måned.

**Brug denne måned:**
- Brugt: 5.5 timer
- Inkluderet: 4 timer
- Overskridelse: 1.5 timer

**Ekstra kost:**
524 kr (1.5 timer × 349 kr/time)

**Hvad betyder det?**
Du vil modtage en ekstra faktura for de overskredne timer.

**Anbefaling:**
Overvej at opgradere dit abonnement for at undgå fremtidige overskridelser.

Med venlig hilsen,
Rendetalje.dk`,
      recipients: [testEmail],
      metadata: {
        subscriptionId: "test-123",
        emailType: "overage_warning",
        hoursUsed: "5.5",
        includedHours: "4",
        overageHours: "1.5",
        testId: `test-${Date.now()}`,
      },
    });

    if (result.success) {
      logger.info(
        {
          messageId: result.messageId,
          recipient: testEmail,
        },
        "[Email Integration Test] ✅ Test 3 PASSED: Overage warning sent successfully"
      );
    } else {
      logger.error(
        { error: result.error },
        "[Email Integration Test] ❌ Test 3 FAILED: Overage warning failed"
      );
      process.exit(1);
    }
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "[Email Integration Test] ❌ Test 3 FAILED: Exception occurred"
    );
    process.exit(1);
  }

  // All tests passed!
  logger.info("");
  logger.info("=".repeat(80));
  logger.info("[Email Integration Test] 🎉 ALL TESTS PASSED!");
  logger.info(`[Email Integration Test] ✅ ${testEmail} should have received 3 test emails`);
  logger.info("[Email Integration Test] Check your inbox to verify email delivery");
  logger.info("=".repeat(80));
  logger.info("");

  process.exit(0);
}

// Run tests
testEmailIntegration().catch(error => {
  logger.error(
    { error: error instanceof Error ? error.message : String(error) },
    "[Email Integration Test] Fatal error"
  );
  process.exit(1);
});
