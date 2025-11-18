/**
 * CSRF Token Helper
 *
 * Utilities for reading and including CSRF tokens in requests.
 * Uses the double-submit cookie pattern.
 */

/**
 * Get CSRF token from cookie
 *
 * The token is set by the server in the __csrf_token cookie.
 * Frontend reads it and includes it in X-CSRF-Token header for mutations.
 */
export function getCsrfToken(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  // Read token from cookie
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "__csrf_token") {
      return decodeURIComponent(value);
    }
  }

  return null;
}

/**
 * Get CSRF token headers for fetch requests
 *
 * Returns headers object with X-CSRF-Token if token is available.
 */
export function getCsrfHeaders(): Record<string, string> {
  const token = getCsrfToken();
  if (!token) {
    return {};
  }

  return {
    "X-CSRF-Token": token,
  };
}
