#!/usr/bin/env tsx
/**
 * Fix broken markdown links in documentation after file moves
 *
 * This script finds and updates broken relative links in markdown files
 * after the auto-categorization has moved files to new locations.
 */

import { existsSync } from "fs";
import { readdir, readFile, writeFile } from "fs/promises";
import { dirname, join, relative, resolve } from "path";

interface LinkInfo {
  file: string;
  line: number;
  originalLink: string;
  linkText: string;
  linkPath: string;
  fixedLink?: string;
  status: "broken" | "valid" | "fixed";
}

/**
 * Extract markdown links from content
 */
function extractLinks(content: string, filePath: string): LinkInfo[] {
  const links: LinkInfo[] = [];
  const lines = content.split("\n");

  // Pattern: [text](path/to/file.md) or [text](./path/to/file.md)
  const linkPattern = /\[([^\]]+)\]\(([^)]+\.md[^)]*)\)/g;

  lines.forEach((line, index) => {
    let match;
    while ((match = linkPattern.exec(line)) !== null) {
      const linkText = match[1];
      const linkPath = match[2].split("#")[0]; // Remove anchor if present
      const anchor = match[2].includes("#")
        ? match[2].split("#")[1]
        : undefined;

      links.push({
        file: filePath,
        line: index + 1,
        originalLink: match[0],
        linkText,
        linkPath,
        status: "broken",
      });
    }
  });

  return links;
}

/**
 * Resolve link path relative to file location
 */
function resolveLinkPath(
  linkPath: string,
  fromFile: string,
  docsRoot: string
): string | null {
  // Skip external links
  if (linkPath.startsWith("http://") || linkPath.startsWith("https://")) {
    return null;
  }

  // Skip anchor-only links
  if (linkPath.startsWith("#")) {
    return null;
  }

  const fromDir = dirname(fromFile);
  let resolvedPath: string;

  if (linkPath.startsWith("./") || linkPath.startsWith("../")) {
    // Relative path
    resolvedPath = resolve(fromDir, linkPath);
  } else if (linkPath.startsWith("/")) {
    // Absolute from docs root
    resolvedPath = join(docsRoot, linkPath.substring(1));
  } else {
    // Relative to current directory
    resolvedPath = resolve(fromDir, linkPath);
  }

  // Normalize path
  resolvedPath = resolvedPath.replace(/\\/g, "/");

  // Check if file exists
  if (existsSync(resolvedPath)) {
    return resolvedPath;
  }

  // Try with .md extension if not present
  if (!resolvedPath.endsWith(".md")) {
    const withMd = resolvedPath + ".md";
    if (existsSync(withMd)) {
      return withMd;
    }
  }

  return null;
}

/**
 * Find target file in new category structure
 */
async function findTargetFile(
  targetName: string,
  docsRoot: string
): Promise<string | null> {
  // Search recursively for the file
  async function searchDir(dir: string): Promise<string | null> {
    try {
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isFile() && entry.name === targetName) {
          return fullPath.replace(/\\/g, "/");
        }

        if (
          entry.isDirectory() &&
          !entry.name.startsWith(".") &&
          entry.name !== "archive"
        ) {
          const found = await searchDir(fullPath);
          if (found) return found;
        }
      }
    } catch (error) {
      // Ignore errors
    }

    return null;
  }

  return await searchDir(docsRoot);
}

/**
 * Calculate relative path from source to target
 */
function calculateRelativePath(fromFile: string, toFile: string): string {
  const fromDir = dirname(fromFile).replace(/\\/g, "/");
  const toPath = toFile.replace(/\\/g, "/");

  const relativePath = relative(fromDir, toPath).replace(/\\/g, "/");

  // Ensure it starts with ./ for same directory
  if (!relativePath.startsWith(".") && !relativePath.startsWith("/")) {
    return "./" + relativePath;
  }

  return relativePath;
}

/**
 * Get all markdown files recursively
 */
async function getMarkdownFiles(
  dir: string,
  baseDir: string = dir
): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isFile() && entry.name.endsWith(".md")) {
        files.push(fullPath.replace(/\\/g, "/"));
      } else if (
        entry.isDirectory() &&
        !entry.name.startsWith(".") &&
        entry.name !== "archive"
      ) {
        const subFiles = await getMarkdownFiles(fullPath, baseDir);
        files.push(...subFiles);
      }
    }
  } catch (error) {
    // Ignore errors
  }

  return files;
}

/**
 * Main function
 */
async function main() {
  const docsRoot = join(process.cwd(), "docs");
  const dryRun = process.argv.includes("--dry-run");
  const verbose = process.argv.includes("--verbose");

  console.log("🔗 Fixing broken markdown links in documentation...\n");
  console.log(`📁 Docs root: ${docsRoot}`);
  console.log(
    `🔍 Mode: ${dryRun ? "DRY RUN (no files will be modified)" : "LIVE (files will be updated)"}\n`
  );

  // Get all markdown files
  const files = await getMarkdownFiles(docsRoot);
  console.log(`Found ${files.length} markdown files\n`);

  const allLinks: LinkInfo[] = [];
  const brokenLinks: LinkInfo[] = [];

  // Extract all links
  for (const file of files) {
    try {
      const content = await readFile(file, "utf-8");
      const links = extractLinks(content, file);
      allLinks.push(...links);

      // Check each link
      for (const link of links) {
        const resolved = resolveLinkPath(link.linkPath, file, docsRoot);

        if (!resolved) {
          // Try to find the file in new structure
          const fileName = link.linkPath.split("/").pop() || link.linkPath;
          const found = await findTargetFile(fileName, docsRoot);

          if (found) {
            const newRelativePath = calculateRelativePath(file, found);
            link.fixedLink = newRelativePath;
            link.status = "fixed";
            brokenLinks.push(link);
          } else {
            link.status = "broken";
            brokenLinks.push(link);
          }
        } else {
          link.status = "valid";
        }
      }
    } catch (error) {
      if (verbose) {
        console.error(`Error reading ${file}:`, error);
      }
    }
  }

  // Report statistics
  const validCount = allLinks.filter(l => l.status === "valid").length;
  const fixedCount = brokenLinks.filter(l => l.status === "fixed").length;
  const stillBrokenCount = brokenLinks.filter(
    l => l.status === "broken"
  ).length;

  console.log("📊 Link Statistics:\n");
  console.log(`  Total links: ${allLinks.length}`);
  console.log(`  Valid links: ${validCount}`);
  console.log(`  Can be fixed: ${fixedCount}`);
  console.log(`  Still broken: ${stillBrokenCount}\n`);

  if (brokenLinks.length > 0) {
    console.log("🔧 Links to fix:\n");

    // Group by file
    const byFile = new Map<string, LinkInfo[]>();
    for (const link of brokenLinks) {
      if (!byFile.has(link.file)) {
        byFile.set(link.file, []);
      }
      byFile.get(link.file)!.push(link);
    }

    for (const [file, links] of Array.from(byFile.entries()).slice(0, 20)) {
      console.log(`  ${file}:`);
      for (const link of links) {
        if (link.status === "fixed") {
          console.log(
            `    ✅ Line ${link.line}: ${link.originalLink} → ${link.fixedLink}`
          );
        } else {
          console.log(
            `    ❌ Line ${link.line}: ${link.originalLink} (not found)`
          );
        }
      }
    }

    if (byFile.size > 20) {
      console.log(`\n  ... and ${byFile.size - 20} more files\n`);
    }
  }

  // Fix links
  if (!dryRun && fixedCount > 0) {
    console.log("🚀 Fixing links...\n");

    // Group fixes by file
    const fixesByFile = new Map<string, LinkInfo[]>();
    for (const link of brokenLinks.filter(l => l.status === "fixed")) {
      if (!fixesByFile.has(link.file)) {
        fixesByFile.set(link.file, []);
      }
      fixesByFile.get(link.file)!.push(link);
    }

    let fixedFiles = 0;

    for (const [file, fixes] of fixesByFile.entries()) {
      try {
        let content = await readFile(file, "utf-8");
        const lines = content.split("\n");

        for (const fix of fixes) {
          const lineIndex = fix.line - 1;
          if (lines[lineIndex]) {
            // Replace the link
            const newLink = `[${fix.linkText}](${fix.fixedLink})`;
            lines[lineIndex] = lines[lineIndex].replace(
              fix.originalLink,
              newLink
            );
          }
        }

        content = lines.join("\n");
        await writeFile(file, content, "utf-8");
        fixedFiles++;

        if (verbose) {
          console.log(`✅ Fixed ${fixes.length} links in ${file}`);
        }
      } catch (error) {
        console.error(`❌ Error fixing ${file}:`, error);
      }
    }

    console.log(`\n✨ Done! Fixed links in ${fixedFiles} files`);
  } else if (dryRun) {
    console.log("\n💡 Run without --dry-run to apply fixes");
  }
}

// Run if executed directly
main().catch(error => {
  console.error("❌ Error:", error);
  process.exit(1);
});
