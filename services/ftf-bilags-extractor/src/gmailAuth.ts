/**
 * Gmail OAuth2 authentication for BilagsExtractor
 * Handles OAuth flow and token storage for ftfiestaa@gmail.com
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";

import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

import { Config } from "./config.js";

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

/**
 * Create OAuth2 client from config
 */
export function createOAuth2Client(config: Config): OAuth2Client {
  return new google.auth.OAuth2(
    config.gmail.clientId,
    config.gmail.clientSecret,
    config.gmail.redirectUri
  );
}

/**
 * Load saved tokens from file
 */
export function loadTokens(tokenPath: string): any | null {
  try {
    if (existsSync(tokenPath)) {
      const content = readFileSync(tokenPath, "utf8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.warn(`Failed to load tokens from ${tokenPath}:`, error);
  }
  return null;
}

/**
 * Save tokens to file
 */
export function saveTokens(tokenPath: string, tokens: any): void {
  try {
    const dir = dirname(tokenPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(tokenPath, JSON.stringify(tokens, null, 2), "utf8");
  } catch (error) {
    console.error(`Failed to save tokens to ${tokenPath}:`, error);
    throw error;
  }
}

/**
 * Get authenticated OAuth2 client
 * If tokens don't exist, prompts user to authorize
 */
export async function getAuthenticatedClient(
  config: Config
): Promise<OAuth2Client> {
  const client = createOAuth2Client(config);
  const tokens = loadTokens(config.tokenPath);

  if (tokens) {
    client.setCredentials(tokens);
    return client;
  }

  // No tokens - need to authorize
  const authUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent", // Force consent screen to get refresh token
  });

  console.log("\n🔐 Gmail OAuth Authorization Required");
  console.log("=====================================");
  console.log("\n1. Open this URL in your browser:");
  console.log(`\n   ${authUrl}\n`);
  console.log("2. Sign in as:", config.gmail.email);
  console.log("3. Grant Gmail read-only access");
  console.log("4. Copy the authorization code from the redirect URL\n");

  // In a real CLI, we'd use readline or inquirer to get the code
  // For now, throw an error with instructions
  throw new Error(
    `Please authorize the application by visiting: ${authUrl}\n` +
      `After authorization, run the tool again with the code using: --auth-code <code>`
  );
}

/**
 * Exchange authorization code for tokens
 */
export async function authorizeWithCode(
  config: Config,
  code: string
): Promise<OAuth2Client> {
  const client = createOAuth2Client(config);

  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  // Save tokens for future use
  saveTokens(config.tokenPath, tokens);

  console.log("✅ Gmail authorization successful!");
  console.log(`   Tokens saved to: ${config.tokenPath}`);

  return client;
}
