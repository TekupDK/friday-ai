import { Command } from 'commander';
import ora from 'ora';
import { createClient } from '../api/client';
import { formatSearchResults, error } from '../utils/formatter';

export function registerSearchCommand(program: Command) {
  program
    .command('search')
    .description('Search documentation')
    .argument('[query]', 'Search query')
    .option('-c, --category <category>', 'Filter by category')
    .option('-t, --tags <tags>', 'Filter by tags (comma-separated)')
    .option('-a, --author <author>', 'Filter by author')
    .option('-l, --limit <number>', 'Limit number of results', '20')
    .option('-o, --offset <number>', 'Offset for pagination', '0')
    .action(async (query, options) => {
      const spinner = ora('Searching...').start();

      try {
        const client = createClient();

        const params: any = {
          limit: parseInt(options.limit),
          offset: parseInt(options.offset),
        };

        if (query) params.query = query;
        if (options.category) params.category = options.category;
        if (options.author) params.author = options.author;
        if (options.tags) params.tags = options.tags.split(',').map((t: string) => t.trim());

        const result = await client.search(params);

        spinner.stop();
        formatSearchResults(result);
      } catch (err: any) {
        spinner.stop();
        error(`Search failed: ${err.message}`);
        process.exit(1);
      }
    });
}
