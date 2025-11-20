#!/usr/bin/env node
import { promises as fs } from "fs";
import path from "path";

const ROOT = path.resolve(process.cwd());
const SRC_ROOT = path.join(ROOT, ".cursor", "commands");
const DEST_ROOT = path.join(ROOT, ".github", "prompts");

// Ignore meta and archived materials; only sync actionable command prompts
const IGNORE_DIRS = new Set(["archive", "_meta"]);
const IGNORE_FILES_REGEX = /^(README|COMMANDS_.*)\.md$/i; // Ignore indices/readmes in source

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function toPromptName(fileBase) {
  // Convert file base name (without extension) to a simple prompt name
  // keep hyphens, remove underscores, allow spaces for readability
  const name = fileBase.replace(/_/g, " ");
  return name;
}

function extractTitle(markdown) {
  const m = markdown.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : null;
}

function firstParagraph(markdown) {
  // naive extraction of the first non-empty paragraph after the first heading
  const lines = markdown.split(/\r?\n/);
  let i = 0;
  // skip until after the first heading
  for (; i < lines.length; i++) {
    if (/^#\s+/.test(lines[i])) {
      i++;
      break;
    }
  }
  // skip blank lines
  while (i < lines.length && lines[i].trim() === "") i++;
  const paras = [];
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") break;
    if (/^#\s+/.test(line)) break;
    paras.push(line);
  }
  return paras.join(" ").trim();
}

async function writePromptFile(srcPath, destPath, category) {
  const raw = await fs.readFile(srcPath, "utf8");
  const title = extractTitle(raw);
  const base = path.basename(srcPath, path.extname(srcPath));
  const name = toPromptName(base);
  const descFromDoc = firstParagraph(raw);
  const description = [
    category ? `[${category}]` : null,
    title || base,
    descFromDoc ? `- ${descFromDoc}` : null,
  ]
    .filter(Boolean)
    .join(" ")
    .trim()
    .slice(0, 300);

  const frontmatter = `---\nname: ${name}\ndescription: "${description.replace(/"/g, '\\"')}"\nargument-hint: Optional input or selection\n---\n\n`;

  const body = raw;
  const content = frontmatter + body;

  await ensureDir(path.dirname(destPath));
  await fs.writeFile(destPath, content, "utf8");
}

async function syncDir(srcDir, destDir, relative = "") {
  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const relPath = path.join(relative, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      // Skip ignored directories at any depth
      if (IGNORE_DIRS.has(entry.name)) continue;
      await syncDir(srcPath, destPath, relPath);
    } else if (entry.isFile()) {
      // Only convert markdown files to .prompt.md
      if (entry.name.toLowerCase().endsWith(".md")) {
        // Skip readme/index-like files in source
        if (IGNORE_FILES_REGEX.test(entry.name)) continue;
        const category = relative.split(path.sep)[0] || "";
        const outName = entry.name.replace(/\.md$/i, ".prompt.md");
        const outPath = path.join(destDir, outName);
        await writePromptFile(srcPath, outPath, category);
      }
    }
  }
}

async function main() {
  // Ensure destination root exists
  await ensureDir(DEST_ROOT);

  // Optionally, clean destination except for custom files (like README). We'll do incremental to be safe.
  await syncDir(SRC_ROOT, DEST_ROOT);

  // Write a README for prompts directory if it doesn't exist
  const readmePath = path.join(DEST_ROOT, "README.md");
  try {
    await fs.access(readmePath);
  } catch {
    const readme = `# Repository Prompts (Synced from .cursor/commands)

This directory contains a copy of prompt command files from \`.cursor/commands\`, organized for GitHub visibility and usage with tools that read from \`.github/prompts\`.

- Source: \`.cursor/commands\`
- Target: \`.github/prompts\`
- Sync script: \`pnpm sync:prompts\` or \`npm run sync:prompts\`

Notes:
  - The \`_meta\` and \`_meta/archive\` folders are intentionally excluded.
  - Markdown command files are converted to Copilot Chat prompt files with extension \`*.prompt.md\`.
- Structure is preserved.
`;
    await fs.writeFile(readmePath, readme, "utf8");
  }

  // Cleanup: remove prompt files at root that were previously created from ignored sources
  try {
    const rootEntries = await fs.readdir(DEST_ROOT, { withFileTypes: true });
    for (const e of rootEntries) {
      if (e.isFile()) {
        if (/^(README|COMMANDS_.*)\.prompt\.md$/i.test(e.name)) {
          await fs.unlink(path.join(DEST_ROOT, e.name));
        }
        // Also remove any accidental 'promt.prompt.md' typos
        if (/^promt\.prompt\.md$/i.test(e.name)) {
          await fs.unlink(path.join(DEST_ROOT, e.name));
        }
      }
    }
  } catch {}
}

main().catch(err => {
  console.error("Failed to sync prompts:", err);
  process.exit(1);
});
