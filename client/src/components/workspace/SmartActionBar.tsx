/**
 * SmartActionBar - Context-Aware Action System
 *
 * Phase 5.1: Centralized action system for all workspace components.
 * Replaces hardcoded quick actions with intelligent, context-aware actions.
 *
 * Features:
 * - Context-based action generation
 * - Permission-aware actions
 * - Consistent UI/UX across all workspaces
 * - Extensible action system
 * - Performance optimized with memoization
 */

import {
  Calendar,
  DollarSign,
  Mail,
  Phone,
  Users,
  FileText,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  Clock,
  Star,
  Edit,
  Trash2,
  ExternalLink,
  Plus,
  Settings,
} from "lucide-react";
import { useCallback, useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BUSINESS_CONSTANTS, UI_CONSTANTS } from "@/constants/business";
import { logger } from "@/lib/logger";
import {
  EmailContextData,
  WorkspaceContext,
} from "@/services/emailContextDetection";

// Base action interface
export interface SmartAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: "default" | "outline" | "secondary" | "destructive" | "ghost";
  priority: "high" | "medium" | "low";
  badge?: string;
  disabled?: boolean;
  disabledReason?: string;
  handler: () => void | Promise<void>;
  category?:
    | "communication"
    | "scheduling"
    | "financial"
    | "administrative"
    | "analytics";
}

// Workspace data types
export interface LeadData {
  customerName: string;
  customerEmail: string;
  estimate: {
    totalPrice: number;
    size: number;
    travelCost: number;
  };
  address: string;
  leadType: string;
}

export interface BookingData {
  customer: string;
  email: string;
  phone: string;
  address: string;
  date: string;
  time: string;
  duration: string;
  type: string;
  size: string;
  team: string;
  price: number;
  profit: number;
  status: "confirmed" | "upcoming" | "completed" | "cancelled";
  eventId?: string;
  calendarUrl?: string;
}

export interface InvoiceData {
  customer: string;
  email: string;
  amount: number;
  dueDate: string;
  status: "paid" | "unpaid" | "overdue" | "cancelled";
  isPaid: boolean;
  invoiceId?: string;
  invoiceUrl?: string;
}

export interface CustomerData {
  name: string;
  email: string;
  phone: string;
  address: string;
  totalBookings: number;
  totalValue: number;
  status: "active" | "inactive" | "vip";
  lastBooking?: string;
}

export interface DashboardData {
  todayBookings: number;
  unpaidCount: number;
  urgentActions: number;
  weeklyRevenue: number;
}

interface SmartActionBarProps {
  context: EmailContextData;
  workspaceData:
    | LeadData
    | BookingData
    | InvoiceData
    | CustomerData
    | DashboardData;
  onAction: (actionId: string, data: any) => void | Promise<void>;
  userRole?: "admin" | "user";
  permissions?: string[];
  isLoading?: boolean;
}

// Action generators for each context type
const generateLeadActions = (
  data: LeadData,
  permissions: string[] = []
): SmartAction[] => {
  const actions: SmartAction[] = [
    {
      id: "send-standard-offer",
      label: "Send Standard Tilbud",
      icon: Mail,
      variant: "default",
      priority: "high",
      badge: "Auto-fill",
      category: "communication",
      handler: () => logger.debug("Send standard offer", { email: data.customerEmail }),
    },
    {
      id: "book-directly",
      label: "Book Direkte i Kalender",
      icon: Calendar,
      variant: "outline",
      priority: "high",
      category: "scheduling",
      handler: () => logger.debug("Book directly", { customer: data.customerName }),
    },
    {
      id: "call-customer",
      label: "Ring til Kunde",
      icon: Phone,
      variant: "outline",
      priority: "medium",
      category: "communication",
      handler: () => logger.debug("Call customer"),
    },
    {
      id: "create-custom-offer",
      label: "Opret Special Tilbud",
      icon: Edit,
      variant: "outline",
      priority: "medium",
      badge: "Premium",
      category: "financial",
      handler: () => logger.debug("Create custom offer"),
    },
  ];

  // Add admin-only actions
  if (permissions.includes("admin")) {
    actions.push({
      id: "export-lead-data",
      label: "Eksporter Lead Data",
      icon: ExternalLink,
      variant: "ghost",
      priority: "low",
      category: "analytics",
      handler: () => logger.debug("Export lead data"),
    });
  }

  return actions;
};

const generateBookingActions = (
  data: BookingData,
  permissions: string[] = []
): SmartAction[] => {
  const actions: SmartAction[] = [];

  // Status-specific actions
  switch (data.status) {
    case "upcoming":
      actions.push(
        {
          id: "send-confirmation",
          label: "Send Bekræftelse",
          icon: Mail,
          variant: "default",
          priority: "high",
          category: "communication",
          handler: () => logger.debug("Send confirmation", { email: data.email }),
        },
        {
          id: "update-calendar",
          label: "Opdater Calendar Event",
          icon: Calendar,
          variant: "outline",
          priority: "medium",
          category: "scheduling",
          handler: () => logger.debug("Update calendar event"),
        },
        {
          id: "call-customer",
          label: "Ring til Kunde",
          icon: Phone,
          variant: "outline",
          priority: "medium",
          category: "communication",
          handler: () => logger.debug("Call customer", { phone: data.phone }),
        }
      );
      break;

    case "completed":
      actions.push(
        {
          id: "send-thank-you",
          label: "Send Tak Email",
          icon: Mail,
          variant: "default",
          priority: "high",
          category: "communication",
          handler: () => logger.debug("Send thank you email"),
        },
        {
          id: "create-invoice",
          label: "Opret Faktura",
          icon: DollarSign,
          variant: "outline",
          priority: "high",
          badge: `${data.price} kr`,
          category: "financial",
          handler: () => logger.debug("Create invoice", { price: data.price }),
        },
        {
          id: "book-next",
          label: "Book Næste Opgave",
          icon: Calendar,
          variant: "outline",
          priority: "medium",
          category: "scheduling",
          handler: () => logger.debug("Book next job"),
        }
      );
      break;

    case "confirmed":
      actions.push(
        {
          id: "create-calendar-event",
          label: "Opret Calendar Event",
          icon: Calendar,
          variant: "default",
          priority: "high",
          category: "scheduling",
          handler: () => logger.debug("Create calendar event"),
        },
        {
          id: "send-confirmation",
          label: "Send Bekræftelse",
          icon: Mail,
          variant: "outline",
          priority: "medium",
          category: "communication",
          handler: () => logger.debug("Send confirmation"),
        },
        {
          id: "call-customer",
          label: "Ring til Kunde",
          icon: Phone,
          variant: "outline",
          priority: "medium",
          category: "communication",
          handler: () => logger.debug("Call customer", { phone: data.phone }),
        }
      );
      break;
  }

  // Common actions for all bookings
  actions.push({
    id: "view-customer-history",
    label: "Se Kunde Historik",
    icon: Users,
    variant: "secondary",
    priority: "low",
    category: "analytics",
    handler: () => logger.debug("View customer history"),
  });

  return actions;
};

const generateInvoiceActions = (
  data: InvoiceData,
  permissions: string[] = []
): SmartAction[] => {
  const actions: SmartAction[] = [];

  if (!data.isPaid) {
    actions.push(
      {
        id: "send-payment-reminder",
        label:
          data.status === "overdue"
            ? "Send Rykker"
            : "Send Betaling Påmindelse",
        icon: DollarSign,
        variant: data.status === "overdue" ? "destructive" : "default",
        priority: data.status === "overdue" ? "high" : "medium",
        badge: data.status === "overdue" ? "Forsinket" : undefined,
        category: "financial",
        handler: () => logger.debug("Send payment reminder"),
      },
      {
        id: "edit-invoice",
        label: "Rediger Faktura",
        icon: Edit,
        variant: "outline",
        priority: "medium",
        category: "administrative",
        handler: () => logger.debug("Edit invoice"),
      }
    );
  }

  if (data.isPaid) {
    actions.push({
      id: "send-receipt",
      label: "Send Kvittering",
      icon: Mail,
      variant: "outline",
      priority: "low",
      category: "communication",
      handler: () => logger.debug("Send receipt"),
    });
  }

  // Common actions
  actions.push({
    id: "view-customer-history",
    label: "Se Kunde Historik",
    icon: Users,
    variant: "secondary",
    priority: "low",
    category: "analytics",
    handler: () => logger.debug("View customer history"),
  });

  return actions;
};

const generateCustomerActions = (
  data: CustomerData,
  permissions: string[] = []
): SmartAction[] => {
  const actions: SmartAction[] = [
    {
      id: "send-email",
      label: "Send Email",
      icon: Mail,
      variant: "default",
      priority: "high",
      category: "communication",
      handler: () => logger.debug("Send email", { email: data.email }),
    },
    {
      id: "schedule-booking",
      label: "Book Ny Opgave",
      icon: Calendar,
      variant: "outline",
      priority: "high",
      category: "scheduling",
      handler: () => logger.debug("Schedule new booking"),
    },
    {
      id: "call-customer",
      label: "Ring til Kunde",
      icon: Phone,
      variant: "outline",
      priority: "medium",
      category: "communication",
      handler: () => logger.debug("Call customer", { phone: data.phone }),
    },
    {
      id: "view-analytics",
      label: "Se Kundestatistik",
      icon: TrendingUp,
      variant: "outline",
      priority: "medium",
      badge: `${data.totalBookings} bookinger`,
      category: "analytics",
      handler: () => logger.debug("View customer analytics"),
    },
  ];

  // VIP customer actions
  if (data.status === "vip") {
    actions.unshift({
      id: "vip-special-offer",
      label: "VIP Special Tilbud",
      icon: Star,
      variant: "default",
      priority: "high",
      badge: "VIP",
      category: "financial",
      handler: () => logger.debug("Create VIP special offer"),
    });
  }

  return actions;
};

const generateDashboardActions = (
  data: DashboardData,
  permissions: string[] = []
): SmartAction[] => {
  const actions: SmartAction[] = [
    {
      id: "view-all-bookings",
      label: "Se Alle Bookinger",
      icon: Calendar,
      variant: "outline",
      priority: "medium",
      badge: `${data.todayBookings} i dag`,
      category: "scheduling",
      handler: () => logger.debug("View all bookings"),
    },
    {
      id: "handle-unpaid-invoices",
      label: "Håndter Ubetalte Fakturaer",
      icon: DollarSign,
      variant: data.unpaidCount > 0 ? "default" : "outline",
      priority: data.unpaidCount > 0 ? "high" : "low",
      badge: data.unpaidCount > 0 ? `${data.unpaidCount}` : undefined,
      category: "financial",
      handler: () => logger.debug("Handle unpaid invoices"),
    },
    {
      id: "address-urgent-actions",
      label: "Håndter Presserende Handlinger",
      icon: AlertTriangle,
      variant: data.urgentActions > 0 ? "destructive" : "outline",
      priority: data.urgentActions > 0 ? "high" : "low",
      badge: data.urgentActions > 0 ? `${data.urgentActions}` : undefined,
      category: "administrative",
      handler: () => logger.debug("Address urgent actions"),
    },
    {
      id: "weekly-report",
      label: "Ugentlig Rapport",
      icon: TrendingUp,
      variant: "outline",
      priority: "low",
      badge: `${data.weeklyRevenue} kr`,
      category: "analytics",
      handler: () => logger.debug("Generate weekly report"),
    },
  ];

  // Admin-only dashboard actions
  if (permissions.includes("admin")) {
    actions.push({
      id: "system-settings",
      label: "System Indstillinger",
      icon: Settings,
      variant: "ghost",
      priority: "low",
      category: "administrative",
      handler: () => logger.debug("Open system settings"),
    });
  }

  return actions;
};

// Main action generator
const generateSmartActions = (
  context: EmailContextData,
  workspaceData: any,
  permissions: string[] = []
): SmartAction[] => {
  switch (context.type) {
    case "lead":
      return generateLeadActions(workspaceData as LeadData, permissions);
    case "booking":
      return generateBookingActions(workspaceData as BookingData, permissions);
    case "invoice":
      return generateInvoiceActions(workspaceData as InvoiceData, permissions);
    case "customer":
      return generateCustomerActions(
        workspaceData as CustomerData,
        permissions
      );
    case "dashboard":
      return generateDashboardActions(
        workspaceData as DashboardData,
        permissions
      );
    default:
      return [];
  }
};

export default function SmartActionBar({
  context,
  workspaceData,
  onAction,
  userRole = "user",
  permissions = [],
  isLoading = false,
}: SmartActionBarProps) {
  // Generate actions based on context and data
  const actions = useMemo(() => {
    return generateSmartActions(context, workspaceData, permissions);
  }, [context, workspaceData, permissions]);

  // Group actions by priority and category
  const groupedActions = useMemo(() => {
    const high = actions.filter(a => a.priority === "high");
    const medium = actions.filter(a => a.priority === "medium");
    const low = actions.filter(a => a.priority === "low");

    return { high, medium, low };
  }, [actions]);

  // Handle action execution
  const handleAction = useCallback(
    async (action: SmartAction) => {
      if (action.disabled || isLoading) return;

      try {
        await action.handler();
        await onAction(action.id, { context, workspaceData, action });
      } catch (error) {
        logger.error("Smart action failed", { actionId: action.id }, error);
      }
    },
    [onAction, context, workspaceData, isLoading]
  );

  // No actions available
  if (actions.length === 0) {
    return null;
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <h4 className="font-semibold text-sm">🚀 Smart Actions</h4>
          <Badge variant="outline" className="text-xs">
            {actions.length}
          </Badge>
        </div>

        {/* High Priority Actions */}
        {groupedActions.high.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-red-500" />
              <span className="text-xs font-medium text-muted-foreground">
                Presserende
              </span>
            </div>
            <div className="space-y-2">
              {groupedActions.high.map(action => (
                <Button
                  key={action.id}
                  variant={action.variant}
                  size="sm"
                  className="w-full justify-start gap-2 h-8"
                  onClick={() => handleAction(action)}
                  disabled={action.disabled || isLoading}
                >
                  <action.icon className="w-4 h-4" />
                  <span className="flex-1 text-left">{action.label}</span>
                  {action.badge && (
                    <Badge
                      variant="secondary"
                      className="text-xs h-4 px-1.5 py-0"
                    >
                      {action.badge}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Medium Priority Actions */}
        {groupedActions.medium.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-yellow-500" />
              <span className="text-xs font-medium text-muted-foreground">
                Anbefalede
              </span>
            </div>
            <div className="space-y-2">
              {groupedActions.medium.map(action => (
                <Button
                  key={action.id}
                  variant={action.variant}
                  size="sm"
                  className="w-full justify-start gap-2 h-8"
                  onClick={() => handleAction(action)}
                  disabled={action.disabled || isLoading}
                >
                  <action.icon className="w-4 h-4" />
                  <span className="flex-1 text-left">{action.label}</span>
                  {action.badge && (
                    <Badge
                      variant="secondary"
                      className="text-xs h-4 px-1.5 py-0"
                    >
                      {action.badge}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Low Priority Actions */}
        {groupedActions.low.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Settings className="w-3 h-3 text-blue-500" />
              <span className="text-xs font-medium text-muted-foreground">
                Andre
              </span>
            </div>
            <div className="space-y-2">
              {groupedActions.low.map(action => (
                <Button
                  key={action.id}
                  variant={action.variant}
                  size="sm"
                  className="w-full justify-start gap-2 h-8"
                  onClick={() => handleAction(action)}
                  disabled={action.disabled || isLoading}
                >
                  <action.icon className="w-4 h-4" />
                  <span className="flex-1 text-left">{action.label}</span>
                  {action.badge && (
                    <Badge
                      variant="secondary"
                      className="text-xs h-4 px-1.5 py-0"
                    >
                      {action.badge}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
