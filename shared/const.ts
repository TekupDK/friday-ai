export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const SEVEN_DAYS_MS = 1000 * 60 * 60 * 24 * 7; // ✅ SECURITY: 7-day session expiry for production
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = "Please login (10001)";
export const NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// Login/UI Constants
export const LOGIN_REDIRECT_DELAY_MS = 650; // Delay before redirect after successful login

// Rate Limiting Constants
export const LOGIN_RATE_LIMIT_ATTEMPTS = 5; // Maximum login attempts
export const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes in milliseconds

// Account Lockout Constants
export const ACCOUNT_LOCKOUT_ATTEMPTS = 5; // Lock account after X failed attempts
export const ACCOUNT_LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes lockout duration

// Session Inactivity Constants
export const SESSION_INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes inactivity timeout
