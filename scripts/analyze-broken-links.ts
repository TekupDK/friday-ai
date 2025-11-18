#!/usr/bin/env tsx
/**
 * Analyze broken links in documentation
 *
 * This script finds all broken links and provides detailed analysis
 * of why they're broken and what can be done about them.
 */

import { existsSync } from "fs";
import { readdir, readFile } from "fs/promises";
import { dirname, join, resolve } from "path";

interface BrokenLink {
  file: string;
  line: number;
  linkText: string;
  linkPath: string;
  reason: "not_found" | "wrong_path" | "external" | "anchor_only";
  suggestions: string[];
}

/**
 * Extract markdown links from content
 */
function extractLinks(
  content: string,
  filePath: string
): Array<{ line: number; text: string; path: string }> {
  const links: Array<{ line: number; text: string; path: string }> = [];
  const lines = content.split("\n");

  const linkPattern = /\[([^\]]+)\]\(([^)]+\.md[^)]*)\)/g;

  lines.forEach((line, index) => {
    let match;
    while ((match = linkPattern.exec(line)) !== null) {
      const linkPath = match[2].split("#")[0];
      links.push({
        line: index + 1,
        text: match[1],
        path: linkPath,
      });
    }
  });

  return links;
}

/**
 * Resolve link path
 */
function resolveLinkPath(
  linkPath: string,
  fromFile: string,
  docsRoot: string
): string | null {
  if (linkPath.startsWith("http://") || linkPath.startsWith("https://")) {
    return null; // External link
  }

  if (linkPath.startsWith("#")) {
    return null; // Anchor only
  }

  const fromDir = dirname(fromFile);
  let resolvedPath: string;

  if (linkPath.startsWith("./") || linkPath.startsWith("../")) {
    resolvedPath = resolve(fromDir, linkPath);
  } else if (linkPath.startsWith("/")) {
    resolvedPath = join(docsRoot, linkPath.substring(1));
  } else {
    resolvedPath = resolve(fromDir, linkPath);
  }

  resolvedPath = resolvedPath.replace(/\\/g, "/");

  if (existsSync(resolvedPath)) {
    return resolvedPath;
  }

  if (!resolvedPath.endsWith(".md")) {
    const withMd = resolvedPath + ".md";
    if (existsSync(withMd)) {
      return withMd;
    }
  }

  return null;
}

/**
 * Search for file in docs directory
 */
async function searchFile(
  fileName: string,
  docsRoot: string
): Promise<string[]> {
  const found: string[] = [];

  async function searchDir(dir: string) {
    try {
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (
          entry.isFile() &&
          entry.name.toLowerCase() === fileName.toLowerCase()
        ) {
          found.push(fullPath.replace(/\\/g, "/"));
        }

        if (
          entry.isDirectory() &&
          !entry.name.startsWith(".") &&
          entry.name !== "archive"
        ) {
          await searchDir(fullPath);
        }
      }
    } catch (error) {
      // Ignore
    }
  }

  await searchDir(docsRoot);
  return found;
}

/**
 * Get all markdown files
 */
async function getMarkdownFiles(dir: string): Promise<string[]> {
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
        const subFiles = await getMarkdownFiles(fullPath);
        files.push(...subFiles);
      }
    }
  } catch (error) {
    // Ignore
  }

  return files;
}

/**
 * Main function
 */
async function main() {
  const docsRoot = join(process.cwd(), "docs");
  const projectRoot = process.cwd();

  console.log("🔍 Analyzing broken links in documentation...\n");
  console.log(`📁 Docs root: ${docsRoot}\n`);

  const files = await getMarkdownFiles(docsRoot);
  const brokenLinks: BrokenLink[] = [];

  for (const file of files) {
    try {
      const content = await readFile(file, "utf-8");
      const links = extractLinks(content, file);

      for (const link of links) {
        const resolved = resolveLinkPath(link.path, file, docsRoot);

        if (!resolved) {
          // Check if it's an external link
          if (
            link.path.startsWith("http://") ||
            link.path.startsWith("https://")
          ) {
            continue; // Skip external links
          }

          // Check if it's outside docs (like client/src/components/docs/)
          let reason: BrokenLink["reason"] = "not_found";
          const suggestions: string[] = [];

          if (link.path.includes("client/") || link.path.includes("server/")) {
            reason = "wrong_path";
            suggestions.push(
              "File is outside docs/ directory - may need to move or update path"
            );

            // Check if file exists in project
            const projectPath = resolve(projectRoot, link.path);
            if (existsSync(projectPath)) {
              suggestions.push(`File exists at: ${projectPath}`);
              suggestions.push(
                "Consider: Move file to docs/ or update link to use absolute path from project root"
              );
            } else {
              // Try to find similar file
              const fileName = link.path.split("/").pop() || link.path;
              const found = await searchFile(fileName, docsRoot);
              if (found.length > 0) {
                suggestions.push(
                  `Found similar files in docs/: ${found.join(", ")}`
                );
              }
            }
          } else {
            // Try to find the file
            const fileName = link.path.split("/").pop() || link.path;
            const found = await searchFile(fileName, docsRoot);

            if (found.length > 0) {
              reason = "wrong_path";
              suggestions.push(
                `Found file(s) with same name: ${found.join(", ")}`
              );
              suggestions.push(
                "Consider: Update link path to correct location"
              );
            } else {
              reason = "not_found";
              suggestions.push("File not found in docs/ directory");
              suggestions.push(
                "Consider: File may have been deleted or renamed"
              );
            }
          }

          brokenLinks.push({
            file,
            line: link.line,
            linkText: link.text,
            linkPath: link.path,
            reason,
            suggestions,
          });
        }
      }
    } catch (error) {
      // Ignore
    }
  }

  // Group by reason
  const byReason = new Map<string, BrokenLink[]>();
  for (const link of brokenLinks) {
    if (!byReason.has(link.reason)) {
      byReason.set(link.reason, []);
    }
    byReason.get(link.reason)!.push(link);
  }

  console.log(`📊 Analysis Results:\n`);
  console.log(`  Total broken links: ${brokenLinks.length}\n`);

  // Group by file
  const byFile = new Map<string, BrokenLink[]>();
  for (const link of brokenLinks) {
    if (!byFile.has(link.file)) {
      byFile.set(link.file, []);
    }
    byFile.get(link.file)!.push(link);
  }

  console.log("📋 Broken Links by File:\n");

  for (const [file, links] of Array.from(byFile.entries())) {
    const relativeFile = file.replace(
      process.cwd().replace(/\\/g, "/") + "/",
      ""
    );
    console.log(`  ${relativeFile}:`);

    for (const link of links) {
      console.log(
        `    Line ${link.line}: [${link.linkText}](${link.linkPath})`
      );
      console.log(`      Reason: ${link.reason}`);
      for (const suggestion of link.suggestions) {
        console.log(`      💡 ${suggestion}`);
      }
      console.log();
    }
  }

  // Summary by reason
  console.log("\n📊 Summary by Reason:\n");
  for (const [reason, links] of byReason.entries()) {
    console.log(`  ${reason}: ${links.length} links`);
  }

  // Recommendations
  console.log("\n💡 Recommendations:\n");

  const wrongPathCount = brokenLinks.filter(
    l => l.reason === "wrong_path"
  ).length;
  const notFoundCount = brokenLinks.filter(
    l => l.reason === "not_found"
  ).length;

  if (wrongPathCount > 0) {
    console.log(`1. Fix ${wrongPathCount} links with wrong paths:`);
    console.log("   - Update paths to point to correct file locations");
    console.log(
      "   - Consider moving files to docs/ if they're in client/ or server/\n"
    );
  }

  if (notFoundCount > 0) {
    console.log(`2. Handle ${notFoundCount} links to missing files:`);
    console.log("   - Verify if files were deleted or renamed");
    console.log("   - Remove links if files no longer exist");
    console.log("   - Create files if they should exist\n");
  }
}

main().catch(error => {
  console.error("❌ Error:", error);
  process.exit(1);
});
