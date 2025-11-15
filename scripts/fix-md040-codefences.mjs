#!/usr/bin/env node
/**
 * Quick-fix MD040: annotate unlabeled fenced code blocks with a language
 *
 * Heuristics:
 * - powershell: contains 'Start-Process' or 'pwsh' or backticks PowerShell style
 * - bash: contains common CLI commands (npm, pnpm, node, git, docker, curl, wget, playwright, tsx, tsc, python, pip)
 * - json: looks like JSON (starts with { or [ and contains :)
 * - text: fallback
 *
 * Scans key documentation areas and skips ignored folders.
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const INCLUDE_DIRS = [
  '.',           // project root (README, plans)
  'client',      // client-side docs
  'docs',
  'server',
  'models',
  'friday-ai-leads',
  // add more if needed
];
const IGNORE_DIRS = new Set([
  'node_modules', 'dist', 'build', '.git',
  'archive', 'docs/archive', 'storybook-static', '.out', '.storybook-out',
  'playwright-report', 'test-results', 'tests/results',
  'coverage', '.nyc_output', 'tmp', 'temp'
]);

const MD_EXT = '.md';
let changedFiles = 0;
let changedBlocks = 0;

function isJsonLike(text) {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    // Has at least one colon typical of JSON key: value
    return /:\s/.test(trimmed);
  }
  return false;
}

function detectLanguage(block) {
  const sample = block.slice(0, 1000).toLowerCase();
  if (/start-process|\bpwsh\b|\bpowershell\b/.test(sample)) return 'powershell';
  if (isJsonLike(block)) return 'json';
  if (/(^|\n)\$\s|\bnpm\b|\bpnpm\b|\bnode\b|\bgit\b|\bdocker\b|\bcurl\b|\bwget\b|\bplaywright\b|\btsx\b|\btsc\b|\bpython\b|\bpip\b|\bcd\s|\bls\b|\bmkdir\b|\brm\b/.test(sample)) return 'bash';
  return 'text';
}

function fixFile(path) {
  const original = readFileSync(path, 'utf8');
  let modified = original;
  // Match unlabeled fenced code blocks: ```\n...\n```
  // Ensure we do not match already labeled blocks: ```lang\n
  const regex = /```[ \t]*\r?\n([\s\S]*?)```/g;
  let match;
  let fileChanged = false;
  const parts = [];
  let lastIndex = 0;

  while ((match = regex.exec(original)) !== null) {
    const fenceStartIdx = match.index;
    const fenceOpen = original.slice(fenceStartIdx, fenceStartIdx + 3); // ```

    // Check if this fence already had a language token: look backwards at the opening line
    // Extract the opening line from original between last newline before fence and newline after ```
    const pre = original.lastIndexOf('\n', fenceStartIdx) + 1;
    const openingLine = original.slice(pre, original.indexOf('\n', fenceStartIdx));
    // openingLine starts with ``` possibly followed by lang
    const hasLang = /^```[ \t]*[a-zA-Z0-9+._-]+\s*$/.test(openingLine);
    if (hasLang) continue; // already labeled

    const blockContent = match[1] ?? '';
    const lang = detectLanguage(blockContent);

    // Replace only this occurrence's opening fence
    const before = original.slice(lastIndex, pre);
    const afterOpenToBlock = original.slice(original.indexOf('\n', fenceStartIdx) + 1, match.index + match[0].length);

    parts.push(before);
    parts.push('```' + lang + '\n');
    parts.push(blockContent);
    parts.push('```');

    lastIndex = match.index + match[0].length;
    fileChanged = true;
    changedBlocks++;
  }

  if (fileChanged) {
    parts.push(original.slice(lastIndex));
    modified = parts.join('');
    writeFileSync(path, modified, 'utf8');
    changedFiles++;
  }
}

function walk(dir) {
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const full = join(dir, entry);
    const rel = relative(ROOT, full).replace(/\\/g, '/');

    const name = entry;
    if (IGNORE_DIRS.has(name) || IGNORE_DIRS.has(rel)) continue;

    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full);
    } else if (st.isFile() && name.endsWith(MD_EXT)) {
      fixFile(full);
    }
  }
}

for (const top of INCLUDE_DIRS) {
  try {
    walk(join(ROOT, top));
  } catch (e) {
    // ignore missing
  }
}

console.log(`MD040 quick-fix complete. Files changed: ${changedFiles}, code fences labeled: ${changedBlocks}`);
