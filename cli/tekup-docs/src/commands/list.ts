import { Command } from 'commander';
import ora from 'ora';
import { createClient } from '../api/client';
import { formatDocumentList, error } from '../utils/formatter';

export function registerListCommand(program: Command) {
  program
    .command('list')
    .description('List all documentation files')
    .option('-c, --category <category>', 'Filter by category')
    .option('-t, --tags <tags>', 'Filter by tags (comma-separated)')
    .option('-a, --author <author>', 'Filter by author')
    .option('-s, --search <query>', 'Search in title and content')
    .option('-l, --limit <number>', 'Limit number of results', '50')
    .option('-o, --offset <number>', 'Offset for pagination', '0')
    .action(async (options) => {
      const spinner = ora('Fetching documents...').start();

      try {
        const client = createClient();
        
        const params: any = {
          limit: parseInt(options.limit),
          offset: parseInt(options.offset),
        };

        if (options.category) params.category = options.category;
        if (options.author) params.author = options.author;
        if (options.search) params.search = options.search;
        if (options.tags) params.tags = options.tags.split(',').map((t: string) => t.trim());

        const result = await client.listDocuments(params);

        spinner.stop();
        formatDocumentList(result.documents);

        if (result.total > result.documents.length) {
          console.log(`Showing ${result.documents.length} of ${result.total} documents.`);
          console.log(`Use --offset and --limit to see more.`);
        }
      } catch (err: any) {
        spinner.stop();
        error(`Failed to list documents: ${err.message}`);
        process.exit(1);
      }
    });
}
