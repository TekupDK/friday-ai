#!/usr/bin/env node
/**
 * CLI entry point for BilagsExtractor
 */

import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";

import { Command } from "commander";

import { importBankStatement } from "./bankImport.js";
import { loadConfig } from "./config.js";
import {
  addToCache,
  calculateHash,
  isDuplicate,
  loadDedupeCache,
  saveDedupeCache,
} from "./dedupe.js";
import { authorizeWithCode, getAuthenticatedClient } from "./gmailAuth.js";
import { GmailClient } from "./gmailClient.js";
import { matchAttachmentsForTransaction } from "./matcher.js";
import {
  generateCSVReport,
  generateJSONReport,
  generateSummary,
} from "./report.js";
import type { MatchResult, SupplierKey } from "./types.js";

const program = new Command();

program
  .name("ftf-bilags-extractor")
  .description("Match bank transactions with Gmail invoices/receipts")
  .version("1.0.0")
  .requiredOption("-i, --input <file>", "Bank statement file (XLS/CSV/PDF)")
  .requiredOption("-o, --output <dir>", "Output directory")
  .option(
    "--supplier-filter <suppliers>",
    "Comma-separated supplier filter (e.g., 'Danfoods,Dagrofa')"
  )
  .option("--dry-run", "Don't download attachments, just generate report")
  .option(
    "--auth-code <code>",
    "OAuth authorization code (for first-time setup)"
  )
  .parse(process.argv);

const options = program.opts();

async function main() {
  try {
    console.log("🚀 FTF BilagsExtractor\n");

    // Load config
    const config = loadConfig();

    // Handle OAuth authorization code if provided
    let auth: any;
    if (options.authCode) {
      auth = await authorizeWithCode(config, options.authCode);
      console.log(
        "\n✅ Authorization complete. Run again without --auth-code to process transactions.\n"
      );
      return;
    }

    // Import bank statement first (before Gmail auth, so we can test parsing)
    console.log(`📄 Importing bank statement: ${options.input}`);
    if (!existsSync(options.input)) {
      throw new Error(`Bank statement file not found: ${options.input}`);
    }

    const transactions = await importBankStatement(options.input);
    console.log(`✅ Imported ${transactions.length} transactions\n`);

    // Filter by supplier if specified
    let filteredTransactions = transactions;
    if (options.supplierFilter) {
      const allowedSuppliers = options.supplierFilter
        .split(",")
        .map((s: string) => s.trim()) as SupplierKey[];
      filteredTransactions = transactions.filter(
        t => t.supplierGuess && allowedSuppliers.includes(t.supplierGuess)
      );
      console.log(
        `🔍 Filtered to ${filteredTransactions.length} transactions (suppliers: ${allowedSuppliers.join(", ")})\n`
      );
    }

    // Create output directory structure
    const outputDir = options.output;
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    const supplierDirs: Record<string, string> = {
      Danfoods: "Danfoods",
      Dagrofa: "Dagrofa",
      Inco: "Inco",
      AarhusCatering: "Aarhus-Catering",
      Braendstof: "Braendstof",
      Airbnb: "Airbnb",
      Festival: "Festivaler",
      Diverse: "Diverse",
      RendetaljeExcluded: "Rendetalje-excluded",
    };

    for (const dir of Object.values(supplierDirs)) {
      const dirPath = join(outputDir, dir);
      if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
      }
    }

    // Load deduplication cache
    const cachePath = join(outputDir, "matches.db.json");
    const dedupeCache = loadDedupeCache(cachePath);

    // In dry-run mode without Gmail auth, just generate report from parsed transactions
    if (options.dryRun) {
      console.log(
        "🔍 Dry-run mode: Generating report from parsed transactions (no Gmail matching)...\n"
      );
      const results: MatchResult[] = filteredTransactions.map(transaction => ({
        transactionId: transaction.id,
        date: transaction.date,
        text: transaction.text,
        amount: transaction.amount,
        supplier: transaction.supplierGuess || "Diverse",
        status: "MISSING" as const,
        matchedAttachments: [],
      }));

      // Generate reports
      generateJSONReport(results, outputDir);
      generateCSVReport(results, outputDir);
      const summary = generateSummary(results);

      const jsonPath = join(outputDir, "report.json");
      const csvPath = join(outputDir, "report.csv");

      console.log("\n📊 Summary:");
      console.log(`   Total transactions: ${summary.total}`);
      console.log(`   Found: ${summary.found}`);
      console.log(`   Missing: ${summary.missing}`);
      console.log(`\n   By supplier:`);
      for (const [supplier, stats] of Object.entries(summary.bySupplier)) {
        console.log(
          `     ${supplier}: ${stats.total} (found: ${stats.found}, missing: ${stats.missing})`
        );
      }
      console.log(`\n✅ Reports generated:`);
      console.log(`   📄 ${jsonPath}`);
      console.log(`   📊 ${csvPath}\n`);

      return;
    }

    // Get authenticated Gmail client (only needed for actual matching)
    console.log("🔐 Authenticating Gmail...");
    auth = await getAuthenticatedClient(config);
    const gmailClient = new GmailClient(auth);
    console.log("✅ Gmail authenticated\n");

    // Process transactions
    console.log("🔍 Matching transactions with Gmail attachments...\n");
    const results: MatchResult[] = [];

    for (let i = 0; i < filteredTransactions.length; i++) {
      const transaction = filteredTransactions[i];
      const supplier = transaction.supplierGuess || "Diverse";

      process.stdout.write(
        `[${i + 1}/${filteredTransactions.length}] Processing: ${transaction.text.substring(0, 50)}... `
      );

      try {
        const matches = await matchAttachmentsForTransaction(
          transaction,
          gmailClient,
          supplier
        );

        const matchedAttachments: MatchResult["matchedAttachments"] = [];

        // Download and save attachments (if not dry-run)
        if (!options.dryRun && matches.length > 0) {
          const supplierDir = supplierDirs[supplier] || "Diverse";

          for (const match of matches.slice(0, 3)) {
            // Limit to top 3 matches
            // Get attachments from this match's message (each match can be from different message)
            const attachments = await gmailClient.getMessageAttachments(
              match.messageId
            );

            // Match by attachment ID first, then by filename if ID doesn't match
            // (Gmail sometimes returns different attachment IDs when fetching separately)
            let attachment = attachments.find(
              att => att.attachmentId === match.attachmentId
            );

            // Fallback: match by filename if ID doesn't match
            if (!attachment) {
              attachment = attachments.find(
                att => att.filename === match.filename
              );
            }

            // Last resort: use first attachment if we have matches but can't find specific one
            if (!attachment && attachments.length > 0) {
              attachment = attachments[0];
            }

            if (!attachment) {
              console.log(
                `  → No attachment found in message ${match.messageId.substring(0, 8)}`
              );
              continue;
            }

            // Update match with actual attachment ID if it changed
            if (attachment.attachmentId !== match.attachmentId) {
              match.attachmentId = attachment.attachmentId;
            }

            if (!attachment.data) {
              console.log(
                `  → Attachment ${match.filename} has no data (size: ${attachment.size})`
              );
              continue;
            }

            // Calculate hash
            const hash = calculateHash(attachment.data);

            // Check for duplicates
            const dupCheck = isDuplicate(hash, dedupeCache);
            if (dupCheck.isDuplicate) {
              console.log(`(duplicate: ${dupCheck.existingPath})`);
              match.path = dupCheck.existingPath!;
              match.hash = hash;
              matchedAttachments.push(match);
              continue;
            }

            // Generate filename
            const dateStr = transaction.date.replace(/-/g, "");
            const amountStr = Math.abs(transaction.amount).toFixed(2);
            const ext = attachment.filename.split(".").pop() || "pdf";
            const filename = `${dateStr}_${supplier.toLowerCase()}_${amountStr}_msg-${match.messageId.substring(0, 8)}_att-${match.attachmentId.substring(0, 8)}.${ext}`;

            const filePath = join(outputDir, supplierDir, filename);

            // Save file
            writeFileSync(filePath, attachment.data);
            addToCache(hash, filePath, dedupeCache);

            match.path = filePath;
            match.hash = hash;
            matchedAttachments.push(match);
          }
        } else {
          // Dry run - just use match metadata
          matchedAttachments.push(...matches.slice(0, 3));
        }

        const result: MatchResult = {
          transactionId: transaction.id,
          date: transaction.date,
          text: transaction.text,
          amount: transaction.amount,
          supplier,
          status: matchedAttachments.length > 0 ? "FOUND" : "MISSING",
          matchedAttachments,
        };

        results.push(result);

        console.log(
          `${result.status} (${matchedAttachments.length} attachment${matchedAttachments.length !== 1 ? "s" : ""})`
        );
      } catch (error: any) {
        console.log(`ERROR: ${error.message}`);
        results.push({
          transactionId: transaction.id,
          date: transaction.date,
          text: transaction.text,
          amount: transaction.amount,
          supplier,
          status: "MISSING",
          matchedAttachments: [],
        });
      }
    }

    // Save deduplication cache
    saveDedupeCache(cachePath, dedupeCache);

    // Generate reports
    console.log("\n📊 Generating reports...");
    generateJSONReport(results, outputDir);
    generateCSVReport(results, outputDir);

    // Print summary
    const summary = generateSummary(results);
    console.log("\n📈 Summary:");
    console.log(`   Total transactions: ${summary.total}`);
    console.log(
      `   Found: ${summary.found} (${((summary.found / summary.total) * 100).toFixed(1)}%)`
    );
    console.log(
      `   Missing: ${summary.missing} (${((summary.missing / summary.total) * 100).toFixed(1)}%)`
    );

    console.log("\n📦 By Supplier:");
    for (const [supplier, stats] of Object.entries(summary.bySupplier)) {
      console.log(
        `   ${supplier}: ${stats.found}/${stats.total} found (${((stats.found / stats.total) * 100).toFixed(1)}%)`
      );
    }

    console.log(`\n✅ Complete! Reports saved to: ${outputDir}\n`);
  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
