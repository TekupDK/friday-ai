import {
  Calendar,
  DollarSign,
  Mail,
  Star,
  TrendingUp,
  AlertTriangle,
  Phone,
  MapPin,
} from "lucide-react";
import { useState, useEffect } from "react";

import SmartActionBar, { type CustomerData } from "./SmartActionBar";
import { WorkspaceSkeleton } from "./WorkspaceSkeleton";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  parseCalendarEvent,
  formatTimeRange,
  calculateTotalRevenue,
} from "@/lib/business-logic";
import { trpc } from "@/lib/trpc";


interface CustomerProfileProps {
  context: {
    emailId?: string;
    threadId?: string;
    subject?: string;
    from?: string;
    body?: string;
    labels?: string[];
  };
}

export function CustomerProfile({ context }: CustomerProfileProps) {
  // Extract customer data from email context
  const subject = context.subject || "";
  const from = context.from || "";
  const body = context.body || "";

  // Extract customer name from email
  const customerName = from.replace(/<.*>/, "").trim() || "Kunde";

  // Extract email address
  const emailMatch = from.match(/<(.+)>/);
  const customerEmail = emailMatch ? emailMatch[1] : from;

  // Parse address from body if present
  const addressMatch = body.match(
    /([A-ZÆØÅ][a-zæøå]+(?:\s+[A-ZÆØÅ]?[a-zæøå]+)*\s+\d+[a-z]?,?\s*\d{4}\s*[A-ZÆØÅ]?)/
  );
  const address = addressMatch ? addressMatch[0] : "Adresse ikke angivet";

  // State for customer data
  const [customer, setCustomer] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch customer history from multiple sources
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
      timeMin: new Date(
        new Date().setMonth(new Date().getMonth() - 12)
      ).toISOString(),
      timeMax: new Date().toISOString(),
      maxResults: 100,
    },
    { retry: 1 }
  );

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    try {
      // Find customer-related data from invoices
      const customerInvoices =
        invoices?.filter(
          inv =>
            inv.contactId
              ?.toLowerCase()
              .includes(customerEmail.toLowerCase()) ||
            inv.organizationId
              ?.toLowerCase()
              .includes(customerName.toLowerCase())
        ) || [];

      // Find customer-related calendar events
      const customerEvents =
        calendarEvents?.filter(
          event =>
            event.summary?.toLowerCase().includes(customerName.toLowerCase()) ||
            event.description
              ?.toLowerCase()
              .includes(customerName.toLowerCase()) ||
            event.description
              ?.toLowerCase()
              .includes(customerEmail.toLowerCase())
        ) || [];

      // Parse customer events using centralized business logic
      const parsedBookings = customerEvents.map(event => {
        const booking = parseCalendarEvent(event);
        return {
          id: `event-${event.id}`,
          type: "booking" as const,
          date: event.start,
          description: `${booking.type} - ${booking.customer}`,
          price: booking.price,
          paid: false,
          calendarUrl: `https://calendar.google.com/calendar/event?eid=${event.id}`,
          duration: booking.duration,
          workHours: booking.workHours,
        };
      });

      // Parse customer invoices
      const parsedInvoices = customerInvoices.map(invoice => ({
        id: `invoice-${invoice.id}`,
        type: "invoice" as const,
        date: invoice.createdTime || invoice.entryDate,
        description: `Faktura ${invoice.invoiceNo}`,
        price: invoice.grossAmount || invoice.amount || 0,
        paid: invoice.isPaid || false,
        downloadUrl: invoice.downloadUrl,
      }));

      // Calculate customer statistics using real business data
      const totalBookings = parsedBookings.length;
      const totalValue =
        calculateTotalRevenue(customerEvents) +
        parsedInvoices.reduce((sum, inv) => sum + inv.price, 0);
      const avgBooking =
        totalBookings > 0
          ? totalValue / (totalBookings + parsedInvoices.length)
          : 0;

      // Determine customer status based on real data
      let status = "Ny kunde";
      if (totalBookings >= 10) {
        status = "VIP";
      } else if (totalBookings >= 3) {
        status = "Fast kunde";
      } else if (totalBookings >= 1) {
        status = "Eksisterende kunde";
      }

      // Find first interaction date
      const allDates = [
        ...customerEvents.map(e => new Date(e.start)),
        ...parsedInvoices.map(i => new Date(i.date || "")),
      ].filter(date => !isNaN(date.getTime()));

      const customerSince =
        allDates.length > 0
          ? new Date(
              Math.min(...allDates.map(d => d.getTime()))
            ).toLocaleDateString("da-DK")
          : "Ikke angivet";

      // Build recent history (last 5 items) - properly sorted
      const allHistory = [...parsedBookings, ...parsedInvoices]
        .sort(
          (a, b) =>
            new Date(b.date || "").getTime() - new Date(a.date || "").getTime()
        )
        .slice(0, 5);

      setCustomer({
        name: customerName,
        email: customerEmail,
        phone: "Ikke angivet", // Would need customer lookup
        address: address,
        since: customerSince,
        totalBookings: totalBookings,
        totalValue: Math.round(totalValue),
        avgBooking: Math.round(avgBooking),
        rating: totalBookings > 5 ? 5 : totalBookings > 0 ? 4 : 5,
        status: status,
        unpaidInvoices: customerInvoices.filter(inv => !inv.isPaid).length,
      });

      setRecentBookings(allHistory);
      setIsLoading(false);
    } catch (err) {
      setError("Kunne ikke hente kunde data");
      setIsLoading(false);
    }
  }, [invoices, calendarEvents, customerName, customerEmail, address]); // All deps needed for customer stats

  // Loading state
  if (isLoading) {
    return <WorkspaceSkeleton type="customer" />;
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <Card className="p-4 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-lg">👤 Customer Profile</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Fejl ved hentning af kunde data
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

  if (!customer) return null;

  // Status badge configuration
  const getStatusBadge = (status: string) => {
    if (status === "VIP")
      return {
        variant: "default" as const,
        text: status,
        color: "bg-purple-500",
      };
    if (status === "Fast kunde")
      return {
        variant: "secondary" as const,
        text: status,
        color: "bg-blue-500",
      };
    if (status === "Eksisterende kunde")
      return {
        variant: "outline" as const,
        text: status,
        color: "bg-green-500",
      };
    return {
      variant: "default" as const,
      text: status,
      color: "bg-orange-500",
    };
  };

  const statusBadge = getStatusBadge(customer.status);

  // Prepare customer data for SmartActionBar
  const customerData: CustomerData = {
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    totalBookings: customer.totalBookings,
    totalValue: customer.totalSpent,
    status:
      customer.status === "VIP"
        ? "vip"
        : customer.status === "Fast kunde"
          ? "active"
          : "inactive",
    lastBooking: customer.lastContact,
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/20">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg">👤 Customer Profile</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {customer.totalBookings} booking
              {customer.totalBookings !== 1 ? "s" : ""} • {customer.since}
            </p>
          </div>
          <Badge variant={statusBadge.variant} className={statusBadge.color}>
            ⭐ {statusBadge.text}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div>
            <div className="font-semibold">{customer.name}</div>
            <div className="text-xs text-muted-foreground">
              {customer.email}
            </div>
            <div className="text-xs text-muted-foreground">
              {customer.phone}
            </div>
          </div>
          <div className="text-muted-foreground">{customer.address}</div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h4 className="font-semibold">📊 Customer Stats</h4>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Kunde siden:</span>
            <span className="font-medium">{customer.since}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total bookings:</span>
            <span className="font-medium">{customer.totalBookings}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total værdi:</span>
            <span className="font-medium">
              {customer.totalValue.toLocaleString("da-DK")} kr
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Gennemsnit:</span>
            <span className="font-medium">
              {customer.avgBooking.toLocaleString("da-DK")} kr
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rating:</span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
              <span className="font-medium">{customer.rating}/5</span>
            </div>
          </div>
          {customer.unpaidInvoices > 0 && (
            <div className="flex justify-between">
              <span className="text-red-600">Ubetalte fakturaer:</span>
              <span className="font-medium text-red-600">
                {customer.unpaidInvoices}
              </span>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-primary" />
          <h4 className="font-semibold">📅 Recent Activity</h4>
        </div>
        <div className="space-y-2">
          {recentBookings.length > 0 ? (
            recentBookings.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 rounded-md bg-muted/30 text-sm"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{item.description}</div>
                    <Badge variant="outline" className="text-xs">
                      {item.type === "booking" ? "📅 Booking" : "💰 Faktura"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(item.date).toLocaleDateString("da-DK")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {Math.round(item.price).toLocaleString("da-DK")} kr
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    {item.paid && (
                      <Badge variant="secondary" className="text-xs">
                        ✅ Betalt
                      </Badge>
                    )}
                    {!item.paid && item.type === "invoice" && (
                      <Badge variant="destructive" className="text-xs">
                        ⏳ Ubetalt
                      </Badge>
                    )}
                    {item.type === "booking" && item.calendarUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        asChild
                      >
                        <a
                          href={item.calendarUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Åbn
                        </a>
                      </Button>
                    )}
                    {item.type === "invoice" && item.downloadUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        asChild
                      >
                        <a
                          href={item.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          PDF
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground text-sm py-4">
              Ingen tidligere aktivitet fundet
            </div>
          )}
        </div>
      </Card>

      <Card className="p-4 border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20">
        <h4 className="font-semibold text-sm mb-2">📝 Notes & Preferences</h4>
        <div className="space-y-1 text-xs">
          <div>• Nøgle under måtten</div>
          <div>• Kat (allergi-venlige produkter)</div>
          <div>• Ekstra fokus på køkken</div>
          <div>• Betaler altid via MobilePay</div>
        </div>
      </Card>

      {/* Smart Actions - Phase 5.2.4 */}
      <SmartActionBar
        context={{ ...context, type: "customer" }}
        workspaceData={customerData}
        onAction={async (actionId: string, data: any) => {
          // Handle smart actions
          console.log("Smart action executed:", actionId, data);

          switch (actionId) {
            case "sendEmail":
              // Send email to customer
              console.log("Sending email to:", customerData.name);
              break;
            case "scheduleBooking":
              // Schedule new booking
              console.log("Scheduling booking for:", customerData.name);
              break;
            case "viewInvoices":
              // View customer invoices
              console.log("Viewing invoices for:", customerData.name);
              break;
            case "callCustomer":
              // Call customer
              console.log("Calling customer:", customerData.name);
              break;
            case "sendPromotion":
              // Send promotion offer
              console.log("Sending promotion to:", customerData.name);
              break;
            default:
              console.log("Unknown action:", actionId);
          }
        }}
      />
    </div>
  );
}
