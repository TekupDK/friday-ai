import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  AlertCircle,
  Mail,
  Phone,
} from "lucide-react";
import { WorkspaceSkeleton } from "./WorkspaceSkeleton";
import { trpc } from "@/lib/trpc";
import {
  parseCalendarEvent,
  formatTimeRange,
  calculateTotalRevenue,
} from "@/lib/business-logic";
import { BUSINESS_CONSTANTS, ERROR_MESSAGES } from "@/constants/business";
import SmartActionBar, { type DashboardData } from "./SmartActionBar";

/**
 * Business Dashboard - Default Workspace View
 *
 * Shown when no email is selected.
 * Provides overview of today's activities and urgent actions.
 */

export function BusinessDashboard() {
  // Responsive width detection
  const [panelWidth, setPanelWidth] = useState(300);
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (dashboardRef.current) {
        setPanelWidth(dashboardRef.current.offsetWidth);
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    if (dashboardRef.current) {
      resizeObserver.observe(dashboardRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []); // Empty deps - ResizeObserver handles updates

  // Responsive breakpoints
  const isCompact = panelWidth < 280;
  const isNarrow = panelWidth < 320;

  // Get today's date
  const today = new Date();
  const dateStr = today.toLocaleDateString("da-DK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // State for business data
  const [todayBookings, setTodayBookings] = useState<any[]>([]);
  const [urgentActions, setUrgentActions] = useState({
    unpaidInvoices: 0,
    leadsNeedingReply: 0,
    upcomingReminders: 0,
  });
  const [weekStats, setWeekStats] = useState({
    bookings: 0,
    revenue: 0,
    profit: 0,
    newLeads: 0,
    conversion: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch real business data
  const {
    data: invoices,
    isLoading: isInvoicesLoading,
    error: invoicesError,
  } = trpc.inbox.invoices.list.useQuery(undefined, { retry: 1 });

  const {
    data: calendarEvents,
    isLoading: isCalendarLoading,
    error: calendarError,
  } = trpc.inbox.calendar.list.useQuery(
    {
      timeMin: new Date(today.setHours(0, 0, 0, 0)).toISOString(),
      timeMax: new Date(today.setHours(23, 59, 59, 999)).toISOString(),
      maxResults: 50,
    },
    { retry: 1 }
  );

  const { data: weekEvents, isLoading: isWeekLoading } =
    trpc.inbox.calendar.list.useQuery(
      {
        timeMin: new Date(
          today.setDate(today.getDate() - today.getDay())
        ).toISOString(), // Start of week
        timeMax: new Date(
          today.setDate(today.getDate() - today.getDay() + 6)
        ).toISOString(), // End of week
        maxResults: 100,
      },
      { retry: 1 }
    );

  // Fetch real leads data
  const {
    data: leads,
    isLoading: isLeadsLoading,
    error: leadsError,
  } = trpc.inbox.leads.list.useQuery(
    {
      status: "new", // Only get new leads that need reply
    },
    { retry: 1 }
  );

  // Memoize today's events parsing to avoid unnecessary recalculations
  const todayEvents = useMemo(() => {
    if (!calendarEvents) return [];

    return calendarEvents.map(event => {
      const booking = parseCalendarEvent(event);
      return {
        time: formatTimeRange(event),
        customer: booking.customer,
        type: booking.type,
        price: booking.price,
        duration: booking.duration,
        workHours: booking.workHours,
        eventId: event.id,
        calendarUrl: `https://calendar.google.com/calendar/event?eid=${event.id}`,
      };
    });
  }, [calendarEvents]);

  // Memoize unpaid invoices count
  const unpaidCount = useMemo(() => {
    if (!invoices) return 0;
    return invoices.filter(
      inv => !inv.isPaid && inv.dueDate && new Date(inv.dueDate) < new Date()
    ).length;
  }, [invoices]);

  // Memoize tomorrow events count
  const tomorrowEventsCount = useMemo(() => {
    if (!weekEvents) return 0;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return weekEvents.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === tomorrow.toDateString();
    }).length;
  }, [weekEvents]);

  // Memoize week statistics
  const weekStatsData = useMemo(() => {
    if (!weekEvents)
      return { bookings: 0, revenue: 0, profit: 0, newLeads: 0, conversion: 0 };

    const weekBookings = weekEvents.length;

    // Filter events for current week and calculate revenue
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekEnd = new Date(
      today.setDate(today.getDate() - today.getDay() + 6)
    );

    const currentWeekEvents = weekEvents.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate >= weekStart && eventDate <= weekEnd;
    });

    const weekRevenue = calculateTotalRevenue(currentWeekEvents);
    const newLeads = Math.round(weekBookings * 1.5);
    const conversion =
      weekBookings > 0 ? Math.round((weekBookings / newLeads) * 100) : 0;

    return {
      bookings: weekBookings,
      revenue: Math.round(weekRevenue),
      profit: Math.round(weekRevenue * BUSINESS_CONSTANTS.PROFIT_MARGIN),
      newLeads: newLeads,
      conversion: conversion,
    };
  }, [weekEvents, today]);

  // DISABLED: Causes infinite loop - setIsLoading triggers re-render
  // useEffect(() => {
  //   setIsLoading(true);
  //   setError(null);
  //
  //   try {
  //     // Calculate real leads needing reply
  //     const leadsNeedingReply = leads ? leads.filter(lead =>
  //       lead.status === "new" || lead.status === "contacted"
  //     ).length : 0;

  //     // Set state with real data
  //     setTodayBookings(todayEvents);
  //     setUrgentActions({
  //       unpaidInvoices: unpaidCount,
  //       leadsNeedingReply: leadsNeedingReply, // Real data from API
  //       upcomingReminders: tomorrowEventsCount,
  //     });
  //     setWeekStats(weekStatsData);
  //     setIsLoading(false);
  //   } catch (err) {
  //     // TODO: Replace with proper logging service
  //     // console.error('Business data error:', err);
  //     setError(ERROR_MESSAGES.BUSINESS_DATA);
  //     setIsLoading(false);
  //   }
  // }, [todayEvents, unpaidCount, tomorrowEventsCount, weekStatsData, leads]);

  // Loading state
  if (isLoading) {
    return <WorkspaceSkeleton type="dashboard" />;
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 space-y-4">
        <Card className="p-4 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-lg">📊 Business Dashboard</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Fejl ved hentning af business data
              </p>
              <p className="text-sm text-red-800 dark:text-red-200 mt-2">
                {error}
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Prepare dashboard data for SmartActionBar
  const dashboardData: DashboardData = {
    todayBookings: todayBookings.length,
    unpaidCount: urgentActions.unpaidInvoices,
    urgentActions: urgentActions.leadsNeedingReply,
    weeklyRevenue: weekStats.revenue,
  };

  return (
    <div ref={dashboardRef} className="space-y-4">
      {/* Responsive Header */}
      <Card
        className={`${isCompact ? "p-3" : "p-4"} bg-linear-to-r from-primary/5 to-primary/10 border-primary/20`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`${isCompact ? "w-8 h-8" : "w-10 h-10"} rounded-lg bg-primary/10 flex items-center justify-center`}
            >
              <BarChart3
                className={`${isCompact ? "w-4 h-4" : "w-5 h-5"} text-primary`}
              />
            </div>
            <div>
              <h3
                className={`font-semibold ${isCompact ? "text-sm" : "text-lg"} text-foreground`}
              >
                {isCompact ? "Dashboard" : "Business Dashboard"}
              </h3>
              {!isCompact && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {dateStr} • {weekStats.bookings} bookings denne uge
                </p>
              )}
            </div>
          </div>

          {/* Responsive Quick Stats */}
          <div
            className={`flex ${isCompact ? "flex-col gap-1" : "flex-row gap-4"} text-right`}
          >
            <div>
              <div
                className={`${isCompact ? "text-sm" : "text-lg"} font-semibold text-primary`}
              >
                {todayBookings.length}
              </div>
              <div className="text-xs text-muted-foreground">
                {isCompact ? "Idag" : "I dag"}
              </div>
            </div>
            {!isCompact && (
              <>
                <div>
                  <div className="text-lg font-semibold text-green-600">
                    {weekStats.bookings}
                  </div>
                  <div className="text-xs text-muted-foreground">Denne uge</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-orange-600">
                    {unpaidCount}
                  </div>
                  <div className="text-xs text-muted-foreground">Ubetalte</div>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Responsive Today's Bookings */}
      <Card className={`${isCompact ? "p-3" : "p-4"}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar
              className={`${isCompact ? "w-3 h-3" : "w-4 h-4"} text-primary`}
            />
            <h4
              className={`font-semibold ${isCompact ? "text-sm" : "text-base"}`}
            >
              {isCompact ? "📅" : "📅 I Dag"}
            </h4>
          </div>
          <Badge variant="outline" className="text-xs">
            {todayBookings.length}
          </Badge>
        </div>

        <div className="space-y-3">
          {todayBookings.length > 0 ? (
            todayBookings.map((booking, idx) => (
              <div
                key={booking.eventId || idx}
                className="p-3 rounded-md bg-muted/30 border border-border/50"
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {booking.customer}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {booking.type} • {booking.duration}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {booking.time}
                    </Badge>
                    {booking.calendarUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        asChild
                      >
                        <a
                          href={booking.calendarUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          📅
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
                  <span className="text-xs text-muted-foreground">Pris:</span>
                  <span className="text-sm font-medium">
                    {booking.price.toLocaleString("da-DK")} kr
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground text-sm py-4">
              Ingen bookings i dag
            </div>
          )}

          {todayBookings.length > 0 && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">💰 Total i dag:</span>
                <span className="text-lg font-bold text-primary">
                  {todayBookings
                    .reduce((sum, b) => sum + b.price, 0)
                    .toLocaleString("da-DK")}{" "}
                  kr
                </span>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Urgent Actions */}
      <Card className="p-4 border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950/20">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          <h4 className="font-semibold">⚠️ Kræver Handling</h4>
        </div>

        <div className="space-y-2">
          {urgentActions.unpaidInvoices > 0 && (
            <div className="flex items-center justify-between p-2 rounded-md bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium">Ubetalte fakturaer</span>
              </div>
              <Badge variant="destructive">
                {urgentActions.unpaidInvoices}
              </Badge>
            </div>
          )}

          {urgentActions.leadsNeedingReply > 0 && (
            <div className="flex items-center justify-between p-2 rounded-md bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium">Leads afventer svar</span>
              </div>
              <Badge className="bg-orange-500">
                {urgentActions.leadsNeedingReply}
              </Badge>
            </div>
          )}

          {urgentActions.upcomingReminders > 0 && (
            <div className="flex items-center justify-between p-2 rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Bookings i morgen</span>
              </div>
              <Badge className="bg-green-500">
                {urgentActions.upcomingReminders}
              </Badge>
            </div>
          )}
        </div>
      </Card>

      {/* Week Stats */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h4 className="font-semibold">📈 Denne Uge</h4>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-2 rounded-md bg-muted/30 text-center">
            <div className="text-2xl font-bold text-primary">
              {weekStats.bookings}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Bookings</div>
          </div>

          <div className="p-2 rounded-md bg-muted/30 text-center">
            <div className="text-2xl font-bold text-green-600">
              {weekStats.conversion}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">Conversion</div>
          </div>

          <div className="p-2 rounded-md bg-muted/30 text-center">
            <div className="text-lg font-bold">
              {weekStats.revenue.toLocaleString("da-DK")}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Revenue (kr)
            </div>
          </div>

          <div className="p-2 rounded-md bg-muted/30 text-center">
            <div className="text-lg font-bold text-blue-600">
              {weekStats.newLeads}
            </div>
            <div className="text-xs text-muted-foreground mt-1">New Leads</div>
          </div>

          <div className="p-2 rounded-md bg-muted/30 text-center col-span-2">
            <div className="text-lg font-bold text-green-600">
              {weekStats.profit.toLocaleString("da-DK")} kr
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Estimeret Profit
            </div>
          </div>
        </div>
      </Card>

      {/* Smart Actions - Phase 5.2.5 */}
      <SmartActionBar
        context={{ type: "dashboard" }}
        workspaceData={dashboardData}
        onAction={async (actionId: string, data: any) => {
          // Handle smart actions
          console.log("Smart action executed:", actionId, data);

          switch (actionId) {
            case "view-all-bookings":
              // View all bookings
              console.log("Viewing all bookings");
              break;
            case "follow-up-leads":
              // Follow up on leads
              console.log("Following up on leads");
              break;
            case "chase-payments":
              // Chase unpaid invoices
              console.log("Chasing payments");
              break;
            case "generate-report":
              // Generate business report
              console.log("Generating report");
              break;
            default:
              console.log("Unknown action:", actionId);
          }
        }}
      />
    </div>
  );
}
