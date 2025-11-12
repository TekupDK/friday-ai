import { Command } from "commander";
import inquirer from "inquirer";
import ora from "ora";
import fs from "fs/promises";
import path from "path";
import { createClient } from "../api/client";
import { success, error, info } from "../utils/formatter";

export function registerCreateCommand(program: Command) {
  program
    .command("create")
    .description("Create a new documentation file")
    .argument("[title]", "Document title")
    .option("-c, --category <category>", "Category")
    .option("-t, --tags <tags>", "Tags (comma-separated)")
    .option("-p, --path <path>", "File path relative to docs/")
    .option("-f, --file <file>", "Read content from file")
    .option("--template <template>", "Use template (api, guide, tutorial)")
    .action(async (titleArg, options) => {
      try {
        // Interactive prompts if arguments not provided
        const answers = await inquirer.prompt([
          {
            type: "input",
            name: "title",
            message: "Document title:",
            when: !titleArg,
            validate: input => input.trim().length > 0 || "Title is required",
          },
          {
            type: "input",
            name: "category",
            message: "Category:",
            when: !options.category,
            default: "General",
          },
          {
            type: "input",
            name: "tags",
            message: "Tags (comma-separated):",
            when: !options.tags,
          },
          {
            type: "input",
            name: "path",
            message: "File path (relative to docs/):",
            when: !options.path,
            default: (answers: any) => {
              const title = titleArg || answers.title;
              const slug = title
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "");
              return `${slug}.md`;
            },
          },
          {
            type: "editor",
            name: "content",
            message: "Document content (opens editor):",
            when: !options.file && !options.template,
            default: (answers: any) => {
              const title = titleArg || answers.title;
              return `# ${title}\n\n## Overview\n\nWrite your documentation here...\n`;
            },
          },
        ]);

        const title = titleArg || answers.title;
        const category = options.category || answers.category;
        const tags = options.tags || answers.tags;
        const docPath = options.path || answers.path;

        let content = "";

        // Load from file if specified
        if (options.file) {
          info(`Reading content from ${options.file}...`);
          content = await fs.readFile(options.file, "utf-8");
        }
        // Load template if specified
        else if (options.template) {
          content = getTemplate(options.template, title);
        }
        // Use editor input
        else {
          content = answers.content;
        }

        const spinner = ora("Creating document...").start();

        const client = createClient();
        const doc = await client.createDocument({
          path: `docs/${docPath}`,
          title,
          content,
          category,
          tags: tags ? tags.split(",").map((t: string) => t.trim()) : [],
        });

        spinner.stop();
        success(`Document created: ${doc.title}`);
        info(`ID: ${doc.id}`);
        info(`Path: ${doc.path}`);
      } catch (err: any) {
        error(`Failed to create document: ${err.message}`);
        process.exit(1);
      }
    });
}

function getTemplate(template: string, title: string): string {
  const templates: Record<string, string> = {
    api: `# ${title}

## Overview

Brief description of the API.

## Endpoints

### \`GET /api/endpoint\`

**Description:** 

**Parameters:**
- \`param\` (string, required): Description

**Response:**
\`\`\`json
{
  "data": {}
}
\`\`\`

**Example:**
\`\`\`bash
curl -X GET http://localhost:3000/api/endpoint
\`\`\`

## Error Codes

| Code | Description |
|------|-------------|
| 400  | Bad Request |
| 404  | Not Found   |
`,
    guide: `# ${title}

## Introduction

What this guide covers.

## Prerequisites

- Requirement 1
- Requirement 2

## Step-by-Step Guide

### Step 1: Setup

Instructions...

### Step 2: Configuration

Instructions...

### Step 3: Testing

Instructions...

## Troubleshooting

Common issues and solutions.

## Next Steps

What to do next.
`,
    tutorial: `# ${title}

## What You'll Learn

- Topic 1
- Topic 2
- Topic 3

## Prerequisites

What you need before starting.

## Tutorial

### Part 1: Introduction

Content...

### Part 2: Implementation

Code examples...

\`\`\`typescript
// Example code
\`\`\`

### Part 3: Testing

How to verify...

## Conclusion

Summary and next steps.
`,
  };

  return templates[template] || `# ${title}\n\nStart writing...\n`;
}
