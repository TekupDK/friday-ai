// Centralized AI config for client-side features (Email Tab, Inbox UI)

export const ACTIVE_AI_MODEL = "glm-4.5-air-free"; // OpenRouter free tier - 100% accuracy

// Estimated costs per email operation in USD
// GLM-4.5 Air Free → $0.00 (100% accuracy)
export const COST_PER_EMAIL = {
  summary: 0, // previously ~$0.00008 with Gemini Flash
  labelSuggestion: 0, // previously ~$0.00012 with Gemini Flash
  // For toolbar aggregate estimate, show per-email baseline if needed
  toolbarEstimatePerEmail: 0, // 0 for Gemma free
} as const;

export function formatEstimatedCost(amount: number): string {
  if (amount <= 0) return "free";
  if (amount < 0.001) return `~$${amount.toFixed(4)}`;
  return `~$${amount.toFixed(3)}`;
}
