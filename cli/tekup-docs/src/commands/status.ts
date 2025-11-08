import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { createClient } from '../api/client';
import { formatConflicts, error, success } from '../utils/formatter';

export function registerStatusCommand(program: Command) {
  program
    .command('status')
    .description('Show documentation system status')
    .action(async () => {
      const spinner = ora('Checking status...').start();

      try {
        const client = createClient();

        // Get conflicts
        const conflicts = await client.getConflicts();

        // Get document count
        const docs = await client.listDocuments({ limit: 1 });

        spinner.stop();

        console.log(chalk.bold('\n📊 Documentation System Status\n'));
        console.log(chalk.cyan('━'.repeat(60)));
        console.log(chalk.gray(`Total Documents: ${docs.total}`));
        console.log(chalk.gray(`Conflicts: ${conflicts.length}`));
        console.log(chalk.cyan('━'.repeat(60)));

        if (conflicts.length > 0) {
          console.log();
          formatConflicts(conflicts);
        } else {
          console.log(chalk.green('\n✓ No conflicts detected.'));
        }

        console.log();
      } catch (err: any) {
        spinner.stop();
        error(`Failed to check status: ${err.message}`);
        process.exit(1);
      }
    });
}
