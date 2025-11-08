/**
 * Notification Service
 * Sends notifications via email, Slack, and webhooks
 */

export type NotificationChannel = 'email' | 'slack' | 'webhook' | 'sms';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

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
export async function sendNotification(notification: Notification): Promise<NotificationResult> {
  console.log(`[Notifications] 📨 Sending ${notification.priority} notification via ${notification.channel}:`, notification.title);

  try {
    switch (notification.channel) {
      case 'email':
        return await sendEmailNotification(notification);
      case 'slack':
        return await sendSlackNotification(notification);
      case 'webhook':
        return await sendWebhookNotification(notification);
      case 'sms':
        return await sendSMSNotification(notification);
      default:
        throw new Error(`Unsupported notification channel: ${notification.channel}`);
    }
  } catch (error) {
    console.error(`[Notifications] Error sending ${notification.channel} notification:`, error);
    return {
      success: false,
      channel: notification.channel,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send email notification
 */
async function sendEmailNotification(notification: Notification): Promise<NotificationResult> {
  // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
  // For now, just log
  console.log('[Notifications] 📧 Email notification:', {
    to: notification.recipients,
    subject: notification.title,
    body: notification.message,
  });

  return {
    success: true,
    channel: 'email',
    messageId: `email-${Date.now()}`,
  };
}

/**
 * Send Slack notification
 */
async function sendSlackNotification(notification: Notification): Promise<NotificationResult> {
  const slackWebhook = process.env.SLACK_WEBHOOK_URL;
  
  if (!slackWebhook) {
    console.warn('[Notifications] Slack webhook URL not configured');
    return {
      success: false,
      channel: 'slack',
      error: 'Slack webhook not configured',
    };
  }

  // Format message for Slack
  const slackMessage = {
    text: notification.title,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: notification.title,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: notification.message,
        },
      },
      ...(notification.metadata ? [{
        type: 'section',
        fields: Object.entries(notification.metadata).map(([key, value]) => ({
          type: 'mrkdwn',
          text: `*${key}:*\n${value}`,
        })),
      }] : []),
    ],
    // Color based on priority
    attachments: [{
      color: notification.priority === 'critical' ? 'danger' :
             notification.priority === 'high' ? 'warning' :
             notification.priority === 'normal' ? 'good' : '#808080',
    }],
  };

  try {
    const response = await fetch(slackWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackMessage),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.statusText}`);
    }

    return {
      success: true,
      channel: 'slack',
      messageId: `slack-${Date.now()}`,
    };
  } catch (error) {
    return {
      success: false,
      channel: 'slack',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send webhook notification
 */
async function sendWebhookNotification(notification: Notification): Promise<NotificationResult> {
  const webhookUrl = process.env.WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('[Notifications] Webhook URL not configured');
    return {
      success: false,
      channel: 'webhook',
      error: 'Webhook URL not configured',
    };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Notification-Priority': notification.priority,
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
      channel: 'webhook',
      messageId: `webhook-${Date.now()}`,
    };
  } catch (error) {
    return {
      success: false,
      channel: 'webhook',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send SMS notification (via Twilio or similar)
 */
async function sendSMSNotification(notification: Notification): Promise<NotificationResult> {
  // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
  console.log('[Notifications] 📱 SMS notification:', {
    to: notification.recipients,
    message: `${notification.title}: ${notification.message}`,
  });

  return {
    success: true,
    channel: 'sms',
    messageId: `sms-${Date.now()}`,
  };
}

/**
 * Send notification to multiple channels
 */
export async function sendMultiChannelNotification(
  notification: Omit<Notification, 'channel'>,
  channels: NotificationChannel[]
): Promise<NotificationResult[]> {
  const results = await Promise.all(
    channels.map(channel =>
      sendNotification({ ...notification, channel })
    )
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
    channel: 'slack',
    priority: 'normal',
    title: '🎯 New Lead Detected',
    message: `A new lead has been detected from ${leadData.source}`,
    metadata: {
      'Lead ID': leadData.id,
      'Source': leadData.source,
      'Confidence': `${leadData.confidence}%`,
      'Email': leadData.email,
    },
  }),

  /**
   * A/B test rollback triggered
   */
  rollbackTriggered: (testName: string, reason: string, metrics: any): Notification => ({
    channel: 'slack',
    priority: 'critical',
    title: '🚨 A/B Test Rollback Triggered',
    message: `Test "${testName}" has been automatically rolled back due to: ${reason}`,
    metadata: {
      'Test Name': testName,
      'Reason': reason,
      'Error Rate': `${(metrics.variantErrorRate * 100).toFixed(2)}%`,
      'Response Time': `${metrics.variantResponseTime}ms`,
      'Sample Size': metrics.sampleSize,
    },
  }),

  /**
   * High-value lead detected
   */
  highValueLead: (leadData: any): Notification => ({
    channel: 'email',
    priority: 'high',
    title: '💎 High-Value Lead Detected',
    message: `A high-value lead worth ${leadData.estimatedValue} has been detected and requires immediate attention.`,
    metadata: {
      'Lead ID': leadData.id,
      'Estimated Value': leadData.estimatedValue,
      'Source': leadData.source,
      'Location': leadData.location,
    },
    recipients: ['sales@company.com'],
  }),

  /**
   * Workflow automation error
   */
  workflowError: (step: string, error: string): Notification => ({
    channel: 'slack',
    priority: 'high',
    title: '⚠️ Workflow Automation Error',
    message: `Error in workflow step "${step}": ${error}`,
    metadata: {
      'Step': step,
      'Error': error,
      'Timestamp': new Date().toISOString(),
    },
  }),

  /**
   * Invoice created
   */
  invoiceCreated: (invoiceData: any): Notification => ({
    channel: 'email',
    priority: 'normal',
    title: '📄 Invoice Created',
    message: `Invoice ${invoiceData.invoiceNumber} has been automatically created for ${invoiceData.customerName}`,
    metadata: {
      'Invoice Number': invoiceData.invoiceNumber,
      'Customer': invoiceData.customerName,
      'Amount': `${invoiceData.amount} ${invoiceData.currency}`,
      'Due Date': invoiceData.dueDate,
    },
    recipients: [invoiceData.customerEmail],
  }),

  /**
   * Calendar event booked
   */
  eventBooked: (eventData: any): Notification => ({
    channel: 'email',
    priority: 'normal',
    title: '📅 Meeting Scheduled',
    message: `A ${eventData.type} meeting has been scheduled for ${eventData.date} at ${eventData.time}`,
    metadata: {
      'Type': eventData.type,
      'Date': eventData.date,
      'Time': eventData.time,
      'Location': eventData.location,
      'Attendees': eventData.attendees.join(', '),
    },
    recipients: eventData.attendees,
  }),
};
