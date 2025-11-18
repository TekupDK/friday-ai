/**
 * Report generation (JSON + CSV)
 */

import { writeFileSync } from "fs";
import { join } from "path";
import { stringify } from "csv-stringify/sync";
import type { MatchResult } from "./types.js";

/**
 * Generate JSON report
 */
export function generateJSONReport(
  results: MatchResult[],
  outputPath: string
): void {
  const reportPath = join(outputPath, "report.json");
  writeFileSync(reportPath, JSON.stringify(results, null, 2), "utf8");
  console.log(`✅ JSON report saved: ${reportPath}`);
}

/**
 * Generate CSV report
 */
export function generateCSVReport(
  results: MatchResult[],
  outputPath: string
): void {
  const csvData = results.map((result) => ({
    date: result.date,
    text: result.text,
    amount: result.amount,
    supplier: result.supplier,
    status: result.status,
    files: result.matchedAttachments
      .map((att) => att.path)
      .filter(Boolean)
      .join("; "),
    matchCount: result.matchedAttachments.length,
    bestMatchScore:
      result.matchedAttachments.length > 0
        ? result.matchedAttachments[0].matchScore.toFixed(2)
        : "",
  }));

  const csv = stringify(csvData, {
    header: true,
    columns: [
      "date",
      "text",
      "amount",
      "supplier",
      "status",
      "files",
      "matchCount",
      "bestMatchScore",
    ],
  });

  const reportPath = join(outputPath, "report.csv");
  writeFileSync(reportPath, csv, "utf8");
  console.log(`✅ CSV report saved: ${reportPath}`);
}

/**
 * Generate summary statistics
 */
export function generateSummary(results: MatchResult[]): {
  total: number;
  found: number;
  missing: number;
  bySupplier: Record<string, { total: number; found: number; missing: number }>;
} {
  const summary = {
    total: results.length,
    found: 0,
    missing: 0,
    bySupplier: {} as Record<string, { total: number; found: number; missing: number }>,
  };

  for (const result of results) {
    if (result.status === "FOUND") {
      summary.found++;
    } else {
      summary.missing++;
    }

    const supplier = result.supplier;
    if (!summary.bySupplier[supplier]) {
      summary.bySupplier[supplier] = { total: 0, found: 0, missing: 0 };
    }

    summary.bySupplier[supplier].total++;
    if (result.status === "FOUND") {
      summary.bySupplier[supplier].found++;
    } else {
      summary.bySupplier[supplier].missing++;
    }
  }

  return summary;
}
