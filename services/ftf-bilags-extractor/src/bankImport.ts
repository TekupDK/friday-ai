/**
 * Bank statement parser
 * Supports XLS/CSV formats
 */

import { readFileSync } from "fs";
import * as XLSX from "xlsx";
import { parse } from "csv-parse/sync";
import type { Transaction } from "./types.js";
import { guessSupplier } from "./supplierMapping.js";

export interface BankImportOptions {
  filePath: string;
  dateColumn?: string;
  textColumn?: string;
  amountColumn?: string;
}

/**
 * Parse XLS/XLSX file
 */
function parseXLS(filePath: string): Transaction[] {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { raw: false });

  const transactions: Transaction[] = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i] as any;

    // Try to find date, text, and amount columns
    // Common column names in Danish bank exports
    const dateStr =
      row["Dato"] ||
      row["Date"] ||
      row["Bogføringsdato"] ||
      row["Værdidato"] ||
      row[Object.keys(row)[0]];

    const textStr =
      row["Tekst"] ||
      row["Text"] ||
      row["Beskrivelse"] ||
      row["Description"] ||
      row[Object.keys(row)[1]];

    const amountStr =
      row["Beløb"] ||
      row["Amount"] ||
      row["Beløb (DKK)"] ||
      row[Object.keys(row).find((k) => k.toLowerCase().includes("beløb")) || ""];

    if (!dateStr || !textStr || !amountStr) {
      continue; // Skip invalid rows
    }

    // Parse date (handle various formats)
    const date = parseDate(dateStr);
    if (!date) continue;

    // Parse amount (handle Danish format: 1.234,56)
    const amount = parseAmount(amountStr);
    if (amount === null) continue;

    const transaction: Transaction = {
      id: `tx-${i + 1}`,
      date: date.toISOString().split("T")[0],
      text: String(textStr).trim(),
      amount,
      supplierGuess: undefined, // Will be set later
    };

    transaction.supplierGuess = guessSupplier(transaction);
    transactions.push(transaction);
  }

  return transactions;
}

/**
 * Parse CSV file
 */
function parseCSV(filePath: string): Transaction[] {
  const content = readFileSync(filePath, "utf8");
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  });

  const transactions: Transaction[] = [];

  for (let i = 0; i < records.length; i++) {
    const row = records[i] as any;

    const dateStr = row["Dato"] || row["Date"] || row[Object.keys(row)[0]];
    const textStr = row["Tekst"] || row["Text"] || row[Object.keys(row)[1]];
    const amountStr =
      row["Beløb"] ||
      row["Amount"] ||
      row[Object.keys(row).find((k) => k.toLowerCase().includes("beløb")) || ""];

    if (!dateStr || !textStr || !amountStr) {
      continue;
    }

    const date = parseDate(dateStr);
    if (!date) continue;

    const amount = parseAmount(amountStr);
    if (amount === null) continue;

    const transaction: Transaction = {
      id: `tx-${i + 1}`,
      date: date.toISOString().split("T")[0],
      text: String(textStr).trim(),
      amount,
      supplierGuess: undefined,
    };

    transaction.supplierGuess = guessSupplier(transaction);
    transactions.push(transaction);
  }

  return transactions;
}

/**
 * Parse date string (handles DD-MM-YYYY, YYYY-MM-DD, etc.)
 */
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  // Try ISO format first
  const isoDate = new Date(dateStr);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }

  // Try DD-MM-YYYY or DD/MM/YYYY
  const ddmmyyyy = dateStr.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    return new Date(
      `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
    );
  }

  // Try YYYY-MM-DD
  const yyyymmdd = dateStr.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/);
  if (yyyymmdd) {
    const [, year, month, day] = yyyymmdd;
    return new Date(
      `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
    );
  }

  return null;
}

/**
 * Parse amount string (handles Danish format: 1.234,56 or -1.234,56)
 */
function parseAmount(amountStr: string): number | null {
  if (!amountStr) return null;

  // Remove currency symbols and spaces
  let cleaned = String(amountStr)
    .replace(/[^\d.,-]/g, "")
    .trim();

  // Handle Danish format: 1.234,56
  if (cleaned.includes(",")) {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  }

  const amount = parseFloat(cleaned);
  return isNaN(amount) ? null : amount;
}

/**
 * Import bank statement from file
 */
export function importBankStatement(filePath: string): Transaction[] {
  const ext = filePath.toLowerCase().split(".").pop();

  switch (ext) {
    case "xls":
    case "xlsx":
      return parseXLS(filePath);
    case "csv":
      return parseCSV(filePath);
    default:
      throw new Error(
        `Unsupported file format: ${ext}. Supported: xls, xlsx, csv`
      );
  }
}
