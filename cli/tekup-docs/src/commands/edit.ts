import { Command } from "commander";
import fs from "fs/promises";
import inquirer from "inquirer";
import ora from "ora";
import { createClient } from "../api/client";
import {
  describeTaxonomy,
  resolveCategory,
  resolveTags,
} from "../config/taxonomy";
import { error, success, warning } from "../utils/formatter";

export function registerEditCommand(program: Command) {
  program
    .command("edit")
    .description("Edit an existing documentation file")
    .argument("<id>", "Document ID")
    .option("-t, --title <title>", "New title")
    .option("-c, --category <category>", "New category")
    .option("--tags <tags>", "New tags (comma-separated)")
    .option("-f, --file <file>", "Read new content from file")
    .action(async (id, options) => {
      try {
        const client = createClient();

        // Fetch current document
        const fetchSpinner = ora("Fetching document...").start();
        const doc = await client.getDocument(id);
        fetchSpinner.stop();

        // Interactive edit if no options provided
        if (
          !options.title &&
          !options.category &&
          !options.tags &&
          !options.file
        ) {
          const answers = await inquirer.prompt([
            {
              type: "input",
              name: "title",
              message: "New title (leave empty to keep current):",
              default: doc.title,
            },
            {
              type: "input",
              name: "category",
              message: "New category (leave empty to keep current):",
              default: doc.category,
            },
            {
              type: "input",
              name: "tags",
              message:
                "New tags (comma-separated, leave empty to keep current):",
              default: doc.tags ? doc.tags.join(", ") : "",
            },
            {
              type: "confirm",
              name: "editContent",
              message: "Edit content?",
              default: false,
            },
            {
              type: "editor",
              name: "content",
              message: "Edit content:",
              when: answers => answers.editContent,
              default: doc.content,
            },
          ]);

          const updateData: any = { id };
          if (answers.title !== doc.title) updateData.title = answers.title;

          if (answers.category && answers.category !== doc.category) {
            try {
              updateData.category = resolveCategory(answers.category);
            } catch (taxonomyError: any) {
              warning(describeTaxonomy());
              throw taxonomyError;
            }
          }

          if (answers.tags) {
            const tagInput = answers.tags
              .split(",")
              .map((t: string) => t.trim())
              .filter(Boolean);
            if (tagInput.length > 0) {
              try {
                updateData.tags = resolveTags(tagInput);
              } catch (taxonomyError: any) {
                warning(describeTaxonomy());
                throw taxonomyError;
              }
            }
          }

          if (answers.content) updateData.content = answers.content;

          const spinner = ora("Updating document...").start();
          const updated = await client.updateDocument(updateData);
          spinner.stop();

          success(`Document updated: ${updated.title}`);
          success(`Version: ${updated.version}`);
        } else {
          // Use command-line options
          const updateData: any = { id };

          if (options.title) updateData.title = options.title;
          if (options.category) {
            try {
              updateData.category = resolveCategory(options.category);
            } catch (taxonomyError: any) {
              warning(describeTaxonomy());
              throw taxonomyError;
            }
          }
          if (options.tags) {
            const tagInput = options.tags
              .split(",")
              .map((t: string) => t.trim())
              .filter(Boolean);
            if (tagInput.length > 0) {
              try {
                updateData.tags = resolveTags(tagInput);
              } catch (taxonomyError: any) {
                warning(describeTaxonomy());
                throw taxonomyError;
              }
            }
          }
          if (options.file) {
            updateData.content = await fs.readFile(options.file, "utf-8");
          }

          const spinner = ora("Updating document...").start();
          const updated = await client.updateDocument(updateData);
          spinner.stop();

          success(`Document updated: ${updated.title}`);
          success(`Version: ${updated.version}`);
        }
      } catch (err: any) {
        error(`Failed to edit document: ${err.message}`);
        process.exit(1);
      }
    });
}
