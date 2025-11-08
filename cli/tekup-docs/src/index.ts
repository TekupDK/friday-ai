#!/usr/bin/env node

/**
 * Tekup Docs CLI
 * Command-line tool for managing documentation
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import command handlers
import { listCommand } from './commands/list.js';
import { createCommand } from './commands/create.js';
import { editCommand } from './commands/edit.js';
import { searchCommand } from './commands/search.js';
import { viewCommand } from './commands/view.js';
import { syncCommand } from './commands/sync.js';
import { pushCommand } from './commands/push.js';
import { pullCommand } from './commands/pull.js';
import { statusCommand } from './commands/status.js';
import { resolveCommand } from './commands/resolve.js';
import { aiCommand } from './commands/ai.js';
import { batchCommand } from './commands/batch.js';
import { tuiCommand } from './commands/tui.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

const program = new Command();

program
  .name('tekup-docs')
  .description('CLI tool for managing Tekup AI documentation')
  .version(packageJson.version);

// List command
program
  .command('list')
  .description('List all documents')
  .option('-c, --category <category>', 'Filter by category')
  .option('-t, --tags <tags>', 'Filter by tags (comma-separated)')
  .option('-a, --author <author>', 'Filter by author')
  .option('-l, --limit <number>', 'Limit results', '20')
  .action(listCommand);

// Create command
program
  .command('create [title]')
  .description('Create a new document')
  .option('-c, --category <category>', 'Document category')
  .option('-t, --tags <tags>', 'Document tags (comma-separated)')
  .option('--template <template>', 'Use template')
  .action(createCommand);

// Edit command
program
  .command('edit <id-or-path>')
  .description('Edit an existing document')
  .action(editCommand);

// Search command
program
  .command('search <query>')
  .description('Search documents')
  .option('-c, --category <category>', 'Filter by category')
  .option('-t, --tags <tags>', 'Filter by tags')
  .option('-a, --author <author>', 'Filter by author')
  .option('-l, --limit <number>', 'Limit results', '10')
  .action(searchCommand);

// View command
program
  .command('view <id-or-path>')
  .description('View a document')
  .option('-f, --format <format>', 'Output format (raw|pretty)', 'pretty')
  .action(viewCommand);

// Sync command
program
  .command('sync')
  .description('Sync with Git (pull + push)')
  .action(syncCommand);

// Push command
program
  .command('push')
  .description('Push changes to Git')
  .option('-m, --message <message>', 'Commit message')
  .action(pushCommand);

// Pull command
program
  .command('pull')
  .description('Pull changes from Git')
  .action(pullCommand);

// Status command
program
  .command('status')
  .description('Check sync status')
  .action(statusCommand);

// Resolve command
program
  .command('resolve <id>')
  .description('Resolve a conflict')
  .option('-s, --strategy <strategy>', 'Resolution strategy (local|remote|manual)', 'manual')
  .action(resolveCommand);

// AI commands
const ai = program
  .command('ai')
  .description('AI-powered documentation operations');

ai.command('generate <prompt>')
  .description('Generate documentation from prompt')
  .option('--context <files>', 'Context files (comma-separated)')
  .option('-c, --category <category>', 'Document category')
  .option('-t, --tags <tags>', 'Document tags')
  .action(aiCommand.generate);

ai.command('improve <id-or-path>')
  .description('Improve existing documentation')
  .option('--focus <areas>', 'Focus areas (comma-separated)')
  .action(aiCommand.improve);

ai.command('summarize <id-or-path>')
  .description('Summarize documentation')
  .option('--max-length <length>', 'Maximum length', '500')
  .action(aiCommand.summarize);

ai.command('audit')
  .description('Audit documentation quality')
  .action(aiCommand.audit);

// Batch commands
const batch = program
  .command('batch')
  .description('Batch operations on documents');

batch
  .command('create')
  .description('Create multiple documents')
  .option('--from <file>', 'JSON or YAML file with documents')
  .action(batchCommand.create);

batch
  .command('update')
  .description('Update multiple documents')
  .option('--filter <pattern>', 'Filter pattern')
  .option('--set <fields>', 'Fields to update')
  .action(batchCommand.update);

// Export command
program
  .command('export')
  .description('Export documents')
  .option('-c, --category <category>', 'Filter by category')
  .option('-f, --format <format>', 'Output format (md|html|pdf)', 'md')
  .option('-o, --output <file>', 'Output file')
  .action(batchCommand.export);

// TUI command
program
  .command('tui')
  .description('Launch Terminal UI')
  .action(tuiCommand);

// Custom help
program.on('--help', () => {
  console.log('');
  console.log(chalk.bold('Examples:'));
  console.log('');
  console.log('  $ tekup-docs list --category="API"');
  console.log('  $ tekup-docs create "New Feature" --tags="feature,new"');
  console.log('  $ tekup-docs search "email sync"');
  console.log('  $ tekup-docs ai generate "Document the API endpoint"');
  console.log('  $ tekup-docs sync');
  console.log('');
  console.log(chalk.bold('Documentation:'));
  console.log('  https://github.com/TekupDK/friday-ai/docs');
  console.log('');
});

// Error handling
program.exitOverride();

try {
  program.parse();
} catch (error: any) {
  if (error.code === 'commander.help') {
    process.exit(0);
  }
  if (error.code === 'commander.version') {
    process.exit(0);
  }
  console.error(chalk.red('Error:'), error.message);
  process.exit(1);
}
