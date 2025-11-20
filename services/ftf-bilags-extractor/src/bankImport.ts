/**
 * Bank statement parser
 * Supports XLS/CSV/PDF formats
 */

import { readFileSync } from "fs";
import { createRequire } from "module";

import { parse } from "csv-parse/sync";
import * as XLSX from "xlsx";

import { guessSupplier } from "./supplierMapping.js";
import type { Transaction } from "./types.js";

// Dynamically import pdf-parse to handle ESM/CommonJS compatibility
async function getPdfParse() {
  const require = createRequire(import.meta.url);
  const pdfModule = require("pdf-parse");
  // pdf-parse module should be callable directly
  if (typeof pdfModule === 'function') {
    return pdfModule;
  }
  // Try default export
  if (typeof pdfModule.default === 'function') {
    return pdfModule.default;
  }
  // Last resort: try calling the module itself
  return pdfModule;
}

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
 * Parse PDF file
 * Extracts text and attempts to parse transactions from Danish bank statement format
 */
async function parsePDF(filePath: string): Promise<Transaction[]> {
  const buffer = readFileSync(filePath);
  const pdfParseFn = await getPdfParse();
  const data = await pdfParseFn(buffer);
  const text = data.text;

  const transactions: Transaction[] = [];
  const lines = text.split("\n").map((line: string) => line.trim()).filter((line: string) => line.length > 0);

  // Common patterns for Danish bank statements:
  // - Date formats: DD-MM-YYYY, DD.MM.YYYY, DD/MM/YYYY
  // - Amounts: 1.234,56 or -1.234,56 (Danish format)
  // - Transaction text usually follows date

  // Try to find transaction rows
  // Pattern: Date (DD-MM-YYYY or DD.MM.YYYY) followed by text and amount
  const datePattern = /(\d{1,2})[-\/\.](\d{1,2})[-\/\.](\d{4})/;
  // Amount pattern: Look for amounts in parentheses (expenses) or at end of line
  // Avoid matching years (4-digit numbers) - amounts should have commas or be in parentheses
  const amountPattern = /\((\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\)|([-]?\d{1,3}(?:\.\d{3})*(?:,\d{2})?)(?=\s*$)/;

  let currentDate: Date | null = null;
  let transactionText = "";
  let transactionAmount: number | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line contains a date
    const dateMatch = line.match(datePattern);
    if (dateMatch) {
      // If we have accumulated a transaction, save it
      if (currentDate && transactionText && transactionAmount !== null) {
        const transaction: Transaction = {
          id: `tx-${transactions.length + 1}`,
          date: currentDate.toISOString().split("T")[0],
          text: transactionText.trim(),
          amount: transactionAmount,
          supplierGuess: undefined,
        };
        transaction.supplierGuess = guessSupplier(transaction);
        transactions.push(transaction);
      }

      // Parse new date
      const [, day, month, year] = dateMatch;
      currentDate = new Date(
        `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
      );

      // Try to extract amount from same line
      // Look for amount in parentheses first (expenses), then at end of line
      const amountInParens = line.match(/\((\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\)/);
      let amountMatch: RegExpMatchArray | null = null;
      let amountStr = "";
      let isNegative = false;

      if (amountInParens) {
        // Amount in parentheses = negative (expense)
        amountStr = amountInParens[1];
        isNegative = true;
        amountMatch = amountInParens;
      } else {
        // Try to find amount at end of line (not part of date)
        const endAmountMatch = line.match(/(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)(?=\s*$)/);
        if (endAmountMatch && endAmountMatch.index !== undefined) {
          // Make sure it's not part of the date
          const dateEnd = dateMatch.index! + dateMatch[0].length;
          if (endAmountMatch.index > dateEnd) {
            amountStr = endAmountMatch[1];
            amountMatch = endAmountMatch;
          }
        }
      }

      if (amountMatch && amountMatch.index !== undefined) {
        const parsedAmount = parseAmount(amountStr);
        transactionAmount = parsedAmount !== null ? (isNegative ? -Math.abs(parsedAmount) : parsedAmount) : null;
        
        // Extract text (everything between date and amount)
        const dateEnd = dateMatch.index! + dateMatch[0].length;
        const amountStart = amountMatch.index;
        if (amountStart > dateEnd) {
          transactionText = line.substring(dateEnd, amountStart).trim();
        } else {
          transactionText = line.substring(dateEnd).trim();
        }
      } else {
        transactionText = line.substring(dateMatch.index! + dateMatch[0].length).trim();
        transactionAmount = null;
      }
    } else if (currentDate) {
      // Continue accumulating text for current transaction
      const amountInParens = line.match(/\((\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\)/);
      if (amountInParens && transactionAmount === null) {
        // Found amount in parentheses on continuation line
        const parsedAmount = parseAmount(amountInParens[1]);
        transactionAmount = parsedAmount !== null ? -Math.abs(parsedAmount) : null;
        const amountStart = amountInParens.index!;
        transactionText += " " + line.substring(0, amountStart).trim();
      } else {
        // Just text, no amount yet
        transactionText += " " + line;
      }
    }
  }

  // Don't forget the last transaction
  if (currentDate && transactionText && transactionAmount !== null) {
    const transaction: Transaction = {
      id: `tx-${transactions.length + 1}`,
      date: currentDate.toISOString().split("T")[0],
      text: transactionText.trim(),
      amount: transactionAmount,
      supplierGuess: undefined,
    };
    transaction.supplierGuess = guessSupplier(transaction);
    transactions.push(transaction);
  }

  return transactions;
}

/**
 * Import bank statement from file
 */
export async function importBankStatement(filePath: string): Promise<Transaction[]> {
  const ext = filePath.toLowerCase().split(".").pop();

  switch (ext) {
    case "xls":
    case "xlsx":
      return parseXLS(filePath);
    case "csv":
      return parseCSV(filePath);
    case "pdf":
      return await parsePDF(filePath);
    default:
      throw new Error(
        `Unsupported file format: ${ext}. Supported: xls, xlsx, csv, pdf`
      );
  }
}
