/**
 * Feature Flags for Friday AI
 * Controls rollout of new chat flow and streaming
 */

export interface FeatureFlags {
  useServerSideChat: boolean; // Route all chat through routeAI
  enableStreaming: boolean; // Enable streaming responses
  enableModelRouting: boolean; // Enable intent-based model selection
  enableAuditTrail: boolean; // Enable action audit logging
  enableOpenRouterModels: boolean; // Use new OpenRouter models (GLM-4.5, GPT-OSS)
  openRouterRolloutPercentage: number; // 0-100: Percentage of users with OpenRouter enabled
  enableUTCP: boolean; // Enable UTCP tool calling (Phase 1 prototype)
}

const DEFAULT_FLAGS: FeatureFlags = {
  useServerSideChat: false, // Start with false for gradual rollout
  enableStreaming: false, // Will be enabled after server-side chat
  enableModelRouting: false, // Will be enabled after streaming
  enableAuditTrail: true, // Always enabled for safety
  enableOpenRouterModels: false, // Start disabled, enable gradually
  openRouterRolloutPercentage: 0, // Start at 0%, then 10% → 50% → 100%
  enableUTCP: false, // Phase 1 prototype - disabled by default
};

export function getFeatureFlags(userId?: number): FeatureFlags {
  // Get rollout percentage from environment or use default
  const rolloutPercentage = parseInt(
    process.env.OPENROUTER_ROLLOUT_PERCENTAGE || "0",
    10
  );

  // Determine if this user gets OpenRouter based on rollout percentage
  let enableOpenRouterForUser = false;

  if (process.env.FORCE_OPENROUTER === "true") {
    // Force enable for testing
    enableOpenRouterForUser = true;
  } else if (rolloutPercentage >= 100) {
    // 100% rollout - everyone gets it
    enableOpenRouterForUser = true;
  } else if (rolloutPercentage > 0 && userId) {
    // Gradual rollout based on userId hash
    // This ensures same user always gets same experience
    enableOpenRouterForUser = userId % 100 < rolloutPercentage;
  }

  return {
    ...DEFAULT_FLAGS,
    // Allow environment variable override for testing
    useServerSideChat:
      process.env.FORCE_SERVER_SIDE_CHAT === "true" ||
      DEFAULT_FLAGS.useServerSideChat,
    enableStreaming:
      process.env.FORCE_STREAMING === "true" || DEFAULT_FLAGS.enableStreaming,
    enableModelRouting:
      process.env.FORCE_MODEL_ROUTING === "true" ||
      DEFAULT_FLAGS.enableModelRouting,
    enableOpenRouterModels: enableOpenRouterForUser,
    openRouterRolloutPercentage: rolloutPercentage,
    enableUTCP: process.env.FORCE_UTCP === "true" || DEFAULT_FLAGS.enableUTCP,
  };
}

export function isFeatureEnabled(
  feature: keyof FeatureFlags,
  userId?: number
): boolean {
  const flags = getFeatureFlags(userId);
  const value = flags[feature];
  // openRouterRolloutPercentage is a number, not boolean
  return typeof value === "boolean" ? value : false;
}
