/**
 * Booking Calendar Page
 *
 * Calendar view for managing service bookings
 */

import React from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { AppleCard } from "@/components/crm/apple-ui";
import { trpc } from "@/lib/trpc";
import CRMLayout from "@/components/crm/CRMLayout";
import { formatDate } from "@/lib/dateUtils";
import { LoadingSpinner } from "@/components/crm/LoadingSpinner";
import { ErrorDisplay } from "@/components/crm/ErrorDisplay";

export default function BookingCalendar() {
  usePageTitle("Booking Calendar");
  const { data: bookings, isLoading, error, isError } = trpc.crm.booking.listBookings.useQuery({
    limit: 100,
  });

  return (
    <CRMLayout>
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

        {/* Calendar Placeholder */}
        {isLoading ? (
          <div role="status" aria-live="polite" aria-label="Loading bookings">
            <LoadingSpinner message="Loading bookings..." />
          </div>
        ) : isError ? (
          <ErrorDisplay message="Failed to load bookings" error={error} />
        ) : (
          <section aria-label="Booking calendar">
            <AppleCard variant="elevated">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Calendar View</h2>
                <p className="text-muted-foreground mb-4">
                  FullCalendar integration will be added here
                </p>
                {bookings && bookings.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium" aria-live="polite">
                      {bookings.length} booking{bookings.length !== 1 ? "s" : ""} found
                    </p>
                    <div className="space-y-1" role="list" aria-label="Bookings list">
                      {bookings.slice(0, 5).map((booking) => (
                        <div
                          key={booking.id}
                          className="p-3 bg-muted/50 rounded-lg"
                          role="listitem"
                          aria-label={`Booking scheduled for ${formatDate(booking.scheduledStart)}, status: ${booking.status}`}
                        >
                          <p className="font-medium text-sm">
                            {formatDate(booking.scheduledStart)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Status: {booking.status}
                          </p>
                        </div>
                      ))}
                      {bookings.length > 5 && (
                        <p className="text-sm text-muted-foreground text-center py-2" role="status">
                          +{bookings.length - 5} more bookings
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground" role="status">No bookings found</p>
                )}
              </div>
            </AppleCard>
          </section>
        )}
        </div>
      </main>
    </CRMLayout>
  );
}

