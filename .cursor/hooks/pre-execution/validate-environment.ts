/**
 * Pre-execution Hook: Validate Environment
 * 
 * Validates environment variables and configuration before agent execution
 */

export interface EnvironmentValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate environment configuration
 */
export async function validateEnvironment(): Promise<EnvironmentValidation> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for required environment variables
  const requiredEnvVars = [
    "DATABASE_URL",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      errors.push(`Missing required environment variable: ${envVar}`);
    }
  }

  // Check for optional but recommended environment variables
  const recommendedEnvVars = [
    "OPENROUTER_API_KEY",
    "ANTHROPIC_API_KEY",
    "GEMINI_API_KEY",
  ];

  for (const envVar of recommendedEnvVars) {
    if (!process.env[envVar]) {
      warnings.push(`Missing recommended environment variable: ${envVar}`);
    }
  }

  // Validate database URL format
  if (process.env.DATABASE_URL) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl.startsWith("mysql://") && !dbUrl.startsWith("postgresql://")) {
      errors.push("DATABASE_URL must start with mysql:// or postgresql://");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Default export for hook executor
export default validateEnvironment;

