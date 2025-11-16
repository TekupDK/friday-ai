/**
 * Notification Service
 * Sends notifications via email, Slack, and webhooks
 */

export type NotificationChannel = "email" | "slack" | "webhook" | "sms";
export type NotificationPriority = "low" | "normal" | "high" | "critical";

export interface Notification {
  channel: NotificationChannel;
  priority: NotificationPriority;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  recipients?: string[];
}

export interface NotificationResult {
  success: boolean;
  channel: NotificationChannel;
  messageId?: string;
  error?: string;
}

/**
 * Send notification through specified channel
 */
export async function sendNotification(
  notification: Notification
): Promise<NotificationResult> {
  const { logger } = await import("./_core/logger");
  logger.info(
    {
      priority: notification.priority,
      channel: notification.channel,
      title: notification.title,
    },
    `[Notifications] 📨 Sending ${notification.priority} notification via ${notification.channel}`
  );

  try {
    switch (notification.channel) {
      case "email":
        return await sendEmailNotification(notification);
      case "slack":
        return await sendSlackNotification(notification);
      case "webhook":
        return await sendWebhookNotification(notification);
      case "sms":
        return await sendSMSNotification(notification);
      default:
        throw new Error(
          `Unsupported notification channel: ${notification.channel}`
        );
    }
  } catch (error) {
    logger.error(
      { err: error, channel: notification.channel },
      `[Notifications] Error sending ${notification.channel} notification`
    );
    return {
      success: false,
      channel: notification.channel,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send email notification via SendGrid, AWS SES, or SMTP
 */
async function sendEmailNotification(
  notification: Notification
): Promise<NotificationResult> {
  const { logger } = await import("./_core/logger");
  const { ENV } = await import("./_core/env");

  // Validate recipients
  if (!notification.recipients || notification.recipients.length === 0) {
    logger.warn("[Notifications] No recipients specified for email notification");
    return {
      success: false,
      channel: "email",
      error: "No recipients specified",
    };
  }

  try {
    switch (ENV.emailServiceProvider) {
      case "sendgrid":
        return await sendEmailViaSendGrid(notification);
      case "aws-ses":
        return await sendEmailViaAWSSES(notification);
      case "smtp":
        return await sendEmailViaSMTP(notification);
      default:
        logger.warn(
          { provider: ENV.emailServiceProvider },
          "[Notifications] Unknown email provider, falling back to logging"
        );
        // Fallback to logging if provider not configured
        logger.info(
          {
            recipients: notification.recipients,
            subject: notification.title,
            body: notification.message,
          },
          "[Notifications] 📧 Email notification (not sent - provider not configured)"
        );
        return {
          success: false,
          channel: "email",
          error: `Email provider "${ENV.emailServiceProvider}" not configured`,
        };
    }
  } catch (error) {
    logger.error(
      { err: error, provider: ENV.emailServiceProvider },
      "[Notifications] Error sending email notification"
    );
    return {
      success: false,
      channel: "email",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send email via SendGrid API
 */
async function sendEmailViaSendGrid(
  notification: Notification
): Promise<NotificationResult> {
  const { logger } = await import("./_core/logger");
  const { ENV } = await import("./_core/env");

  if (!ENV.sendgridApiKey) {
    logger.warn("[Notifications] SendGrid API key not configured");
    return {
      success: false,
      channel: "email",
      error: "SendGrid API key not configured",
    };
  }

  // Build email payload with proper typing for SendGrid API
  const personalization: {
    to: Array<{ email: string }>;
    subject: string;
    custom_args?: Record<string, string>;
  } = {
    to: notification.recipients!.map(email => ({ email })),
    subject: notification.title,
  };

  // Add metadata as custom fields if available
  if (notification.metadata && Object.keys(notification.metadata).length > 0) {
    personalization.custom_args = Object.entries(
      notification.metadata
    ).reduce((acc, [key, value]) => {
      acc[`notification_${key.toLowerCase().replace(/\s+/g, "_")}`] =
        String(value);
      return acc;
    }, {} as Record<string, string>);
  }

  const emailData = {
    personalizations: [personalization],
    from: {
      email: ENV.sendgridFromEmail,
      name: ENV.sendgridFromName,
    },
    content: [
      {
        type: "text/plain",
        value: notification.message,
      },
      {
        type: "text/html",
        value: formatEmailHTML(notification),
      },
    ],
  };

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ENV.sendgridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `SendGrid API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const messageId = response.headers.get("x-message-id") || `sg-${Date.now()}`;

    logger.info(
      {
        messageId,
        recipients: notification.recipients,
        subject: notification.title,
      },
      "[Notifications] 📧 Email sent via SendGrid"
    );

    return {
      success: true,
      channel: "email",
      messageId,
    };
  } catch (error) {
    logger.error(
      { err: error, recipients: notification.recipients },
      "[Notifications] SendGrid API error"
    );
    throw error;
  }
}

/**
 * Send email via AWS SES
 */
async function sendEmailViaAWSSES(
  notification: Notification
): Promise<NotificationResult> {
  const { logger } = await import("./_core/logger");
  const { ENV } = await import("./_core/env");

  if (!ENV.awsAccessKeyId || !ENV.awsSecretAccessKey) {
    logger.warn("[Notifications] AWS SES credentials not configured");
    return {
      success: false,
      channel: "email",
      error: "AWS SES credentials not configured",
    };
  }

  // Note: AWS SES SDK would be imported here
  // For now, return error indicating implementation needed
  logger.warn("[Notifications] AWS SES implementation pending");
  return {
    success: false,
    channel: "email",
    error: "AWS SES implementation pending - use SendGrid or SMTP",
  };
}

/**
 * Send email via SMTP
 */
async function sendEmailViaSMTP(
  notification: Notification
): Promise<NotificationResult> {
  const { logger } = await import("./_core/logger");
  const { ENV } = await import("./_core/env");

  if (!ENV.smtpHost || !ENV.smtpUser || !ENV.smtpPassword) {
    logger.warn("[Notifications] SMTP credentials not configured");
    return {
      success: false,
      channel: "email",
      error: "SMTP credentials not configured",
    };
  }

  // Note: SMTP library (like nodemailer) would be used here
  // For now, return error indicating implementation needed
  logger.warn("[Notifications] SMTP implementation pending");
  return {
    success: false,
    channel: "email",
    error: "SMTP implementation pending - use SendGrid",
  };
}

/**
 * Format notification as HTML email
 */
function formatEmailHTML(notification: Notification): string {
  const priorityColors: Record<NotificationPriority, string> = {
    critical: "#dc2626",
    high: "#ea580c",
    normal: "#2563eb",
    low: "#6b7280",
  };

  const color = priorityColors[notification.priority] || "#6b7280";

  let metadataHTML = "";
  if (notification.metadata && Object.keys(notification.metadata).length > 0) {
    metadataHTML = `
      <table style="margin-top: 20px; border-collapse: collapse; width: 100%;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="padding: 8px; text-align: left; border: 1px solid #e5e7eb;">Key</th>
            <th style="padding: 8px; text-align: left; border: 1px solid #e5e7eb;">Value</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(notification.metadata)
            .map(
              ([key, value]) => `
            <tr>
              <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 600;">${key}</td>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">${value}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="border-left: 4px solid ${color}; padding-left: 16px; margin-bottom: 20px;">
          <h2 style="margin: 0; color: ${color}; font-size: 24px;">${notification.title}</h2>
          <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">${notification.priority} Priority</p>
        </div>
        <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; white-space: pre-wrap;">${notification.message}</p>
        </div>
        ${metadataHTML}
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          This is an automated notification from Friday AI (Rendetalje.dk)
        </p>
      </body>
    </html>
  `;
}

/**
 * Send Slack notification
 */
async function sendSlackNotification(
  notification: Notification
): Promise<NotificationResult> {
  const slackWebhook = process.env.SLACK_WEBHOOK_URL;
  const { logger } = await import("./_core/logger");

  if (!slackWebhook) {
    logger.warn("[Notifications] Slack webhook URL not configured");
    return {
      success: false,
      channel: "slack",
      error: "Slack webhook not configured",
    };
  }

  // Format message for Slack
  const slackMessage = {
    text: notification.title,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: notification.title,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: notification.message,
        },
      },
      ...(notification.metadata
        ? [
            {
              type: "section",
              fields: Object.entries(notification.metadata).map(
                ([key, value]) => ({
                  type: "mrkdwn",
                  text: `*${key}:*\n${value}`,
                })
              ),
            },
          ]
        : []),
    ],
    // Color based on priority
    attachments: [
      {
        color:
          notification.priority === "critical"
            ? "danger"
            : notification.priority === "high"
              ? "warning"
              : notification.priority === "normal"
                ? "good"
                : "#808080",
      },
    ],
  };

  try {
    const response = await fetch(slackWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slackMessage),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.statusText}`);
    }

    return {
      success: true,
      channel: "slack",
      messageId: `slack-${Date.now()}`,
    };
  } catch (error) {
    return {
      success: false,
      channel: "slack",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send webhook notification
 */
async function sendWebhookNotification(
  notification: Notification
): Promise<NotificationResult> {
  const webhookUrl = process.env.WEBHOOK_URL;
  const { logger } = await import("./_core/logger");

  if (!webhookUrl) {
    logger.warn("[Notifications] Webhook URL not configured");
    return {
      success: false,
      channel: "webhook",
      error: "Webhook URL not configured",
    };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Notification-Priority": notification.priority,
      },
      body: JSON.stringify({
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        timestamp: new Date().toISOString(),
        metadata: notification.metadata,
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook error: ${response.statusText}`);
    }

    return {
      success: true,
      channel: "webhook",
      messageId: `webhook-${Date.now()}`,
    };
  } catch (error) {
    return {
      success: false,
      channel: "webhook",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send SMS notification via Twilio, AWS SNS, or SMTP
 */
async function sendSMSNotification(
  notification: Notification
): Promise<NotificationResult> {
  const { logger } = await import("./_core/logger");
  const { ENV } = await import("./_core/env");

  // Validate recipients
  if (!notification.recipients || notification.recipients.length === 0) {
    logger.warn("[Notifications] No recipients specified for SMS notification");
    return {
      success: false,
      channel: "sms",
      error: "No recipients specified",
    };
  }

  // Validate phone numbers (basic format check)
  const phoneNumbers = notification.recipients.filter(phone => {
    // Basic validation: should contain digits and be 10+ characters
    const cleaned = phone.replace(/[\s\-\(\)]/g, "");
    return /^\+?[1-9]\d{9,14}$/.test(cleaned);
  });

  if (phoneNumbers.length === 0) {
    logger.warn(
      { recipients: notification.recipients },
      "[Notifications] No valid phone numbers found"
    );
    return {
      success: false,
      channel: "sms",
      error: "No valid phone numbers found",
    };
  }

  try {
    switch (ENV.smsServiceProvider) {
      case "twilio":
        return await sendSMSViaTwilio(notification, phoneNumbers);
      case "aws-sns":
        return await sendSMSViaAWSSNS(notification, phoneNumbers);
      default:
        logger.warn(
          { provider: ENV.smsServiceProvider },
          "[Notifications] Unknown SMS provider, falling back to logging"
        );
        // Fallback to logging if provider not configured
        logger.info(
          {
            recipients: phoneNumbers,
            message: `${notification.title}: ${notification.message}`,
          },
          "[Notifications] 📱 SMS notification (not sent - provider not configured)"
        );
        return {
          success: false,
          channel: "sms",
          error: `SMS provider "${ENV.smsServiceProvider}" not configured`,
        };
    }
  } catch (error) {
    logger.error(
      { err: error, provider: ENV.smsServiceProvider },
      "[Notifications] Error sending SMS notification"
    );
    return {
      success: false,
      channel: "sms",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send SMS via Twilio API
 */
async function sendSMSViaTwilio(
  notification: Notification,
  phoneNumbers: string[]
): Promise<NotificationResult> {
  const { logger } = await import("./_core/logger");
  const { ENV } = await import("./_core/env");

  if (!ENV.twilioAccountSid || !ENV.twilioAuthToken || !ENV.twilioFromNumber) {
    logger.warn("[Notifications] Twilio credentials not configured");
    return {
      success: false,
      channel: "sms",
      error: "Twilio credentials not configured",
    };
  }

  try {
    // Build SMS message (SMS has 160 character limit per segment)
    const smsMessage = `${notification.title}: ${notification.message}`.substring(0, 1600); // Max 10 segments

    // Send SMS to all recipients
    const results = await Promise.allSettled(
      phoneNumbers.map(async phoneNumber => {
        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${ENV.twilioAccountSid}/Messages.json`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${Buffer.from(`${ENV.twilioAccountSid}:${ENV.twilioAuthToken}`).toString("base64")}`,
            },
            body: new URLSearchParams({
              From: ENV.twilioFromNumber,
              To: phoneNumber,
              Body: smsMessage,
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Twilio API error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        return {
          phoneNumber,
          messageId: data.sid,
        };
      })
    );

    const successCount = results.filter(r => r.status === "fulfilled").length;
    const failureCount = results.filter(r => r.status === "rejected").length;

    if (successCount === 0) {
      const firstError = results.find(r => r.status === "rejected");
      throw new Error(
        firstError?.status === "rejected"
          ? firstError.reason.message
          : "All SMS sends failed"
      );
    }

    logger.info(
      {
        successCount,
        failureCount,
        totalRecipients: phoneNumbers.length,
      },
      "[Notifications] 📱 SMS sent via Twilio"
    );

    return {
      success: true,
      channel: "sms",
      messageId: `twilio-${Date.now()}`,
    };
  } catch (error) {
    logger.error(
      { err: error, recipients: phoneNumbers },
      "[Notifications] Error sending SMS via Twilio"
    );
    return {
      success: false,
      channel: "sms",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send SMS via AWS SNS
 */
async function sendSMSViaAWSSNS(
  notification: Notification,
  phoneNumbers: string[]
): Promise<NotificationResult> {
  const { logger } = await import("./_core/logger");
  const { ENV } = await import("./_core/env");

  if (!ENV.awsAccessKeyId || !ENV.awsSecretAccessKey) {
    logger.warn("[Notifications] AWS SNS credentials not configured");
    return {
      success: false,
      channel: "sms",
      error: "AWS SNS credentials not configured",
    };
  }

  // Note: AWS SNS SDK would be imported here
  // For now, return error indicating implementation needed
  logger.warn("[Notifications] AWS SNS implementation pending");
  return {
    success: false,
    channel: "sms",
    error: "AWS SNS implementation pending - use Twilio",
  };
}

/**
 * Send notification to multiple channels
 */
export async function sendMultiChannelNotification(
  notification: Omit<Notification, "channel">,
  channels: NotificationChannel[]
): Promise<NotificationResult[]> {
  const results = await Promise.all(
    channels.map(channel => sendNotification({ ...notification, channel }))
  );

  return results;
}

/**
 * Predefined notification templates
 */
export const NotificationTemplates = {
  /**
   * New lead detected
   */
  newLead: (leadData: any): Notification => ({
    channel: "slack",
    priority: "normal",
    title: "🎯 New Lead Detected",
    message: `A new lead has been detected from ${leadData.source}`,
    metadata: {
      "Lead ID": leadData.id,
      Source: leadData.source,
      Confidence: `${leadData.confidence}%`,
      Email: leadData.email,
    },
  }),

  /**
   * A/B test rollback triggered
   */
  rollbackTriggered: (
    testName: string,
    reason: string,
    metrics: any
  ): Notification => ({
    channel: "slack",
    priority: "critical",
    title: "🚨 A/B Test Rollback Triggered",
    message: `Test "${testName}" has been automatically rolled back due to: ${reason}`,
    metadata: {
      "Test Name": testName,
      Reason: reason,
      "Error Rate": `${(metrics.variantErrorRate * 100).toFixed(2)}%`,
      "Response Time": `${metrics.variantResponseTime}ms`,
      "Sample Size": metrics.sampleSize,
    },
  }),

  /**
   * High-value lead detected
   */
  highValueLead: (leadData: any): Notification => ({
    channel: "email",
    priority: "high",
    title: "💎 High-Value Lead Detected",
    message: `A high-value lead worth ${leadData.estimatedValue} has been detected and requires immediate attention.`,
    metadata: {
      "Lead ID": leadData.id,
      "Estimated Value": leadData.estimatedValue,
      Source: leadData.source,
      Location: leadData.location,
    },
    recipients: ["sales@company.com"],
  }),

  /**
   * Workflow automation error
   */
  workflowError: (step: string, error: string): Notification => ({
    channel: "slack",
    priority: "high",
    title: "⚠️ Workflow Automation Error",
    message: `Error in workflow step "${step}": ${error}`,
    metadata: {
      Step: step,
      Error: error,
      Timestamp: new Date().toISOString(),
    },
  }),

  /**
   * Invoice created
   */
  invoiceCreated: (invoiceData: any): Notification => ({
    channel: "email",
    priority: "normal",
    title: "📄 Invoice Created",
    message: `Invoice ${invoiceData.invoiceNumber} has been automatically created for ${invoiceData.customerName}`,
    metadata: {
      "Invoice Number": invoiceData.invoiceNumber,
      Customer: invoiceData.customerName,
      Amount: `${invoiceData.amount} ${invoiceData.currency}`,
      "Due Date": invoiceData.dueDate,
    },
    recipients: [invoiceData.customerEmail],
  }),

  /**
   * Calendar event booked
   */
  eventBooked: (eventData: any): Notification => ({
    channel: "email",
    priority: "normal",
    title: "📅 Meeting Scheduled",
    message: `A ${eventData.type} meeting has been scheduled for ${eventData.date} at ${eventData.time}`,
    metadata: {
      Type: eventData.type,
      Date: eventData.date,
      Time: eventData.time,
      Location: eventData.location,
      Attendees: eventData.attendees.join(", "),
    },
    recipients: eventData.attendees,
  }),
};
