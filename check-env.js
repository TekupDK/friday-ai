import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import dotenv from "dotenv";

const envFile = process.env.ENV_FILE ?? ".env.dev";
const envPath = path.resolve(process.cwd(), envFile);

function loadEnvFile() {
  if (!fs.existsSync(envPath)) {
    console.warn(
      `⚠️  [check-env] Could not find ${envFile}. Falling back to process environment.`
    );
    return;
  }

  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error(`❌ [check-env] Failed to load ${envFile}:`, result.error);
    process.exit(1);
  }

  console.log(`✅ [check-env] Loaded variables from ${envFile}`);
}

function collectMissingVariables(groups) {
  const missing = [];

  for (const group of groups) {
    const groupMissing = group.vars.filter(name => {
      const value = process.env[name];
      return value === undefined || value === "";
    });

    if (groupMissing.length > 0) {
      missing.push({ group: group.name, vars: groupMissing });
    }
  }

  return missing;
}

function printMissing(missing) {
  console.error("\n❌ [check-env] Missing required environment variables:");
  for (const entry of missing) {
    console.error(`  • ${entry.group}: ${entry.vars.join(", ")}`);
  }
  console.error(
    "\nTip: Copy .env.dev.template → .env.dev and fill in the listed variables."
  );
}

function run() {
  loadEnvFile();

  const requiredGroups = [
    {
      name: "Core",
      vars: ["DATABASE_URL", "JWT_SECRET", "OWNER_OPEN_ID", "VITE_APP_ID"],
    },
    {
      name: "Google Workspace",
      vars: ["GOOGLE_SERVICE_ACCOUNT_KEY", "GOOGLE_IMPERSONATED_USER"],
    },
    {
      name: "Billy.dk",
      vars: ["BILLY_API_KEY", "BILLY_ORGANIZATION_ID"],
    },
  ];

  const missing = collectMissingVariables(requiredGroups);
  if (missing.length > 0) {
    printMissing(missing);
    process.exit(1);
  }

  const recommended = [
    {
      name: "AI Providers",
      vars: ["OPENAI_API_KEY", "GEMINI_API_KEY", "OPENROUTER_API_KEY"],
    },
    {
      name: "Supabase Auth (optional, enables Google login bridging)",
      vars: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
    },
  ];

  const missingRecommended = collectMissingVariables(recommended);
  if (missingRecommended.length > 0) {
    console.warn("\n⚠️  [check-env] Missing recommended variables:");
    for (const entry of missingRecommended) {
      console.warn(`  • ${entry.group}: ${entry.vars.join(", ")}`);
    }
    console.warn(
      "These features will be limited until the keys are provided.\n"
    );
  }

  console.log("✅ [check-env] Environment looks good. Continuing...\n");
}

run();
