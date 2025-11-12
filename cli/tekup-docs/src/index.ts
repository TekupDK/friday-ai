#!/usr/bin/env node

/**
 * Tekup Docs CLI
 * Command-line tool for managing documentation
 */

import { Command } from "commander";
import chalk from "chalk";

// Import command registration functions
import { registerListCommand } from "./commands/list.js";
import { registerCreateCommand } from "./commands/create.js";
import { registerEditCommand } from "./commands/edit.js";
import { registerSearchCommand } from "./commands/search.js";
import { registerViewCommand } from "./commands/view.js";
import { registerDeleteCommand } from "./commands/delete.js";
import { registerStatusCommand } from "./commands/status.js";
import { registerResolveCommand } from "./commands/resolve.js";

const program = new Command();

program
  .name("tekup-docs")
  .description("CLI tool for managing Tekup AI documentation")
  .version("1.0.0");

// Register all commands
registerListCommand(program);
registerCreateCommand(program);
registerEditCommand(program);
registerViewCommand(program);
registerSearchCommand(program);
registerDeleteCommand(program);
registerStatusCommand(program);
registerResolveCommand(program);

// Custom help
program.on("--help", () => {
  console.log("");
  console.log(chalk.bold("Examples:"));
  console.log("");
  console.log('  $ tekup-docs list --category="API"');
  console.log('  $ tekup-docs create "New Feature" --tags="feature,new"');
  console.log('  $ tekup-docs search "email sync"');
  console.log("  $ tekup-docs view <doc-id> --comments");
  console.log("  $ tekup-docs status");
  console.log("");
  console.log(chalk.bold("Environment Variables:"));
  console.log(
    "  DOCS_API_URL - API server URL (default: http://localhost:3000)"
  );
  console.log("  DOCS_API_KEY - API key for authentication");
  console.log("");
});

// Parse command-line arguments
program.parse();
