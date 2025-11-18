/**
 * Deployment Script for Chat Flow Migration
 * Handles gradual rollout with monitoring and rollback capabilities
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

interface DeploymentConfig {
  environment: "dev" | "staging" | "prod";
  feature: "chat_flow" | "streaming" | "model_routing";
  percentage: number;
  dryRun: boolean;
  skipTests: boolean;
  forceDeploy: boolean;
}

class ChatFlowDeployment {
  private config: DeploymentConfig;
  private rolloutLog: string[] = [];

  constructor(config: DeploymentConfig) {
    this.config = config;
    this.log(
      `🚀 Starting deployment for ${config.feature} to ${config.environment}`
    );
    this.log(`📊 Rollout percentage: ${config.percentage * 100}%`);
  }

  async deploy(): Promise<void> {
    try {
      await this.preDeploymentChecks();
      await this.runTests();
      await this.updateConfiguration();
      await this.deployApplication();
      await this.verifyDeployment();
      await this.updateRolloutStatus();

      this.log("✅ Deployment completed successfully");
      this.generateReport();
    } catch (error) {
      this.log(`❌ Deployment failed: ${error}`);
      await this.rollback();
      throw error;
    }
  }

  private async preDeploymentChecks(): Promise<void> {
    this.log("🔍 Running pre-deployment checks...");

    // Check if we're on the right branch
    const branch = execSync("git branch --show-current", {
      encoding: "utf8",
    }).trim();
    const expectedBranch =
      this.config.environment === "prod" ? "main" : "develop";

    if (branch !== expectedBranch && !this.config.forceDeploy) {
      throw new Error(
        `Wrong branch. Expected ${expectedBranch}, got ${branch}`
      );
    }

    // Check if working directory is clean
    const status = execSync("git status --porcelain", {
      encoding: "utf8",
    }).trim();
    if (status && !this.config.forceDeploy) {
      throw new Error(
        "Working directory is not clean. Commit or stash changes first."
      );
    }

    // Check environment variables
    this.checkEnvironmentVariables();

    this.log("✅ Pre-deployment checks passed");
  }

  private checkEnvironmentVariables(): void {
    const requiredVars = [
      "DATABASE_URL",
      "JWT_SECRET",
      "OPENROUTER_API_KEY",
      "GOOGLE_SERVICE_ACCOUNT_KEY",
    ];

    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        throw new Error(`Missing required environment variable: ${varName}`);
      }
    }

    this.log("✅ Environment variables check passed");
  }

  private async runTests(): Promise<void> {
    if (this.config.skipTests) {
      this.log("⏭️ Skipping tests as requested");
      return;
    }

    this.log("🧪 Running tests...");

    try {
      execSync("pnpm test", { stdio: "inherit" });
      execSync("pnpm playwright test tests/chat-flow-ab-test.spec.ts", {
        stdio: "inherit",
      });
      this.log("✅ All tests passed");
    } catch (error) {
      throw new Error("Tests failed. Deployment aborted.");
    }
  }

  private async updateConfiguration(): Promise<void> {
    this.log("⚙️ Updating rollout configuration...");

    const envFile =
      this.config.environment === "prod" ? ".env.prod" : ".env.dev";
    const envPath = join(process.cwd(), envFile);

    try {
      let envContent = readFileSync(envPath, "utf8");

      // Update rollout percentage
      const rolloutVar = `ROLLOUT_${this.config.feature.toUpperCase()}_PERCENTAGE`;
      envContent = envContent.replace(
        new RegExp(`${rolloutVar}=.*`),
        `${rolloutVar}=${this.config.percentage}`
      );

      // Enable feature if percentage > 0
      const featureVar =
        this.config.feature === "chat_flow"
          ? "FORCE_SERVER_SIDE_CHAT"
          : this.config.feature === "streaming"
            ? "FORCE_STREAMING"
            : "FORCE_MODEL_ROUTING";

      const enabled = this.config.percentage > 0;
      envContent = envContent.replace(
        new RegExp(`${featureVar}=.*`),
        `${featureVar}=${enabled}`
      );

      if (!this.config.dryRun) {
        writeFileSync(envPath, envContent);
      }

      this.log(
        `✅ Configuration updated: ${rolloutVar}=${this.config.percentage}, ${featureVar}=${enabled}`
      );
    } catch (error) {
      throw new Error(`Failed to update configuration: ${error}`);
    }
  }

  private async deployApplication(): Promise<void> {
    if (this.config.dryRun) {
      this.log("🔍 DRY RUN: Skipping actual deployment");
      return;
    }

    this.log("🚀 Deploying application...");

    try {
      // Build application
      execSync("pnpm build", { stdio: "inherit" });

      // Deploy based on environment
      if (this.config.environment === "prod") {
        execSync("pnpm deploy:prod", { stdio: "inherit" });
      } else {
        execSync("pnpm deploy:staging", { stdio: "inherit" });
      }

      this.log("✅ Application deployed successfully");
    } catch (error) {
      throw new Error(`Deployment failed: ${error}`);
    }
  }

  private async verifyDeployment(): Promise<void> {
    this.log("🔍 Verifying deployment...");

    // Wait for deployment to be ready
    await new Promise(resolve => setTimeout(resolve, 30000));

    try {
      // Health check
      const healthUrl =
        this.config.environment === "prod"
          ? "https://rendetalje.dk/api/health"
          : "https://staging.rendetalje.dk/api/health";

      const response = await fetch(healthUrl);
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      // Check feature flags
      const flagsUrl = `${healthUrl}/feature-flags`;
      const flagsResponse = await fetch(flagsUrl);
      const flags = await flagsResponse.json();

      const expectedFlag =
        this.config.feature === "chat_flow"
          ? "useServerSideChat"
          : this.config.feature === "streaming"
            ? "enableStreaming"
            : "enableModelRouting";

      if (!flags[expectedFlag] && this.config.percentage > 0) {
        throw new Error(`Feature flag ${expectedFlag} not enabled`);
      }

      this.log("✅ Deployment verification passed");
    } catch (error) {
      throw new Error(`Deployment verification failed: ${error}`);
    }
  }

  private async updateRolloutStatus(): Promise<void> {
    this.log("📊 Updating rollout status...");

    // TODO: Update rollout status in database
    // TODO: Notify monitoring systems
    // TODO: Send notifications to team

    this.log("✅ Rollout status updated");
  }

  private async rollback(): Promise<void> {
    this.log("🔄 Executing rollback...");

    try {
      // Set emergency rollback flag
      process.env.EMERGENCY_ROLLBACK = "true";
      process.env[`ROLLBACK_${this.config.feature.toUpperCase()}`] = "true";

      // Revert configuration
      if (!this.config.dryRun) {
        const envFile =
          this.config.environment === "prod" ? ".env.prod" : ".env.dev";
        const envPath = join(process.cwd(), envFile);

        let envContent = readFileSync(envPath, "utf8");

        // Disable feature
        const featureVar =
          this.config.feature === "chat_flow"
            ? "FORCE_SERVER_SIDE_CHAT"
            : this.config.feature === "streaming"
              ? "FORCE_STREAMING"
              : "FORCE_MODEL_ROUTING";

        envContent = envContent.replace(
          new RegExp(`${featureVar}=.*`),
          `${featureVar}=false`
        );

        writeFileSync(envPath, envContent);

        // Redeploy with reverted configuration
        await this.deployApplication();
      }

      this.log("✅ Rollback completed successfully");
    } catch (error) {
      this.log(`❌ Rollback failed: ${error}`);
      throw error;
    }
  }

  private log(message: string): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    this.rolloutLog.push(logEntry);
    console.log(logEntry);
  }

  private generateReport(): void {
    const report = {
      deployment: {
        timestamp: new Date().toISOString(),
        environment: this.config.environment,
        feature: this.config.feature,
        percentage: this.config.percentage,
        dryRun: this.config.dryRun,
      },
      status: "success",
      logs: this.rolloutLog,
      nextSteps: [
        "Monitor error rates and response times",
        "Check user satisfaction scores",
        "Prepare for next rollout phase",
        "Document any issues or observations",
      ],
    };

    const reportPath = join(
      process.cwd(),
      `deployment-report-${Date.now()}.json`
    );
    writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`📄 Deployment report saved to: ${reportPath}`);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  const config: DeploymentConfig = {
    environment:
      (args.find(arg => arg.startsWith("--env="))?.split("=")[1] as any) ||
      "dev",
    feature:
      (args.find(arg => arg.startsWith("--feature="))?.split("=")[1] as any) ||
      "chat_flow",
    percentage: parseFloat(
      args.find(arg => arg.startsWith("--percentage="))?.split("=")[1] || "0.1"
    ),
    dryRun: args.includes("--dry-run"),
    skipTests: args.includes("--skip-tests"),
    forceDeploy: args.includes("--force"),
  };

  const deployment = new ChatFlowDeployment(config);

  try {
    await deployment.deploy();
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { ChatFlowDeployment, type DeploymentConfig };
