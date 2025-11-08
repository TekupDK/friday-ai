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
  
  // Model configuration - OpenRouter + GLM-4.5 Air Free (100% Accuracy)
  model: {
    name: "GLM-4.5 Air Free",
    provider: "OpenRouter",
    mode: "100% Accuracy",
    displayText: "GLM-4.5 Air Free via OpenRouter",
    apiEndpoint: "https://openrouter.ai/api/v1/chat/completions",
    modelId: "z-ai/glm-4.5-air:free",
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