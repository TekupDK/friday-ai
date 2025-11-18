import axios from "axios";

import { ENV } from "./_core/env";

export type AnalyticsEvent = {
  name: string;
  userId: number | string;
  properties?: Record<string, any>;
  timestamp?: string; // ISO timestamp; default now
};

function parseProviders(): string[] {
  const raw = (ENV.analyticsProvider || "").trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map(p => p.trim().toLowerCase())
    .filter(Boolean);
}

function isEnabled(): boolean {
  return !!ENV.analyticsEnabled && parseProviders().length > 0;
}

async function sendWebhook(evt: AnalyticsEvent) {
  if (!ENV.analyticsWebhookUrl) return;
  try {
    await axios.post(
      ENV.analyticsWebhookUrl,
      {
        appId: ENV.appId,
        event: evt.name,
        userId: evt.userId,
        timestamp: evt.timestamp || new Date().toISOString(),
        properties: evt.properties || {},
      },
      {
        headers: {
          "Content-Type": "application/json",
          ...(ENV.analyticsWebhookSecret
            ? { "x-analytics-secret": ENV.analyticsWebhookSecret }
            : {}),
        },
        timeout: 2500,
      }
    );
  } catch (err) {
    console.warn(
      "[Analytics] Webhook send failed:",
      err instanceof Error ? err.message : String(err)
    );
  }
}

async function sendMixpanel(evt: AnalyticsEvent) {
  if (!ENV.mixpanelToken) return;
  try {
    // Best-effort payload (Mixpanel HTTP Tracking API)
    // Note: For production, consider using official SDK and batch endpoints
    await axios.post(
      "https://api.mixpanel.com/track",
      {
        event: evt.name,
        properties: {
          token: ENV.mixpanelToken,
          distinct_id: String(evt.userId),
          time: Math.floor(Date.now() / 1000),
          ...((evt.properties as any) || {}),
        },
      },
      { timeout: 2500 }
    );
  } catch (err) {
    console.warn(
      "[Analytics] Mixpanel send failed:",
      err instanceof Error ? err.message : String(err)
    );
  }
}

async function sendAmplitude(evt: AnalyticsEvent) {
  if (!ENV.amplitudeApiKey) return;
  try {
    await axios.post(
      "https://api2.amplitude.com/2/httpapi",
      {
        api_key: ENV.amplitudeApiKey,
        events: [
          {
            event_type: evt.name,
            user_id: String(evt.userId),
            event_properties: evt.properties || {},
            time: Date.now(),
          },
        ],
      },
      { timeout: 2500 }
    );
  } catch (err) {
    console.warn(
      "[Analytics] Amplitude send failed:",
      err instanceof Error ? err.message : String(err)
    );
  }
}

/**
 * Track analytics event to configured providers (best-effort, fire-and-forget)
 * - Respects ENV.analyticsEnabled and ANALYTICS_PROVIDER list
 * - Never throws
 */
export async function trackAnalytics(evt: AnalyticsEvent): Promise<void> {
  if (!isEnabled()) return;
  const providers = parseProviders();

  const tasks: Promise<any>[] = [];
  for (const provider of providers) {
    if (provider === "webhook") tasks.push(sendWebhook(evt));
    else if (provider === "mixpanel") tasks.push(sendMixpanel(evt));
    else if (provider === "amplitude") tasks.push(sendAmplitude(evt));
  }

  try {
    await Promise.allSettled(tasks);
  } catch {
    // swallow
  }
}
