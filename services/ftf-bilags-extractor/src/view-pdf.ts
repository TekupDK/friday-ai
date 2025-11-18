#!/usr/bin/env node
/**
 * Helper script to view/extract text from PDF bank statements
 * Usage: tsx src/view-pdf.ts <pdf-file>
 */

import { readFileSync } from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfModule = require("pdf-parse");
// Handle pdf-parse v1.x (function) and v2.x (class wrapper)
const pdfParse = typeof pdfModule === 'function' ? pdfModule : (pdfModule.default || pdfModule);

async function viewPDF(filePath: string) {
  try {
    console.log(`📄 Reading PDF: ${filePath}\n`);
    const buffer = readFileSync(filePath);
    const data = await pdfParse(buffer);

    console.log(`📊 PDF Info:`);
    console.log(`   Pages: ${data.numpages}`);
    console.log(`   Text length: ${data.text.length} characters\n`);

    console.log(`📝 Extracted Text:\n`);
    console.log("=".repeat(80));
    console.log(data.text);
    console.log("=".repeat(80));

    // Try to extract some sample transactions
    const lines = data.text.split("\n").map((line: string) => line.trim()).filter((line: string) => line.length > 0);
    console.log(`\n📋 Total lines: ${lines.length}`);
    console.log(`\n🔍 First 20 lines:\n`);
    lines.slice(0, 20).forEach((line: string, i: number) => {
      console.log(`${(i + 1).toString().padStart(3)}: ${line}`);
    });
  } catch (error: any) {
    console.error(`❌ Error reading PDF: ${error.message}`);
    process.exit(1);
  }
}

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: tsx src/view-pdf.ts <pdf-file>");
  process.exit(1);
}

viewPDF(filePath);
