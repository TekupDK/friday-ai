/**
 * Date formatting utilities with caching
 *
 * Reduces repeated date parsing operations for better performance.
 * Caches formatted dates to avoid re-parsing the same date strings.
 */

const dateCache = new Map<string, string>();
const MAX_CACHE_SIZE = 100;

/**
 * Format date string to locale date string
 *
 * Caches results to avoid repeated parsing operations.
 * Automatically manages cache size to prevent memory leaks.
 *
 * @param dateString - ISO date string or null/undefined
 * @param fallback - Fallback text if date is invalid (default: "No date")
 * @returns Formatted date string
 *
 * @example
 * ```tsx
 * formatDate("2025-01-28T10:00:00Z") // "1/28/2025"
 * formatDate(null) // "No date"
 * formatDate("invalid", "Invalid") // "Invalid"
 * ```
 */
export function formatDate(
  dateString: string | null | undefined,
  fallback: string = "No date"
): string {
  if (!dateString) return fallback;

  // Check cache first for performance
  if (dateCache.has(dateString)) {
    return dateCache.get(dateString)!;
  }

  try {
    const date = new Date(dateString);

    // Validate date
    if (isNaN(date.getTime())) {
      return fallback;
    }

    const formatted = date.toLocaleDateString();

    // Manage cache size to prevent memory leaks
    if (dateCache.size >= MAX_CACHE_SIZE) {
      // Remove oldest entry (first key)
      const firstKey = dateCache.keys().next().value;
      if (firstKey) {
        dateCache.delete(firstKey);
      }
    }

    // Cache result
    dateCache.set(dateString, formatted);

    return formatted;
  } catch {
    return fallback;
  }
}

/**
 * Clear date cache
 *
 * Useful for testing or memory management.
 * Generally not needed in production as cache is self-managing.
 */
export function clearDateCache(): void {
  dateCache.clear();
}

/**
 * Get current cache size
 *
 * Useful for monitoring and debugging.
 */
export function getDateCacheSize(): number {
  return dateCache.size;
}
