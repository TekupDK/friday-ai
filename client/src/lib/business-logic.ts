/**
 * Business Logic Helpers for Rendetalje
 * Centralized pricing and data parsing logic
 */

export interface ParsedBooking {
  customer: string;
  type: string;
  price: number;
  workHours: number;
  duration: string;
  isFixedPrice: boolean;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: string | { dateTime?: string; date?: string; timeZone?: string };
  end: string | { dateTime?: string; date?: string; timeZone?: string };
  location?: string;
  status?: string;
}

/**
 * Parse calendar event summary to extract customer name and job type
 */
export function parseEventSummary(summary: string): {
  customer: string;
  type: string;
} {
  let customer = "Ukendt kunde";
  let type = "Rengøring";

  // Format: "🏠 TYPE #NUM - CUSTOMER NAME"
  if (summary.includes(" - ")) {
    const parts = summary.split(" - ");
    const typePart = parts[0] || "";
    const customerPart = parts[1] || "";

    // Extract type from first part
    if (typePart.includes("INTRODUKTIONSRENGØRING")) {
      type = "Introduktionsrengøring";
    } else if (typePart.includes("FAST RENGØRING")) {
      type = "Fast rengøring";
    } else if (typePart.includes("HOVEDRENGØRING")) {
      type = "Hovedrengøring";
    } else if (typePart.includes("FLYTTERENGØRING")) {
      type = "Flytterengøring";
    }

    customer = customerPart.trim() || "Ukendt kunde";
  } else {
    // Fallback parsing
    customer = summary.replace(/[🏠#]/g, "").trim() || "Ukendt kunde";
  }

  return { customer, type };
}

/**
 * Parse work hours from calendar event description
 * Returns workHours and duration display string
 */
export function parseWorkHours(
  description: string,
  customer: string
): { workHours: number; duration: string; isFixedPrice: boolean } {
  // Check for FIXED PRICE customers
  if (
    description.includes("FAST PRIS") &&
    customer === "Anne Sofie Kristensen"
  ) {
    return { workHours: 0, duration: "Fast pris", isFixedPrice: true };
  }

  // Parse "X arbejdstimer total" format
  const hoursMatch = description.match(
    /(\d+(?:,\d+)?)\s*(?:arbejdstimer|timer|t)\s*(?:total|totalt)/i
  );
  if (hoursMatch) {
    const workHours = parseFloat(hoursMatch[1].replace(",", "."));
    return {
      workHours,
      duration: `${workHours} arbejdstimer`,
      isFixedPrice: false,
    };
  }

  // Parse "X personer × Yt = Z arbejdstimer" format
  const personTimeMatch = description.match(
    /(\d+)\s*personer?\s*[×x]\s*(\d+(?:,\d+)?)\s*t?\s*=\s*(\d+(?:,\d+)?)\s*(?:arbejdstimer|timer|t)/i
  );
  if (personTimeMatch) {
    const workHours = parseFloat(personTimeMatch[3].replace(",", "."));
    const persons = personTimeMatch[1];
    const timePerPerson = personTimeMatch[2];
    return {
      workHours,
      duration: `${workHours} arbejdstimer (${persons}p×${timePerPerson}t)`,
      isFixedPrice: false,
    };
  }

  // No work hours found
  return { workHours: 0, duration: "", isFixedPrice: false };
}

/**
 * Get calendar duration in hours (fallback method)
 */
export function getCalendarDuration(event: CalendarEvent): number {
  if (!event.start || !event.end) return 0;

  const startTime =
    typeof event.start === "string"
      ? new Date(event.start)
      : new Date(event.start.dateTime || event.start.date || "");
  const endTime =
    typeof event.end === "string"
      ? new Date(event.end)
      : new Date(event.end.dateTime || event.end.date || "");

  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) return 0;

  return Math.round(
    (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
  );
}

/**
 * Calculate price based on Rendetalje business rules
 */
export function calculatePrice(
  workHours: number,
  isFixedPrice: boolean,
  customer: string
): number {
  // Fixed price customers
  if (isFixedPrice && customer === "Anne Sofie Kristensen") {
    return 1000;
  }

  // Standard pricing: 349 kr per work hour
  if (workHours > 0) {
    return Math.round(workHours * 349);
  }

  // Default fallback (should not happen with proper data)
  return 698; // 2 hours × 349 kr
}

/**
 * Parse calendar event and extract all booking information
 */
export function parseCalendarEvent(event: CalendarEvent): ParsedBooking {
  const { customer, type } = parseEventSummary(event.summary);
  const description = event.description || "";

  // Parse work hours from description
  const { workHours, duration, isFixedPrice } = parseWorkHours(
    description,
    customer
  );

  // If no work hours found in description, use calendar duration as fallback
  let finalWorkHours = workHours;
  let finalDuration = duration;

  if (workHours === 0 && !isFixedPrice) {
    const calendarHours = getCalendarDuration(event);
    finalWorkHours = calendarHours;
    finalDuration = `${calendarHours}t (calendar)`;
  }

  // Calculate price
  const price = calculatePrice(finalWorkHours, isFixedPrice, customer);

  return {
    customer,
    type,
    price,
    workHours: finalWorkHours,
    duration: finalDuration,
    isFixedPrice,
  };
}

/**
 * Format time range for display
 */
export function formatTimeRange(event: CalendarEvent): string {
  if (!event.start || !event.end) return "Hele dagen";

  const startTime =
    typeof event.start === "string"
      ? new Date(event.start)
      : new Date(event.start.dateTime || event.start.date || "");
  const endTime =
    typeof event.end === "string"
      ? new Date(event.end)
      : new Date(event.end.dateTime || event.end.date || "");

  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime()))
    return "Hele dagen";

  return `${startTime.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" })}-${endTime.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" })}`;
}

/**
 * Calculate total revenue from list of events
 */
export function calculateTotalRevenue(events: CalendarEvent[]): number {
  return events.reduce((total, event) => {
    const booking = parseCalendarEvent(event);
    return total + booking.price;
  }, 0);
}

/**
 * Business constants
 */
export const BUSINESS_CONSTANTS = {
  HOURLY_RATE: 349,
  DEFAULT_HOURS: 2,
  FIXED_PRICE_CUSTOMERS: {
    "Anne Sofie Kristensen": 1000,
  },
} as const;
