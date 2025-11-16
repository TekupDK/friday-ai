/**
 * CRM Constants
 *
 * Shared constants for CRM module
 */

import { BarChart3, Users, Target, Calendar, type LucideIcon } from "lucide-react";

/**
 * Lead status values matching database enum
 * @see drizzle/schema.ts leadStatusInFridayAi
 */
export const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "won",
  "lost",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

/**
 * CRM Navigation Items
 * 
 * Centralized navigation configuration for CRM module.
 * Used by CRMLayout component for consistent navigation.
 */
export interface CRMNavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

export const CRM_NAV_ITEMS: readonly CRMNavItem[] = [
  { path: "/crm/dashboard", label: "Dashboard", icon: BarChart3 },
  { path: "/crm/customers", label: "Customers", icon: Users },
  { path: "/crm/leads", label: "Leads", icon: Target },
  { path: "/crm/bookings", label: "Bookings", icon: Calendar },
] as const;
