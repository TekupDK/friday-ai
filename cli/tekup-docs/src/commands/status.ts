import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";
import { createClient } from "../api/client";
import { error, formatConflicts } from "../utils/formatter";

export function registerStatusCommand(program: Command) {
  program
    .command("status")
    .description("Show documentation system status")
    .action(async () => {
      const spinner = ora("Checking status...").start();

      try {
        const client = createClient();

        // Get conflicts
        const conflicts = await client.getConflicts();

        // Get document count
        const docs = await client.listDocuments({ limit: 1 });

        // Get aggregate facets for categories/authors
        const summary = await client.search({ limit: 0, offset: 0 });
        const categories = summary.facets?.categories || {};
        const authors = summary.facets?.authors || {};

        spinner.stop();

        console.log(chalk.bold("\n📊 Documentation System Status\n"));
        console.log(chalk.cyan("━".repeat(60)));
        console.log(chalk.gray(`Total Documents: ${docs.total}`));
        console.log(chalk.gray(`Conflicts: ${conflicts.length}`));
        if (Object.keys(categories).length > 0) {
          console.log(chalk.gray("Categories:"));
          Object.entries(categories).forEach(([cat, count]) => {
            console.log(chalk.gray(`  • ${cat}: ${count}`));
          });
        }

        const authorEntries = Object.entries(authors);
        if (authorEntries.length > 0) {
          console.log(chalk.gray("Top Authors:"));
          authorEntries.slice(0, 5).forEach(([author, count]) => {
            console.log(chalk.gray(`  • ${author}: ${count}`));
          });
        }
        console.log(chalk.cyan("━".repeat(60)));

        if (conflicts.length > 0) {
          console.log();
          formatConflicts(conflicts);
        } else {
          console.log(chalk.green("\n✓ No conflicts detected."));
        }

        console.log();
      } catch (err: any) {
        spinner.stop();
        error(`Failed to check status: ${err.message}`);
        process.exit(1);
      }
    });
}
