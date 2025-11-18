/**
 * Pricing Constants
 * 
 * Centralized pricing configuration for reports and calculations.
 * 
 * @module constants/pricing
 * 
 * @example
 * ```typescript
 * import { PRICING, calculateProfit } from "@/constants/pricing";
 * 
 * const revenue = calculateProfit(4); // 4 billable hours
 * console.log(revenue); // 1036 DKK
 * ```
 */

export const PRICING = {
  /** Hourly rate charged to customers (faktureret) */
  HOURLY_RATE: 349, // DKK per hour
  
  /** Labor cost per hour (løn) */
  LABOR_COST: 90, // DKK per hour per person
} as const;

/**
 * Calculate revenue from billable hours
 * 
 * @param billableHours - Total billable hours
 * @returns Revenue in DKK (billableHours × HOURLY_RATE)
 * 
 * @example
 * ```typescript
 * const revenue = calculateRevenue(4); // 4 hours
 * console.log(revenue); // 1396 DKK (4 × 349)
 * ```
 */
export function calculateRevenue(billableHours: number): number {
  return billableHours * PRICING.HOURLY_RATE;
}

/**
 * Calculate labor cost from billable hours
 * 
 * @param billableHours - Total billable hours
 * @returns Labor cost in DKK (billableHours × LABOR_COST)
 * 
 * @example
 * ```typescript
 * const cost = calculateLaborCost(4); // 4 hours
 * console.log(cost); // 360 DKK (4 × 90)
 * ```
 */
export function calculateLaborCost(billableHours: number): number {
  return billableHours * PRICING.LABOR_COST;
}

/**
 * Calculate profit (revenue - labor cost)
 * 
 * @param billableHours - Total billable hours
 * @returns Profit in DKK (revenue - labor cost)
 * 
 * @example
 * ```typescript
 * const profit = calculateProfit(4); // 4 hours
 * console.log(profit); // 1036 DKK (1396 - 360)
 * ```
 */
export function calculateProfit(billableHours: number): number {
  return calculateRevenue(billableHours) - calculateLaborCost(billableHours);
}

/**
 * Calculate profit margin percentage
 * 
 * @param billableHours - Total billable hours
 * @returns Profit margin as percentage (0-100)
 * 
 * @example
 * ```typescript
 * const margin = calculateProfitMargin(4); // 4 hours
 * console.log(margin); // 74.2% (1036 / 1396 × 100)
 * ```
 */
export function calculateProfitMargin(billableHours: number): number {
  const revenue = calculateRevenue(billableHours);
  if (revenue === 0) return 0;
  return (calculateProfit(billableHours) / revenue) * 100;
}

