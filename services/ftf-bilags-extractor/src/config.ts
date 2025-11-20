/**
 * Configuration loader for BilagsExtractor
 */

import { readFileSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";

export interface Config {
  gmail: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    email: string; // ftfiestaa@gmail.com
  };
  tokenPath: string;
}

const DEFAULT_TOKEN_PATH = join(
  homedir(),
  ".config",
  "ftf-bilag-extractor",
  "token.json"
);

/**
 * Load .env file manually (simple implementation)
 */
function loadEnvFile(): Record<string, string> {
  const envPath = join(process.cwd(), ".env");
  const env: Record<string, string> = {};

  if (existsSync(envPath)) {
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join("=").trim();
        }
      }
    }
  }

  return env;
}

export function loadConfig(): Config {
  const env = loadEnvFile();

  const clientId = process.env.GMAIL_CLIENT_ID || env.GMAIL_CLIENT_ID;
  const clientSecret =
    process.env.GMAIL_CLIENT_SECRET || env.GMAIL_CLIENT_SECRET;
  const redirectUri =
    process.env.GMAIL_REDIRECT_URI ||
    env.GMAIL_REDIRECT_URI ||
    "http://localhost:8080/callback";
  const email =
    process.env.GMAIL_EMAIL || env.GMAIL_EMAIL || "ftfiestaa@gmail.com";
  const tokenPath =
    process.env.GMAIL_TOKEN_PATH || env.GMAIL_TOKEN_PATH || DEFAULT_TOKEN_PATH;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing Gmail OAuth credentials. Please set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET in .env file or environment variables."
    );
  }

  return {
    gmail: {
      clientId,
      clientSecret,
      redirectUri,
      email,
    },
    tokenPath,
  };
}
