/**
 * AI Configuration - Friday AI
 * 
 * Shortwave-inspired design with Friday's Danish work personality
 * Think: Cascade for business tasks (emails, calendar, invoices, leads)
 */

export const AI_CONFIG = {
  // AI Assistant Identity
  assistant: {
    name: "Friday",
    tagline: "Din danske executive assistant",
    role: "Professionel arbejdspartner til Rendetalje",
  },
  
  // Model configuration - OpenRouter + Gemma 3 27B Free
  model: {
    name: "Gemma 3 27B Free",
    provider: "OpenRouter",
    mode: "Standard",
    displayText: "Gemma 3 27B Free via OpenRouter",
    apiEndpoint: "https://openrouter.ai/api/v1/chat/completions",
    modelId: "google/gemma-3-27b-it:free",
  },
  
  // Available integrations
  integrations: [
    {
      id: "gmail",
      name: "Gmail",
      enabled: true,
      toolCount: 15,
    },
    {
      id: "calendar",
      name: "Google Calendar",
      enabled: true,
      toolCount: 8,
    },
    {
      id: "billy",
      name: "Billy Accounting",
      enabled: true,
      toolCount: 12,
    },
  ],
  
  // Get integration summary text
  getIntegrationSummary() {
    const enabledIntegrations = this.integrations.filter(i => i.enabled);
    const totalTools = enabledIntegrations.reduce((sum, i) => sum + i.toolCount, 0);
    const names = enabledIntegrations.map(i => i.name).join(", ");
    return `${names} (${totalTools} tools enabled)`;
  },
  
  // Get model display text
  getModelDisplay() {
    return `${this.model.mode} • ${this.model.name}`;
  },
} as const;

export type AIConfig = typeof AI_CONFIG;