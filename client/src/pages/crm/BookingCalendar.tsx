/**
 * Booking Calendar Page
 *
 * Calendar view for managing service bookings
 */

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { AppleButton, AppleCard } from "@/components/crm/apple-ui";
import CRMLayout from "@/components/crm/CRMLayout";
import { ErrorDisplay } from "@/components/crm/ErrorDisplay";
import { LoadingSpinner } from "@/components/crm/LoadingSpinner";
import { PanelErrorBoundary } from "@/components/PanelErrorBoundary";
import { usePageTitle } from "@/hooks/usePageTitle";
import { trpc } from "@/lib/trpc";

export default function BookingCalendar() {
  usePageTitle("Booking Calendar");
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first and last day of month for filtering
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

  const {
    data: bookings,
    isLoading,
    error,
    isError,
  } = trpc.crm.booking.listBookings.useQuery({
    start: startOfMonth.toISOString(),
    end: endOfMonth.toISOString(),
    limit: 200,
  });

  // Group bookings by date
  const bookingsByDate = useMemo(() => {
    if (!bookings) return {};
    const grouped: Record<string, typeof bookings> = {};
    bookings.forEach(booking => {
      const date = new Date(booking.scheduledStart).toISOString().split("T")[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(booking);
    });
    return grouped;
  }, [bookings]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday

    const days: Date[] = [];
    const current = new Date(startDate);
    while (current <= lastDay || days.length < 42) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
      if (days.length >= 42) break;
    }
    return days;
  }, [year, month]);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month;
  };

  const getDateKey = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  return (
    <CRMLayout>
      <PanelErrorBoundary name="Booking Calendar">
        <main className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <header>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Booking Calendar</h1>
                  <p className="text-muted-foreground mt-1">
                    View and manage service bookings
                  </p>
                </div>
              </div>
            </header>

            {/* Calendar */}
            {isLoading ? (
              <div
                role="status"
                aria-live="polite"
                aria-label="Loading bookings"
              >
                <LoadingSpinner message="Loading bookings..." />
              </div>
            ) : isError ? (
              <ErrorDisplay message="Failed to load bookings" error={error} />
            ) : (
              <section aria-label="Booking calendar">
                <AppleCard variant="elevated">
                  <div className="p-6">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-semibold">
                        {monthNames[month]} {year}
                      </h2>
                      <div className="flex items-center gap-2">
                        <AppleButton
                          variant="tertiary"
                          onClick={() => navigateMonth("prev")}
                          leftIcon={<ChevronLeft className="w-4 h-4" />}
                        >
                          Previous
                        </AppleButton>
                        <AppleButton
                          variant="tertiary"
                          onClick={() => setCurrentDate(new Date())}
                        >
                          Today
                        </AppleButton>
                        <AppleButton
                          variant="tertiary"
                          onClick={() => navigateMonth("next")}
                          leftIcon={<ChevronRight className="w-4 h-4" />}
                        >
                          Next
                        </AppleButton>
                      </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {/* Day Headers */}
                      {dayNames.map(day => (
                        <div
                          key={day}
                          className="p-2 text-center text-sm font-semibold text-muted-foreground"
                        >
                          {day}
                        </div>
                      ))}

                      {/* Calendar Days */}
                      {calendarDays.map((date, idx) => {
                        const dateKey = getDateKey(date);
                        const dayBookings = bookingsByDate[dateKey] || [];
                        const isCurrentMonthDay = isCurrentMonth(date);
                        const isTodayDate = isToday(date);

                        return (
                          <div
                            key={idx}
                            className={`min-h-[100px] p-2 border border-border rounded ${
                              !isCurrentMonthDay
                                ? "bg-muted/30 text-muted-foreground"
                                : "bg-background"
                            } ${isTodayDate ? "ring-2 ring-primary" : ""}`}
                          >
                            <div
                              className={`text-sm font-medium mb-1 ${
                                isTodayDate ? "text-primary" : ""
                              }`}
                            >
                              {date.getDate()}
                            </div>
                            <div className="space-y-1">
                              {dayBookings.slice(0, 3).map(booking => (
                                <div
                                  key={booking.id}
                                  className={`text-xs p-1 rounded truncate ${
                                    booking.status === "completed"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                      : booking.status === "in_progress"
                                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                        : booking.status === "cancelled"
                                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                          : "bg-primary/10 text-primary"
                                  }`}
                                  title={`${new Date(
                                    booking.scheduledStart
                                  ).toLocaleTimeString("da-DK", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })} - ${booking.status}`}
                                >
                                  {new Date(
                                    booking.scheduledStart
                                  ).toLocaleTimeString("da-DK", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              ))}
                              {dayBookings.length > 3 && (
                                <div className="text-xs text-muted-foreground">
                                  +{dayBookings.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Legend */}
                    <div className="mt-6 flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-primary/10"></div>
                        <span>Planned</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-900"></div>
                        <span>In Progress</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900"></div>
                        <span>Completed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-900"></div>
                        <span>Cancelled</span>
                      </div>
                    </div>

                    {/* Summary */}
                    {bookings && bookings.length > 0 && (
                      <div className="mt-4 text-sm text-muted-foreground">
                        {bookings.length} booking
                        {bookings.length !== 1 ? "s" : ""} in{" "}
                        {monthNames[month]} {year}
                      </div>
                    )}
                  </div>
                </AppleCard>
              </section>
            )}
          </div>
        </main>
      </PanelErrorBoundary>
    </CRMLayout>
  );
}
