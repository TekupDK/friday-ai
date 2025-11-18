/**
 * Configuration loader for BilagsExtractor
 */

import { readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";

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

export function loadConfig(): Config {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const redirectUri =
    process.env.GMAIL_REDIRECT_URI || "http://localhost:8080/callback";
  const email = process.env.GMAIL_EMAIL || "ftfiestaa@gmail.com";
  const tokenPath = process.env.GMAIL_TOKEN_PATH || DEFAULT_TOKEN_PATH;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing Gmail OAuth credentials. Please set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET environment variables."
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
