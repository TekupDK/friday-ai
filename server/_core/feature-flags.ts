/**
 * Feature Flags for Friday AI
 * Controls rollout of new chat flow and streaming
 */

export interface FeatureFlags {
  useServerSideChat: boolean; // Route all chat through routeAI
  enableStreaming: boolean;   // Enable streaming responses
  enableModelRouting: boolean; // Enable intent-based model selection
  enableAuditTrail: boolean;   // Enable action audit logging
}

const DEFAULT_FLAGS: FeatureFlags = {
  useServerSideChat: false,    // Start with false for gradual rollout
  enableStreaming: false,      // Will be enabled after server-side chat
  enableModelRouting: false,   // Will be enabled after streaming
  enableAuditTrail: true,      // Always enabled for safety
};

export function getFeatureFlags(userId?: number): FeatureFlags {
  // TODO: Implement user-specific feature flags from database
  // For now, return defaults with environment overrides
  
  return {
    ...DEFAULT_FLAGS,
    // Allow environment variable override for testing
    useServerSideChat: process.env.FORCE_SERVER_SIDE_CHAT === 'true' || DEFAULT_FLAGS.useServerSideChat,
    enableStreaming: process.env.FORCE_STREAMING === 'true' || DEFAULT_FLAGS.enableStreaming,
    enableModelRouting: process.env.FORCE_MODEL_ROUTING === 'true' || DEFAULT_FLAGS.enableModelRouting,
  };
}

export function isFeatureEnabled(feature: keyof FeatureFlags, userId?: number): boolean {
  const flags = getFeatureFlags(userId);
  return flags[feature];
}
