import { Command } from 'commander';
import inquirer from 'inquirer';
import ora from 'ora';
import { createClient } from '../api/client';
import { success, error, info } from '../utils/formatter';

export function registerResolveCommand(program: Command) {
  program
    .command('resolve')
    .description('Resolve a documentation conflict')
    .argument('<conflictId>', 'Conflict ID')
    .option('--local', 'Accept local version')
    .option('--remote', 'Accept remote version')
    .option('--manual', 'Manually merge (opens editor)')
    .action(async (conflictId, options) => {
      try {
        const client = createClient();

        // Fetch conflict details
        const spinner = ora('Fetching conflict...').start();
        const conflicts = await client.getConflicts();
        const conflict = conflicts.find((c: any) => c.id === conflictId);
        spinner.stop();

        if (!conflict) {
          error(`Conflict not found: ${conflictId}`);
          process.exit(1);
        }

        console.log(`\n📄 Conflict: ${conflict.path}`);
        console.log(`Document ID: ${conflict.documentId}\n`);

        let resolution: 'accept_local' | 'accept_remote' | 'manual' = 'accept_local';
        let mergedContent: string | undefined;

        // If no options provided, prompt user
        if (!options.local && !options.remote && !options.manual) {
          const answers = await inquirer.prompt([
            {
              type: 'list',
              name: 'resolution',
              message: 'How do you want to resolve this conflict?',
              choices: [
                { name: 'Accept local version', value: 'accept_local' },
                { name: 'Accept remote version', value: 'accept_remote' },
                { name: 'Manually merge', value: 'manual' },
              ],
            },
          ]);

          resolution = answers.resolution;

          if (resolution === 'manual') {
            info('Opening editor with conflict markers...');

            const { content } = await inquirer.prompt([
              {
                type: 'editor',
                name: 'content',
                message: 'Resolve conflict (remove markers):',
                default: conflict.conflictMarkers,
              },
            ]);

            mergedContent = content;
          }
        } else {
          if (options.local) resolution = 'accept_local';
          if (options.remote) resolution = 'accept_remote';
          if (options.manual) {
            resolution = 'manual';

            const { content } = await inquirer.prompt([
              {
                type: 'editor',
                name: 'content',
                message: 'Resolve conflict (remove markers):',
                default: conflict.conflictMarkers,
              },
            ]);

            mergedContent = content;
          }
        }

        const resolveSpinner = ora('Resolving conflict...').start();

        await client.resolveConflict({
          conflictId,
          resolution,
          mergedContent,
        });

        resolveSpinner.stop();
        success(`Conflict resolved using: ${resolution}`);
      } catch (err: any) {
        error(`Failed to resolve conflict: ${err.message}`);
        process.exit(1);
      }
    });
}
