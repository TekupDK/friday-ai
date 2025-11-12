#!/usr/bin/env tsx
/**
 * Import Existing Markdown Files to Docs System
 *
 * Scans workspace for .md files and imports them to database
 */

import { getDb } from "../server/db";
import { documents, documentChanges } from "../drizzle/schema";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative, basename } from "path";
import { nanoid } from "nanoid";

const WORKSPACE_ROOT = process.cwd();
const IGNORE_DIRS = ["node_modules", "dist", "build", ".git", "coverage"];

interface FoundDoc {
  path: string;
  relativePath: string;
  content: string;
  size: number;
}

// Find all markdown files
function findMarkdownFiles(dir: string, files: FoundDoc[] = []): FoundDoc[] {
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(item)) {
        findMarkdownFiles(fullPath, files);
      }
    } else if (item.endsWith(".md")) {
      const content = readFileSync(fullPath, "utf-8");
      const relativePath = relative(WORKSPACE_ROOT, fullPath);

      files.push({
        path: fullPath,
        relativePath: relativePath.replace(/\\/g, "/"),
        content,
        size: stat.size,
      });
    }
  }

  return files;
}

// Infer category from path
function inferCategory(path: string): string {
  if (path.startsWith("docs/")) {
    const parts = path.split("/");
    if (parts.length > 1) {
      const subdir = parts[1];
      return subdir.charAt(0).toUpperCase() + subdir.slice(1);
    }
    return "Documentation";
  }
  if (path.startsWith("tasks/invoices")) return "Invoices";
  if (path.startsWith("tasks/email")) return "Email";
  if (path.startsWith("tasks/ai")) return "AI";
  if (path.startsWith("tasks/ops")) return "Operations";
  if (path.startsWith("tasks/")) return "Tasks";
  if (path.startsWith(".copilot/") || path.startsWith(".claude/"))
    return "Development";
  if (path.includes("STATUS") || path.includes("PROGRESS"))
    return "Project Status";
  if (path.includes("README")) return "Documentation";
  if (path.includes("PLAN") || path.includes("ROADMAP")) return "Planning";
  if (path.includes("TEST")) return "Testing";
  return "Uncategorized";
}

// Extract title from content
function extractTitle(content: string, filename: string): string {
  // Try to find # Title
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) return titleMatch[1];

  // Use filename without extension
  return basename(filename, ".md")
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Extract tags from content
function extractTags(content: string, path: string): string[] {
  const tags = new Set<string>();

  // Add category-based tags
  if (path.includes("email")) tags.add("email");
  if (path.includes("invoice")) tags.add("invoice");
  if (path.includes("ai")) tags.add("ai");
  if (path.includes("api")) tags.add("api");
  if (path.includes("test")) tags.add("testing");
  if (path.includes("docs")) tags.add("documentation");

  // Look for common keywords
  const keywords = [
    "bug",
    "feature",
    "fix",
    "todo",
    "important",
    "urgent",
    "review",
  ];
  for (const keyword of keywords) {
    if (content.toLowerCase().includes(keyword)) {
      tags.add(keyword);
    }
  }

  return Array.from(tags);
}

async function importDocs() {
  console.log("🔍 Scanning for markdown files...");
  const files = findMarkdownFiles(WORKSPACE_ROOT);

  console.log(`📄 Found ${files.length} markdown files`);

  const db = await getDb();
  if (!db) {
    console.error("❌ Database not available");
    process.exit(1);
  }

  let imported = 0;
  let skipped = 0;

  for (const file of files) {
    try {
      const title = extractTitle(file.content, file.relativePath);
      const category = inferCategory(file.relativePath);
      const tags = extractTags(file.content, file.relativePath);

      const docId = nanoid();

      await db.insert(documents).values({
        id: docId,
        path: file.relativePath,
        title,
        content: file.content,
        category,
        tags,
        author: "system",
        version: 1,
      });

      await db.insert(documentChanges).values({
        id: nanoid(),
        documentId: docId,
        userId: "system",
        operation: "create",
        diff: `Imported from ${file.relativePath}`,
      });

      imported++;
      console.log(`✅ Imported: ${title} (${category})`);
    } catch (error: any) {
      console.error(
        `❌ Failed to import ${file.relativePath}: ${error.message}`
      );
      skipped++;
    }
  }

  console.log(`\n✨ Import complete!`);
  console.log(`   Imported: ${imported}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`\n🚀 Visit http://localhost:3000/docs to browse!`);
}

// Run import
importDocs().catch(console.error);
