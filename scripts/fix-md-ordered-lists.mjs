#!/usr/bin/env node
/*
  Normalize ordered list item prefixes to "1." to satisfy markdownlint MD029 style: "one".
  - Preserves indentation and checkboxes (e.g., 3. [x] Task -> 1. [x] Task)
  - Skips code blocks (fenced with ``` or ~~~) and inline code blocks
  - Ignores excluded folders matching common patterns and our .markdownlintignore baseline
*/
import fs from 'fs';
import path from 'path';

const workspaceRoot = process.cwd();

const EXCLUDED_DIRS = new Set([
  'node_modules', 'dist', 'storybook-static', '.out', '.storybook-out',
  'coverage', '.nyc_output', 'playwright-report', 'test-results',
  path.join('tests','results'), 'archive', path.join('docs','archive'),
  'tmp', 'temp', 'logs', path.join('docs','lint-exceptions')
]);

/**
 * Recursively walk a directory and return .md files excluding EXCLUDED_DIRS.
 */
function walk(dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const rel = path.relative(workspaceRoot, full);
      const parts = rel.split(path.sep);
      if (parts.some(p => EXCLUDED_DIRS.has(p) || EXCLUDED_DIRS.has(parts.slice(0, parts.indexOf(p)+1).join(path.sep)))) {
        continue;
      }
      if ([...EXCLUDED_DIRS].some(ex => rel === ex)) continue;
      out.push(...walk(full));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      const rel = path.relative(workspaceRoot, full);
      // Skip files inside excluded dirs by prefix match just in case
      if ([...EXCLUDED_DIRS].some(ex => rel.startsWith(ex + path.sep))) continue;
      out.push(full);
    }
  }
  return out;
}

function normalizeOrderedLists(content) {
  const lines = content.split(/\r?\n/);
  let inFence = false;
  let fenceChar = null; // ``` or ~~~

  // Regex detects list item at line start with optional indent: "   12. text" or "\t2) text"
  const olRegex = /^([ \t]*)(\d+)([.)])(\s+)(\[.?\]\s+)?(.+)?$/;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Detect fenced code blocks
    const fenceMatch = line.match(/^([ \t]*)(`{3,}|~{3,})/);
    if (fenceMatch) {
      const fence = fenceMatch[2];
      if (!inFence) {
        inFence = true; fenceChar = fence[0];
      } else if (fence[0] === fenceChar) {
        inFence = false; fenceChar = null;
      }
      continue;
    }
    if (inFence) continue;

    // Skip indented code blocks (>=4 spaces) when not part of a list
    if (/^(?: {4}|\t)/.test(line)) continue;

    const m = line.match(olRegex);
    if (!m) continue;

    const indent = m[1] ?? '';
    const number = m[2];
    const delimiter = m[3]; // '.' or ')'
    const space = m[4] ?? ' ';
    const checkbox = m[5] ?? '';
    const rest = (m[6] ?? '').trimEnd();

    // Keep delimiter style but normalize number to 1
    const newPrefix = `${indent}1${delimiter}${space}${checkbox}`;
    const newLine = newPrefix + rest;
    if (newLine !== line) {
      lines[i] = newLine;
    }
  }

  return lines.join('\n');
}

function processFile(file) {
  try {
    const original = fs.readFileSync(file, 'utf8');
    const updated = normalizeOrderedLists(original);
    if (updated !== original) {
      fs.writeFileSync(file, updated, 'utf8');
      return true;
    }
    return false;
  } catch (err) {
    console.error(`[MD029] Failed to process ${file}:`, err.message);
    return false;
  }
}

function main() {
  const root = workspaceRoot;
  const files = walk(root);
  let changed = 0;
  for (const f of files) {
    changed += processFile(f) ? 1 : 0;
  }
  console.log(`MD029 fix complete. Files updated: ${changed}`);
}

main();
