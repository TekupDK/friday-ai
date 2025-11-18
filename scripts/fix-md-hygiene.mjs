#!/usr/bin/env node
/*
  Basic Markdown hygiene fixer for common markdownlint rules:
  - MD012: collapse multiple blank lines to a single blank line
  - MD009: remove trailing spaces
  - MD047: ensure file ends with a single newline
  - MD031: ensure blank line before/after fenced code blocks
  - MD032: ensure blank line before/after lists
  - MD026: remove trailing punctuation in headings (!, :, ?)
  - MD034: wrap bare URLs/emails in angle brackets
  - MD037: remove spaces immediately inside emphasis markers (** text ** -> **text**)
  - MD035: normalize horizontal rule style to '---'
  - MD022: ensure blank lines around headings

  This script aims for safe, idempotent fixes. It avoids touching fenced code blocks
  for most transformations except blank lines around fences.
*/
import fs from "fs";
import path from "path";

const workspaceRoot = process.cwd();

const EXCLUDED_DIRS = new Set([
  "node_modules",
  "dist",
  "storybook-static",
  ".out",
  ".storybook-out",
  "coverage",
  ".nyc_output",
  "playwright-report",
  "test-results",
  path.join("tests", "results"),
  "archive",
  path.join("docs", "archive"),
  "tmp",
  "temp",
  "logs",
  path.join("docs", "lint-exceptions"),
]);

function walk(dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const rel = path.relative(workspaceRoot, full);
      const parts = rel.split(path.sep);
      if (
        parts.some(
          p =>
            EXCLUDED_DIRS.has(p) ||
            EXCLUDED_DIRS.has(
              parts.slice(0, parts.indexOf(p) + 1).join(path.sep)
            )
        )
      ) {
        continue;
      }
      if ([...EXCLUDED_DIRS].some(ex => rel === ex)) continue;
      out.push(...walk(full));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      const rel = path.relative(workspaceRoot, full);
      if ([...EXCLUDED_DIRS].some(ex => rel.startsWith(ex + path.sep)))
        continue;
      out.push(full);
    }
  }
  return out;
}

function ensureBlankAroundFences(lines) {
  // Insert blank lines before/after fences when missing
  const out = [];
  let inFence = false;
  let fenceChar = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isFence = /^\s*(`{3,}|~{3,})/.test(line);

    if (isFence) {
      // Before fence
      if (out.length > 0 && out[out.length - 1].trim() !== "") {
        out.push("");
      }
      out.push(line);
      inFence = !inFence;
      fenceChar = inFence ? line.trim()[0] : null;

      // After fence (closing)
      if (!inFence) {
        const next = lines[i + 1];
        if (next !== undefined && next.trim() !== "") {
          out.push("");
        }
      }
      continue;
    }

    out.push(line);
  }
  return out;
}

function ensureBlankAroundLists(lines) {
  const out = [];
  // Determine list lines
  const isListLine = l => /^\s*([*+-]|\d+[.)])\s+/.test(l);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (isListLine(line)) {
      // Ensure blank line before list block start
      if (
        out.length > 0 &&
        out[out.length - 1].trim() !== "" &&
        !isListLine(out[out.length - 1])
      ) {
        out.push("");
      }
      out.push(line);
      // Look ahead to end of the list block to insert blank line after
      let j = i + 1;
      while (
        j < lines.length &&
        (isListLine(lines[j]) || lines[j].trim() === "")
      ) {
        out.push(lines[j]);
        i = j;
        j++;
      }
      // Ensure blank after if next line is non-empty, non-list
      const next = lines[i + 1];
      if (next !== undefined && next.trim() !== "" && !isListLine(next)) {
        out.push("");
      }
      continue;
    }

    out.push(line);
  }
  return out;
}

function fixHeadings(line) {
  // Remove trailing punctuation in headings for MD026
  if (/^\s*#{1,6}\s+/.test(line)) {
    return line.replace(/([!?：:؛؟])\s*$/u, "");
  }
  return line;
}

function fixEmphasis(line) {
  // Remove spaces immediately inside ** ** or _ _ pairs
  // Bold: ** text ** -> **text** ; __ text __ -> __text__
  line = line.replace(/\*\*\s+([^*][\s\S]*?)\s+\*\*/g, "**$1**");
  line = line.replace(/__\s+([^_][\s\S]*?)\s+__/g, "__$1__");
  // Italic: * text * -> *text* ; _ text _ -> _text_
  line = line.replace(/\*\s+([^*][\s\S]*?)\s+\*/g, "*$1*");
  line = line.replace(/_\s+([^_][\s\S]*?)\s+_/g, "_$1_");
  return line;
}

function wrapBareUrls(line) {
  // Wrap bare http(s) URLs or naked emails that are not already part of a Markdown link
  // Process only outside inline code spans delimited by backticks
  const parts = line.split(/(`[^`]*`)/g);
  for (let i = 0; i < parts.length; i++) {
    const seg = parts[i];
    if (seg.startsWith("`") && seg.endsWith("`")) continue; // keep code spans intact
    // Wrap http(s)://... sequences not inside <> or () or part of a Markdown link
    parts[i] = seg
      .replace(/(?<![<(])\b(https?:\/\/[^\s)<>]+)(?![)>])/g, "<$1>")
      .replace(
        /(?<![<(])\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})(?![)>])/g,
        "<$1>"
      );
  }
  return parts.join("");
}

function collapseBlankLines(lines) {
  const out = [];
  let blankCount = 0;
  for (const line of lines) {
    if (line.trim() === "") {
      blankCount++;
      if (blankCount <= 1) out.push("");
    } else {
      blankCount = 0;
      out.push(line);
    }
  }
  return out;
}

function ensureBlankAroundHeadings(lines) {
  const out = [];
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fence = /^\s*(`{3,}|~{3,})/.test(line);
    if (fence) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (!inFence && /^\s*#{1,6}\s+/.test(line)) {
      // Ensure blank before
      if (out.length > 0 && out[out.length - 1].trim() !== "") {
        out.push("");
      }
      out.push(line);
      // Ensure blank after if next line exists and is non-empty, non-heading
      const next = lines[i + 1];
      if (
        next !== undefined &&
        next.trim() !== "" &&
        !/^\s*#{1,6}\s+/.test(next)
      ) {
        out.push("");
      }
      continue;
    }
    out.push(line);
  }
  return out;
}

function normalizeHorizontalRules(lines) {
  const out = [];
  let inFence = false;
  for (const line of lines) {
    const fence = /^\s*(`{3,}|~{3,})/.test(line);
    if (fence) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (!inFence && /^\s{0,3}([*_\-])\1\1+\s*$/.test(line)) {
      // Normalize to exactly '---'
      out.push("---");
    } else {
      out.push(line);
    }
  }
  return out;
}

function processContent(content) {
  let lines = content.split(/\r?\n/);

  // MD009: trim trailing spaces (safe globally)
  lines = lines.map(l => l.replace(/[ \t]+$/g, ""));

  // MD026: headings without trailing punctuation
  lines = lines.map(fixHeadings);

  // MD037: emphasis markers spacing
  lines = lines.map(fixEmphasis);

  // MD031: blank around fences
  lines = ensureBlankAroundFences(lines);

  // MD032: blank around lists
  lines = ensureBlankAroundLists(lines);

  // MD022: blank around headings
  lines = ensureBlankAroundHeadings(lines);

  // MD035: normalize horizontal rules
  lines = normalizeHorizontalRules(lines);

  // MD012: collapse multiple blanks
  lines = collapseBlankLines(lines);

  // MD034: wrap bare URLs and emails
  lines = lines.map(wrapBareUrls);

  let updated = lines.join("\n");

  // MD047: ensure single trailing newline
  updated = updated.replace(/\n*$/, "") + "\n";

  return updated;
}

function processFile(file) {
  try {
    const original = fs.readFileSync(file, "utf8");
    const updated = processContent(original);
    if (updated !== original) {
      fs.writeFileSync(file, updated, "utf8");
      return true;
    }
    return false;
  } catch (err) {
    console.error(`[HYGIENE] Failed to process ${file}:`, err.message);
    return false;
  }
}

function main() {
  const files = walk(workspaceRoot);
  let changed = 0;
  for (const f of files) {
    changed += processFile(f) ? 1 : 0;
  }
  console.log(`Markdown hygiene fix complete. Files updated: ${changed}`);
}

main();
