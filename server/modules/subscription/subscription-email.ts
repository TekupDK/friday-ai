/**
 * Subscription Email and SMS Templates
 *
 * Handles email and SMS notifications for subscription events
 * - Email: Sent via SendGrid for all subscription events
 * - SMS: Sent via Twilio for critical overage warnings (optional)
 */

import { eq, and } from "drizzle-orm";

import { customerProfiles, subscriptions } from "../../../drizzle/schema";

import { logger } from "./_core/logger";
import { getDb } from "./db";
import { sendNotification } from "./notification-service";
import { getSubscriptionById } from "./subscription-db";
import { getPlanConfig } from "./subscription-helpers";

export type SubscriptionEmailType =
  | "welcome"
  | "renewal"
  | "cancellation"
  | "overage_warning"
  | "upgrade_reminder";

export interface SendSubscriptionEmailParams {
  type: SubscriptionEmailType;
  subscriptionId: number;
  userId: number;
  additionalData?: Record<string, any>;
  /** Send SMS for critical notifications (optional) */
  sendSMS?: boolean;
}

/**
 * Email templates for subscription events
 */
const EMAIL_TEMPLATES: Record<
  SubscriptionEmailType,
  (data: {
    customerName: string;
    planName: string;
    monthlyPrice: number;
    includedHours: number;
    [key: string]: any;
  }) => { subject: string; body: string }
> = {
  welcome: ({ customerName, planName, monthlyPrice, includedHours }) => ({
    subject: `Velkommen til ${planName} - Rendetalje.dk`,
    body: `Hej ${customerName},

Velkommen til ${planName}!

Vi er glade for at have dig som kunde. Din subscription er nu aktiv, og du vil modtage månedlig rengøring.

**Dit abonnement:**
- Plan: ${planName}
- Pris: ${(monthlyPrice / 100).toLocaleString("da-DK")} kr/måned
- Inkluderet timer: ${includedHours} timer/måned

**Næste rengøring:**
Din første rengøring er planlagt. Du vil modtage en bekræftelse når datoen er fastlagt.

**Spørgsmål?**
Kontakt os gerne hvis du har spørgsmål eller ønsker at ændre dit abonnement.

Med venlig hilsen,
Rendetalje.dk`,
  }),

  renewal: ({ customerName, planName, monthlyPrice, includedHours }) => ({
    subject: `Faktura for ${planName} - Rendetalje.dk`,
    body: `Hej ${customerName},

Din månedlige faktura for ${planName} er nu oprettet.

**Dit abonnement:**
- Plan: ${planName}
- Beløb: ${(monthlyPrice / 100).toLocaleString("da-DK")} kr
- Inkluderet timer: ${includedHours} timer/måned

Fakturaen er sendt til din email og kan også findes i Billy.dk.

**Betalingsfrist:**
14 dage fra faktura dato.

**Spørgsmål?**
Kontakt os gerne hvis du har spørgsmål om din faktura.

Med venlig hilsen,
Rendetalje.dk`,
  }),

  cancellation: ({ customerName, planName }) => ({
    subject: `Bekræftelse: ${planName} opsagt - Rendetalje.dk`,
    body: `Hej ${customerName},

Vi bekræfter at din subscription "${planName}" er blevet opsagt.

**Opsigelsesdato:**
${new Date().toLocaleDateString("da-DK", {
  year: "numeric",
  month: "long",
  day: "numeric",
})}

**Hvad sker der nu?**
- Din subscription vil fortsætte indtil slutningen af den nuværende faktureringsperiode
- Du vil modtage en slutningsfaktura hvis der er ubetalt balance
- Alle fremtidige bookinger er annulleret

**Vi håber at se dig igen!**
Hvis du ønsker at genoptage dit abonnement, er du velkommen til at kontakte os.

Med venlig hilsen,
Rendetalje.dk`,
  }),

  overage_warning: ({
    customerName,
    planName,
    hoursUsed,
    includedHours,
    overageHours,
    overageCost,
  }) => ({
    subject: `Overskridelse af inkluderede timer - ${planName}`,
    body: `Hej ${customerName},

Vi vil gerne informere dig om at din subscription "${planName}" har overskredet de inkluderede timer denne måned.

**Brug denne måned:**
- Brugt: ${hoursUsed.toFixed(1)} timer
- Inkluderet: ${includedHours} timer
- Overskridelse: ${overageHours.toFixed(1)} timer

**Ekstra kost:**
${overageCost.toLocaleString("da-DK")} kr (${overageHours.toFixed(1)} timer × 349 kr/time)

**Hvad betyder det?**
Du vil modtage en ekstra faktura for de overskredne timer.

**Anbefaling:**
Overvej at opgradere dit abonnement for at undgå fremtidige overskridelser.

**Spørgsmål?**
Kontakt os gerne hvis du har spørgsmål.

Med venlig hilsen,
Rendetalje.dk`,
  }),

  upgrade_reminder: ({ customerName, planName, recommendedPlan }) => ({
    subject: `Anbefaling: Opgrader dit abonnement - Rendetalje.dk`,
    body: `Hej ${customerName},

Baseret på dit brugsmønster, anbefaler vi at opgradere dit abonnement.

**Dit nuværende abonnement:**
${planName}

**Anbefalet abonnement:**
${recommendedPlan}

**Fordele ved opgradering:**
- Flere inkluderede timer
- Bedre værdi
- Undgå overage costs

**Interesseret?**
Kontakt os gerne for at diskutere opgradering.

Med venlig hilsen,
Rendetalje.dk`,
  }),
};

/**
 * Send subscription email
 */
export async function sendSubscriptionEmail(
  params: SendSubscriptionEmailParams
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, error: "Database connection failed" };
    }

    // Get subscription
    const subscription = await getSubscriptionById(
      params.subscriptionId,
      params.userId
    );

    if (!subscription) {
      return { success: false, error: "Subscription not found" };
    }

    // Get customer
    const [customer] = await db
      .select()
      .from(customerProfiles)
      .where(
        and(
          eq(customerProfiles.id, subscription.customerProfileId),
          eq(customerProfiles.userId, params.userId)
        )
      )
      .limit(1);

    if (!customer || !customer.email) {
      return { success: false, error: "Customer not found or no email" };
    }

    // Get plan config
    const planConfig = getPlanConfig(
      subscription.planType as any
    );

    // Prepare email data
    const emailData = {
      customerName: customer.name || customer.email,
      planName: planConfig.name,
      monthlyPrice: subscription.monthlyPrice,
      includedHours: Number(subscription.includedHours),
      ...params.additionalData,
    };

    // Get template
    const template = EMAIL_TEMPLATES[params.type];
    if (!template) {
      return {
        success: false,
        error: `Unknown email type: ${params.type}`,
      };
    }

    const { subject, body } = template(emailData);

    // Send email via notification service (SendGrid)
    // This provides better deliverability, tracking, and analytics
    const result = await sendNotification({
      channel: "email",
      priority: params.type === "overage_warning" ? "high" : "normal",
      title: subject,
      message: body,
      recipients: [customer.email],
      metadata: {
        subscriptionId: params.subscriptionId.toString(),
        emailType: params.type,
        planType: subscription.planType,
        customerId: customer.id.toString(),
      },
    });

    if (!result.success) {
      logger.warn(
        {
          subscriptionId: params.subscriptionId,
          userId: params.userId,
          emailType: params.type,
          error: result.error,
        },
        "[Subscription Email] Email notification failed"
      );
      return {
        success: false,
        error: result.error || "Failed to send email notification",
      };
    }

    logger.info(
      {
        subscriptionId: params.subscriptionId,
        userId: params.userId,
        emailType: params.type,
        customerEmail: customer.email,
        messageId: result.messageId,
      },
      "[Subscription Email] Successfully sent email"
    );

    // Send SMS for critical overage warnings (if phone number available and SMS enabled)
    if (
      params.sendSMS &&
      params.type === "overage_warning" &&
      customer.phone
    ) {
      const smsMessage = `Rendetalje: Du har overskredet dine inkluderede timer. Se email for detaljer.`;

      const smsResult = await sendNotification({
        channel: "sms",
        priority: "high",
        title: "Overskridelse af timer",
        message: smsMessage,
        recipients: [customer.phone],
        metadata: {
          subscriptionId: params.subscriptionId.toString(),
          emailType: params.type,
        },
      });

      if (smsResult.success) {
        logger.info(
          {
            subscriptionId: params.subscriptionId,
            customerPhone: customer.phone,
            messageId: smsResult.messageId,
          },
          "[Subscription Email] Successfully sent SMS notification"
        );
      } else {
        logger.warn(
          {
            subscriptionId: params.subscriptionId,
            error: smsResult.error,
          },
          "[Subscription Email] Failed to send SMS notification (non-critical)"
        );
      }
    }

    return { success: true };
  } catch (error) {
    logger.error(
      {
        subscriptionId: params.subscriptionId,
        userId: params.userId,
        emailType: params.type,
        error: error instanceof Error ? error.message : String(error),
      },
      "[Subscription Email] Failed to send email"
    );

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

