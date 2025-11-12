import { Command } from "commander";
import ora from "ora";
import { createClient } from "../api/client";
import { formatDocument, formatComments, error } from "../utils/formatter";

export function registerViewCommand(program: Command) {
  program
    .command("view")
    .description("View a documentation file")
    .argument("<id>", "Document ID")
    .option("-c, --comments", "Show comments")
    .option("-h, --history", "Show change history")
    .action(async (id, options) => {
      const spinner = ora("Fetching document...").start();

      try {
        const client = createClient();
        const doc = await client.getDocument(id);

        spinner.stop();
        formatDocument(doc);

        // Show comments if requested
        if (options.comments) {
          const commentsSpinner = ora("Fetching comments...").start();
          const comments = await client.getComments(id);
          commentsSpinner.stop();
          formatComments(comments);
        }

        // Show history if requested
        if (options.history) {
          const historySpinner = ora("Fetching history...").start();
          const history = await client.getHistory(id);
          historySpinner.stop();

          if (history.length === 0) {
            console.log("No change history.");
          } else {
            console.log(`\n📜 Change History (${history.length} changes):\n`);
            history.forEach((change: any, idx: number) => {
              console.log(
                `${idx + 1}. ${change.operation} by ${change.userId}`
              );
              console.log(`   ${new Date(change.timestamp).toLocaleString()}`);
              if (change.gitHash) {
                console.log(`   Git: ${change.gitHash}`);
              }
              console.log();
            });
          }
        }
      } catch (err: any) {
        spinner.stop();
        error(`Failed to fetch document: ${err.message}`);
        process.exit(1);
      }
    });
}
