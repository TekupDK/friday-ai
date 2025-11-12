import chalk from "chalk";

export function formatDocumentList(docs: any[]) {
  if (docs.length === 0) {
    console.log(chalk.yellow("No documents found."));
    return;
  }

  console.log(chalk.bold(`\n📚 Found ${docs.length} document(s):\n`));

  docs.forEach(doc => {
    console.log(chalk.cyan("━".repeat(60)));
    console.log(chalk.bold.white(`📄 ${doc.title}`));
    console.log(chalk.gray(`   ID: ${doc.id}`));
    console.log(chalk.gray(`   Path: ${doc.path}`));
    console.log(chalk.gray(`   Category: ${chalk.blue(doc.category)}`));

    if (doc.tags && doc.tags.length > 0) {
      console.log(
        chalk.gray(
          `   Tags: ${doc.tags.map((t: string) => chalk.green(t)).join(", ")}`
        )
      );
    }

    console.log(chalk.gray(`   Author: ${doc.author}`));
    console.log(
      chalk.gray(`   Updated: ${new Date(doc.updatedAt).toLocaleString()}`)
    );
    console.log(chalk.gray(`   Version: ${doc.version}`));
  });

  console.log(chalk.cyan("━".repeat(60)) + "\n");
}

export function formatDocument(doc: any) {
  console.log(chalk.cyan("━".repeat(60)));
  console.log(chalk.bold.white(`📄 ${doc.title}`));
  console.log(chalk.cyan("━".repeat(60)));
  console.log(chalk.gray(`ID: ${doc.id}`));
  console.log(chalk.gray(`Path: ${doc.path}`));
  console.log(chalk.gray(`Category: ${chalk.blue(doc.category)}`));

  if (doc.tags && doc.tags.length > 0) {
    console.log(
      chalk.gray(
        `Tags: ${doc.tags.map((t: string) => chalk.green(t)).join(", ")}`
      )
    );
  }

  console.log(chalk.gray(`Author: ${doc.author}`));
  console.log(chalk.gray(`Version: ${doc.version}`));
  console.log(
    chalk.gray(`Updated: ${new Date(doc.updatedAt).toLocaleString()}`)
  );

  if (doc.gitHash) {
    console.log(chalk.gray(`Git Hash: ${doc.gitHash}`));
  }

  console.log(chalk.cyan("━".repeat(60)));
  console.log("\n" + doc.content + "\n");
  console.log(chalk.cyan("━".repeat(60)) + "\n");
}

export function formatComments(comments: any[]) {
  if (comments.length === 0) {
    console.log(chalk.yellow("No comments."));
    return;
  }

  console.log(chalk.bold(`\n💬 ${comments.length} comment(s):\n`));

  comments.forEach((comment, idx) => {
    const status = comment.resolved
      ? chalk.green("✓ Resolved")
      : chalk.yellow("○ Open");
    const lineInfo = comment.lineNumber ? ` (Line ${comment.lineNumber})` : "";

    console.log(chalk.gray(`${idx + 1}. ${status}${lineInfo}`));
    console.log(
      chalk.gray(
        `   By ${comment.userId} on ${new Date(comment.createdAt).toLocaleString()}`
      )
    );
    console.log(`   ${comment.content}`);
    console.log();
  });
}

export function formatConflicts(conflicts: any[]) {
  if (conflicts.length === 0) {
    console.log(chalk.green("✓ No conflicts."));
    return;
  }

  console.log(
    chalk.bold.red(`\n⚠️  ${conflicts.length} conflict(s) detected:\n`)
  );

  conflicts.forEach((conflict, idx) => {
    console.log(chalk.red(`${idx + 1}. ${conflict.path}`));
    console.log(chalk.gray(`   Document ID: ${conflict.documentId}`));
    console.log(
      chalk.gray(`   Created: ${new Date(conflict.createdAt).toLocaleString()}`)
    );

    if (conflict.resolution) {
      console.log(chalk.green(`   Resolution: ${conflict.resolution}`));
      console.log(
        chalk.gray(
          `   Resolved by: ${conflict.resolvedBy} on ${new Date(conflict.resolvedAt).toLocaleString()}`
        )
      );
    } else {
      console.log(chalk.yellow("   Status: Unresolved"));
    }
    console.log();
  });
}

export function formatSearchResults(results: any) {
  console.log(chalk.bold(`\n🔍 Search Results (${results.total} total):\n`));

  if (results.documents.length === 0) {
    console.log(chalk.yellow("No documents match your search."));
    return;
  }

  formatDocumentList(results.documents);

  // Show facets
  if (results.facets) {
    console.log(chalk.bold("📊 Facets:"));

    if (Object.keys(results.facets.categories).length > 0) {
      console.log(chalk.gray("  Categories:"));
      Object.entries(results.facets.categories).forEach(([cat, count]) => {
        console.log(chalk.gray(`    • ${cat}: ${count}`));
      });
    }

    if (Object.keys(results.facets.authors).length > 0) {
      console.log(chalk.gray("  Authors:"));
      Object.entries(results.facets.authors).forEach(([author, count]) => {
        console.log(chalk.gray(`    • ${author}: ${count}`));
      });
    }

    console.log();
  }
}

export function success(message: string) {
  console.log(chalk.green(`✓ ${message}`));
}

export function error(message: string) {
  console.log(chalk.red(`✗ ${message}`));
}

export function info(message: string) {
  console.log(chalk.blue(`ℹ ${message}`));
}

export function warning(message: string) {
  console.log(chalk.yellow(`⚠ ${message}`));
}
