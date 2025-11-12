/**
 * Business Constants - Centralized configuration
 * Prevents hardcoded magic numbers throughout the codebase
 */

export const BUSINESS_CONSTANTS = {
  // Pricing
  HOURLY_RATE: 349,
  DEFAULT_HOURS: 2,
  PROFIT_MARGIN: 0.7, // 70%

  // Travel costs
  DEFAULT_TRAVEL_COST: 500,
  PRICE_ADJUSTMENT: 392,

  // Default estimates
  DEFAULT_SIZE_M2: 67,
  MAX_LEADS_ESTIMATE: 5,
  MIN_LEADS_ESTIMATE: 1,

  // Time calculations
  MINUTES_PER_HOUR: 60,
  MILLISECONDS_PER_MINUTE: 60000,

  // UI constants
  DEFAULT_POLLING_INTERVAL: 60000, // 60 seconds
  CACHE_DURATION: 300000, // 5 minutes

  // Booking constants
  STANDARD_BOOKING_PRICE: 3490,
  STANDARD_BOOKING_PROFIT: 2590,
  DEFAULT_DURATION: "3-5t",
  DEFAULT_TEAM: "Jonas + Team",
  DEFAULT_PHONE: "Ikke angivet",
  DEFAULT_SIZE: "Ikke angivet",
  DEFAULT_TIME: "Ikke angivet",
} as const;

export const UI_CONSTANTS = {
  // Loading states
  LOADING_DELAY: 300,

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // Debounce
  SEARCH_DEBOUNCE: 300,
  AUTO_SAVE_DEBOUNCE: 1000,

  // Animation
  TRANSITION_DURATION: 200,
  TOAST_DURATION: 3000,

  // Performance
  CACHE_DURATION: 2 * 60 * 1000, // 2 minutes
  STALE_TIME: 2 * 60 * 1000, // 2 minutes
  GC_TIME: 5 * 60 * 1000, // 5 minutes
  PERFORMANCE_SAMPLE_RATE: 100, // ms
} as const;

export const ERROR_MESSAGES = {
  BUSINESS_DATA: "Kunne ikke hente business data",
  LEAD_ANALYZER: "Kunne ikke analysere lead",
  CALENDAR_DATA: "Kunne ikke hente calendar data",
  INVOICE_DATA: "Kunne ikke hente invoice data",
} as const;
