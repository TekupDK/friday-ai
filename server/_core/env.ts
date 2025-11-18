export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  // CORS configuration
  get corsAllowedOrigins(): string[] {
    const origins = process.env.CORS_ALLOWED_ORIGINS;
    if (origins) {
      return origins.split(",").map(o => o.trim());
    }
    // Default production origins
    if (this.isProduction) {
      return [
        "https://friday-ai.tekup.dk",
        "https://tekup.dk",
        "https://app.tekup.dk",
      ];
    }
    // Default development origins
    return [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:4173",
    ];
  },
  // Analytics & Telemetry
  analyticsEnabled:
    (process.env.ANALYTICS_ENABLED || "").toLowerCase() === "true",
  analyticsProvider: process.env.ANALYTICS_PROVIDER ?? "",
  analyticsWebhookUrl: process.env.ANALYTICS_WEBHOOK_URL ?? "",
  analyticsWebhookSecret: process.env.ANALYTICS_WEBHOOK_SECRET ?? "",
  mixpanelToken: process.env.MIXPANEL_TOKEN ?? "",
  amplitudeApiKey: process.env.AMPLITUDE_API_KEY ?? "",
  // OpenRouter (GLM-4.5 Air FREE - 100% Accuracy) - Primary LLM
  openRouterApiKey: process.env.OPENROUTER_API_KEY ?? "",
  openRouterModel: process.env.OPENROUTER_MODEL ?? "z-ai/glm-4.5-air:free",
  // Fallback: Ollama for local development
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? "",
  ollamaModel: process.env.OLLAMA_MODEL ?? "gemma3:9b",
  // Legacy API keys (disabled)
  openAiApiKey: process.env.OPENAI_API_KEY ?? "",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  // Forge (internal) API for images, data, notifications
  forgeApiUrl: process.env.FORGE_API_URL ?? "",
  forgeApiKey: process.env.FORGE_API_KEY ?? "",
  // Google Workspace
  googleServiceAccountKey: process.env.GOOGLE_SERVICE_ACCOUNT_KEY ?? "",
  googleImpersonatedUser:
    process.env.GOOGLE_IMPERSONATED_USER ?? "info@rendetalje.dk",
  googleCalendarId: process.env.GOOGLE_CALENDAR_ID ?? "",
  // Billy.dk
  billyApiKey: process.env.BILLY_API_KEY ?? "",
  billyOrganizationId: process.env.BILLY_ORGANIZATION_ID ?? "",
  // Billy.dk Subscription Product IDs
  // These IDs should be created in Billy.dk admin panel and added to .env
  billySubscriptionTier1ProductId: process.env.BILLY_SUBSCRIPTION_TIER1_PRODUCT_ID ?? "",
  billySubscriptionTier2ProductId: process.env.BILLY_SUBSCRIPTION_TIER2_PRODUCT_ID ?? "",
  billySubscriptionTier3ProductId: process.env.BILLY_SUBSCRIPTION_TIER3_PRODUCT_ID ?? "",
  billySubscriptionFlexBasisProductId: process.env.BILLY_SUBSCRIPTION_FLEX_BASIS_PRODUCT_ID ?? "",
  billySubscriptionFlexPlusProductId: process.env.BILLY_SUBSCRIPTION_FLEX_PLUS_PRODUCT_ID ?? "",
  // Inbound email webhook/server integration
  INBOUND_STORAGE_PATH: process.env.INBOUND_STORAGE_PATH ?? "",
  INBOUND_EMAIL_WEBHOOK_SECRET: process.env.INBOUND_EMAIL_WEBHOOK_SECRET ?? "",
  // LiteLLM Integration
  litellmBaseUrl: process.env.LITELLM_BASE_URL ?? "http://localhost:4000",
  litellmMasterKey: process.env.LITELLM_MASTER_KEY ?? "",
  enableLiteLLM: process.env.ENABLE_LITELLM === "true",
  litellmRolloutPercentage: parseInt(
    process.env.LITELLM_ROLLOUT_PERCENTAGE || "0",
    10
  ),
  // Langfuse Observability
  langfuseEnabled: process.env.LANGFUSE_ENABLED === "true",
  langfusePublicKey: process.env.LANGFUSE_PUBLIC_KEY ?? "",
  langfuseSecretKey: process.env.LANGFUSE_SECRET_KEY ?? "",
  langfuseBaseUrl: process.env.LANGFUSE_BASE_URL ?? "http://localhost:3001",
  // Supabase Auth
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  // ChromaDB Vector Database
  get chromaEnabled() {
    return process.env.CHROMA_ENABLED === "true";
  },
  get chromaUrl() {
    return process.env.CHROMA_URL ?? "http://localhost:8000";
  },
  get chromaAuthToken() {
    return process.env.CHROMA_AUTH_TOKEN ?? "friday-chromadb-token-dev";
  },
  // Email Service (SendGrid or AWS SES)
  emailServiceProvider: process.env.EMAIL_SERVICE_PROVIDER ?? "sendgrid", // "sendgrid" | "aws-ses" | "smtp"
  sendgridApiKey: process.env.SENDGRID_API_KEY ?? "",
  sendgridFromEmail: process.env.SENDGRID_FROM_EMAIL ?? "noreply@rendetalje.dk",
  sendgridFromName: process.env.SENDGRID_FROM_NAME ?? "Friday AI",
  // AWS SES (alternative to SendGrid)
  awsSesRegion: process.env.AWS_SES_REGION ?? "us-east-1",
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  // SMTP (fallback)
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpPort: parseInt(process.env.SMTP_PORT || "587", 10),
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPassword: process.env.SMTP_PASSWORD ?? "",
  // SMS Service (Twilio or AWS SNS)
  smsServiceProvider: process.env.SMS_SERVICE_PROVIDER ?? "twilio", // "twilio" | "aws-sns"
  // Twilio
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID ?? "",
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN ?? "",
  twilioFromNumber: process.env.TWILIO_FROM_NUMBER ?? "",
  // AWS SNS (alternative to Twilio)
  awsSnsRegion: process.env.AWS_SNS_REGION ?? "us-east-1",
  // Sentry Error Tracking
  sentryDsn: process.env.SENTRY_DSN ?? "",
  sentryEnabled: process.env.SENTRY_ENABLED === "true",
  sentryEnvironment: process.env.NODE_ENV ?? "development",
  sentryTracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || "0.1"),
};

// Validate required environment variables
function validateEnv() {
  const required = [
    "JWT_SECRET",
    "OWNER_OPEN_ID",
    "DATABASE_URL",
    "VITE_APP_ID",
  ];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    // ✅ SECURITY FIX: Use logger instead of console.warn (redacts sensitive env values)
    // Note: Can't use await in non-async function, so use dynamic import with then
    import("./logger")
      .then(({ logger }) => {
        logger.warn(
          { missingVars: missing },
          "[ENV] Missing required environment variables"
        );
        logger.info(
          "[ENV] Copy env.template.txt to .env and fill in your values"
        );
      })
      .catch(() => {
        // Fallback if logger not available (shouldn't happen)
        console.warn(
          `⚠️ [ENV] Missing required environment variables: ${missing.join(", ")}`
        );
      });
  }
}

// Run validation on module load
validateEnv();
