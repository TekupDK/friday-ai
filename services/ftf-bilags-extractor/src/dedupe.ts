/**
 * Attachment deduplication using SHA-256 hashing
 */

import { createHash } from "crypto";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

import type { AttachmentMatch } from "./types.js";

interface DedupeCache {
  hashes: Record<string, string>; // hash -> filepath
}

const DEFAULT_CACHE_FILE = "matches.db.json";

/**
 * Calculate SHA-256 hash of attachment data
 */
export function calculateHash(data: Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

/**
 * Load deduplication cache
 */
export function loadDedupeCache(cachePath: string): DedupeCache {
  try {
    if (existsSync(cachePath)) {
      const content = readFileSync(cachePath, "utf8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.warn(`Failed to load dedupe cache from ${cachePath}:`, error);
  }
  return { hashes: {} };
}

/**
 * Save deduplication cache
 */
export function saveDedupeCache(cachePath: string, cache: DedupeCache): void {
  try {
    writeFileSync(cachePath, JSON.stringify(cache, null, 2), "utf8");
  } catch (error) {
    console.error(`Failed to save dedupe cache to ${cachePath}:`, error);
  }
}

/**
 * Check if attachment is duplicate
 */
export function isDuplicate(
  hash: string,
  cache: DedupeCache
): { isDuplicate: boolean; existingPath?: string } {
  if (cache.hashes[hash]) {
    return {
      isDuplicate: true,
      existingPath: cache.hashes[hash],
    };
  }
  return { isDuplicate: false };
}

/**
 * Add hash to cache
 */
export function addToCache(
  hash: string,
  filePath: string,
  cache: DedupeCache
): void {
  cache.hashes[hash] = filePath;
}
