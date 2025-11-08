import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, MapPin, Users, Clock } from "lucide-react";
import { WorkspaceSkeleton } from "./WorkspaceSkeleton";
import { trpc } from "@/lib/trpc";
import { parseCalendarEvent, formatTimeRange } from "@/lib/business-logic";
import { BUSINESS_CONSTANTS } from "@/constants/business";
import SmartActionBar, { type BookingData } from "./SmartActionBar";

interface BookingManagerProps {
  context: {
    emailId?: string;
    threadId?: string;
    subject?: string;
    from?: string;
    body?: string;
    labels?: string[];
  };
}

export function BookingManager({ context }: BookingManagerProps) {
  // Extract booking data from email context
  const subject = context.subject || "";
  const from = context.from || "";
  const body = context.body || "";

  // Extract customer name from email
  const customerName = from.replace(/<.*>/, '').trim() || "Kunde";
  
  // Extract email address
  const emailMatch = from.match(/<(.+)>/);
  const customerEmail = emailMatch ? emailMatch[1] : from;

  // Parse date from subject (e.g., "Re: November opstart")
  const monthMatch = subject.match(/(januar|februar|marts|april|maj|juni|juli|august|september|oktober|november|december)/i);
  const month = monthMatch ? monthMatch[1] : "Ikke angivet";

  // Detect booking type from keywords
  let bookingType = "Rengøring";
  if (subject.toLowerCase().includes("flytte") || body.toLowerCase().includes("flytte")) {
    bookingType = "Flytterengøring";
  } else if (subject.toLowerCase().includes("hovedrengøring")) {
    bookingType = "Hovedrengøring";
  } else if (subject.toLowerCase().includes("fast")) {
    bookingType = "Fast rengøring";
  }

  // Parse address from body if present
  const addressMatch = body.match(/([A-ZÆØÅ][a-zæøå]+(?:\s+[A-ZÆØÅ]?[a-zæøå]+)*\s+\d+[a-z]?,?\s*\d{4}\s*[A-ZÆØÅ]?)/);
  const address = addressMatch ? addressMatch[0] : "Adresse ikke angivet";

  // State for calendar data
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch calendar events for this customer
  const { data: calendarEvents, isLoading: isCalendarLoading, error: calendarError } = trpc.inbox.calendar.list.useQuery(
    {
      timeMin: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
      timeMax: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
      maxResults: 50,
    },
    {
      retry: 1,
    }
  );

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    if (calendarEvents && calendarEvents.length > 0) {
      // Find events matching this customer (by name or email in title/description)
      const customerEvents = calendarEvents.filter(event => 
        event.summary?.toLowerCase().includes(customerName.toLowerCase()) ||
        event.description?.toLowerCase().includes(customerName.toLowerCase()) ||
        event.description?.toLowerCase().includes(customerEmail.toLowerCase())
      );

      if (customerEvents.length > 0) {
        // Get the most recent/future event
        const nextEvent = customerEvents
          .filter(event => new Date(event.start) > new Date())
          .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0] || 
          customerEvents[customerEvents.length - 1];

        // Parse booking using centralized business logic
        const parsedBooking = parseCalendarEvent(nextEvent);
        const profit = Math.round(parsedBooking.price * 0.7);

        setBooking({
          customer: customerName,
          email: customerEmail,
          phone: "Ikke angivet", // Would need customer lookup
          address: nextEvent.location || address,
          date: nextEvent.start ? new Date(nextEvent.start).toLocaleDateString('da-DK') : `${month} 2025`,
          time: nextEvent.start ? new Date(nextEvent.start).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' }) : "Ikke angivet",
          duration: parsedBooking.duration,
          type: parsedBooking.type,
          size: nextEvent.description?.match(/(\d+)\s*m²/)?.[1] ? `${nextEvent.description.match(/(\d+)\s*m²/)![1]} m²` : "Ikke angivet",
          team: nextEvent.description?.match(/Team:\s*(.+)/)?.[1] || "Jonas + Team",
          price: parsedBooking.price,
          profit: profit,
          status: new Date(nextEvent.start) > new Date() ? "upcoming" : "completed",
          eventId: nextEvent.id,
          calendarUrl: `https://calendar.google.com/calendar/event?eid=${nextEvent.id}`,
        });
      } else {
        // Fallback to parsed data
        setBooking({
          customer: customerName,
          email: customerEmail,
          phone: BUSINESS_CONSTANTS.DEFAULT_PHONE,
          address: address,
          date: `${month} 2025`,
          time: BUSINESS_CONSTANTS.DEFAULT_TIME,
          duration: BUSINESS_CONSTANTS.DEFAULT_DURATION,
          type: bookingType,
          size: BUSINESS_CONSTANTS.DEFAULT_SIZE,
          team: BUSINESS_CONSTANTS.DEFAULT_TEAM,
          price: BUSINESS_CONSTANTS.STANDARD_BOOKING_PRICE,
          profit: BUSINESS_CONSTANTS.STANDARD_BOOKING_PROFIT,
          status: "confirmed" as const,
        });
      }
      setIsLoading(false);
    } else if (calendarError) {
      setError("Kunne ikke hente kalender data");
      setIsLoading(false);
    } else {
      // Fallback to parsed data
      setBooking({
        customer: customerName,
        email: customerEmail,
        phone: BUSINESS_CONSTANTS.DEFAULT_PHONE,
        address: address,
        date: `${month} 2025`,
        time: BUSINESS_CONSTANTS.DEFAULT_TIME,
        duration: BUSINESS_CONSTANTS.DEFAULT_DURATION,
        type: bookingType,
        size: BUSINESS_CONSTANTS.DEFAULT_SIZE,
        team: BUSINESS_CONSTANTS.DEFAULT_TEAM,
        price: BUSINESS_CONSTANTS.STANDARD_BOOKING_PRICE,
        profit: BUSINESS_CONSTANTS.STANDARD_BOOKING_PROFIT,
        status: "confirmed" as const,
      });
      setIsLoading(false);
    }
  }, [calendarEvents, calendarError, customerName, customerEmail, month, bookingType, address]);

  // Loading state
  if (isLoading) {
    return <WorkspaceSkeleton type="booking" />;
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <Card className="p-4 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-lg">📅 Booking Manager</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Fejl ved hentning af kalender</p>
              <p className="text-sm text-red-800 dark:text-red-200 mt-2">{error}</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!booking) return null;

  // Status badge configuration
  const getStatusBadge = (status: string) => {
    if (status === "upcoming") return { variant: "default" as const, text: "Kommende", color: "bg-blue-500" };
    if (status === "completed") return { variant: "secondary" as const, text: "Afsluttet", color: "bg-gray-500" };
    return { variant: "default" as const, text: "Bekræftet", color: "bg-green-500" };
  };

  const statusBadge = getStatusBadge(booking.status);

  return (
    <div className="space-y-4">
      <Card className="p-4 border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg">📅 Booking Manager</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {booking.status === "upcoming" ? "Kommende booking" : "Booking detaljer"}
              {booking.eventId && " • Calendar ID: " + booking.eventId}
            </p>
          </div>
          <Badge variant={statusBadge.variant} className={statusBadge.color}>
            {statusBadge.text}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div>
            <div className="font-semibold">{booking.customer}</div>
            <div className="text-xs text-muted-foreground">{booking.email}</div>
            <div className="text-xs text-muted-foreground">{booking.phone}</div>
          </div>
          <div className="text-muted-foreground">{booking.address}</div>
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="font-semibold mb-3">📋 Booking Detaljer</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dato:</span>
            <span className="font-medium">{booking.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tid:</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span className="font-medium">{booking.time}</span>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Varighed:</span>
            <span className="font-medium">{booking.duration}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type:</span>
            <span className="font-medium">{booking.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Størrelse:</span>
            <span className="font-medium">{booking.size}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Adresse:</span>
            <div className="flex items-center gap-1 max-w-[200px]">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="font-medium text-right">{booking.address}</span>
            </div>
          </div>
          {booking.calendarUrl && (
            <div className="pt-2">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href={booking.calendarUrl} target="_blank" rel="noopener noreferrer">
                  📅 Åbn i Google Calendar
                </a>
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="font-semibold mb-3">💼 Team & Økonomi</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Team:</span>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span className="font-medium">{booking.team}</span>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pris:</span>
            <span className="font-medium">{booking.price} kr</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Profit:</span>
            <span className="font-medium text-green-600">~{booking.profit} kr</span>
          </div>
        </div>
      </Card>

      {/* Smart Actions - Phase 5.1 */}
      <SmartActionBar
        context={{ ...context, type: "booking" }}
        workspaceData={booking}
        onAction={async (actionId, data) => {
          // Handle smart actions
          console.log("Smart action executed:", actionId, data);
          
          // TODO: Implement actual action handlers
          switch (actionId) {
            case "send-reminder":
              // Send reminder logic
              break;
            case "call-customer":
              // Call customer logic
              break;
            case "update-calendar":
              // Update calendar logic
              break;
            case "send-thanks-email":
              // Send thanks email logic
              break;
            case "create-invoice":
              // Create invoice logic
              break;
            case "book-next":
              // Book next job logic
              break;
            case "create-calendar-event":
              // Create calendar event logic
              break;
            case "send-confirmation":
              // Send confirmation logic
              break;
            case "view-customer-history":
              // View customer history logic
              break;
            default:
              console.log("Unknown action:", actionId);
          }
        }}
        userRole="user"
        permissions={["basic"]}
      />
    </div>
  );
}
