import { Command } from 'commander';
import inquirer from 'inquirer';
import ora from 'ora';
import { createClient } from '../api/client';
import { success, error, warning } from '../utils/formatter';

export function registerDeleteCommand(program: Command) {
  program
    .command('delete')
    .description('Delete a documentation file')
    .argument('<id>', 'Document ID')
    .option('-f, --force', 'Skip confirmation')
    .action(async (id, options) => {
      try {
        const client = createClient();

        // Fetch document to show what will be deleted
        const fetchSpinner = ora('Fetching document...').start();
        const doc = await client.getDocument(id);
        fetchSpinner.stop();

        console.log(`\nDocument to delete: ${doc.title}`);
        console.log(`Path: ${doc.path}`);
        console.log(`Category: ${doc.category}\n`);

        // Confirm deletion unless --force
        if (!options.force) {
          const { confirmed } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirmed',
              message: 'Are you sure you want to delete this document?',
              default: false,
            },
          ]);

          if (!confirmed) {
            warning('Deletion cancelled.');
            return;
          }
        }

        const spinner = ora('Deleting document...').start();
        await client.deleteDocument(id);
        spinner.stop();

        success(`Document deleted: ${doc.title}`);
      } catch (err: any) {
        error(`Failed to delete document: ${err.message}`);
        process.exit(1);
      }
    });
}
