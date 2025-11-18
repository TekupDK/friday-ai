/**
 * Supplier mapping logic
 * Maps bank transaction text to supplier categories
 */

import type { Transaction, SupplierKey } from "./types.js";

/**
 * Supplier keywords mapping
 */
const SUPPLIER_KEYWORDS: Record<SupplierKey, string[]> = {
  Danfoods: ["DANFOODS", "LS 38393"],
  Dagrofa: ["DAGROFA"],
  Inco: ["INCO CC", "INCO"],
  AarhusCatering: ["AARHUS CATERING", "AARHUS CATERING APS"],
  Braendstof: [
    "CIRCLE K",
    "Q8",
    "UNO-X",
    "UNO X",
    "OK",
    "INGO",
    "OIL TANK GO",
    "SHELL",
    "STATOIL",
  ],
  Airbnb: ["AIRBNB"],
  Festival: [
    "FESTIVAL",
    "SFF",
    "MARKED",
    "KLOSTERMÆRKEN",
    "DANA CUP",
    "ROSKILDE",
  ],
  RendetaljeExcluded: ["RENDETALJE"],
  Diverse: [], // Catch-all
};

/**
 * Guess supplier from transaction text
 */
export function guessSupplier(transaction: Transaction): SupplierKey {
  const text = transaction.text.toUpperCase();

  // Check each supplier (except Diverse)
  for (const [supplier, keywords] of Object.entries(SUPPLIER_KEYWORDS)) {
    if (supplier === "Diverse") continue;

    for (const keyword of keywords) {
      if (text.includes(keyword.toUpperCase())) {
        return supplier as SupplierKey;
      }
    }
  }

  // Default to Diverse if no match
  return "Diverse";
}

/**
 * Get search keywords for a supplier
 */
export function getSupplierSearchKeywords(supplier: SupplierKey): string[] {
  return SUPPLIER_KEYWORDS[supplier] || [];
}

/**
 * Build Gmail search query for a supplier
 */
export function buildSupplierGmailQuery(
  supplier: SupplierKey,
  dateFrom: string,
  dateTo: string
): string {
  const keywords = getSupplierSearchKeywords(supplier);
  if (keywords.length === 0) {
    return `after:${dateFrom} before:${dateTo}`;
  }

  // Build OR query for supplier keywords
  const keywordQuery = keywords.map((k) => `"${k}"`).join(" OR ");
  return `(${keywordQuery}) after:${dateFrom} before:${dateTo}`;
}
