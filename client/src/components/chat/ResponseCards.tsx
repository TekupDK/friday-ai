/**
 * Response Cards - Structured data display for Friday AI responses
 * Viser lead info, tasks, meetings, invoices m.m. i pæne cards
 */

import {
  Calendar,
  UserPlus,
  CheckCircle2,
  FileText,
  Mail,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Card data types specific til Friday AI
export type ResponseCardType =
  | "lead_created"
  | "task_created"
  | "meeting_booked"
  | "invoice_created"
  | "calendar_events"
  | "email_results"
  | "weather"
  | "generic";

interface BaseCardData {
  type: ResponseCardType;
  title: string;
  icon?: React.ReactNode;
  timestamp?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface LeadCardData extends BaseCardData {
  type: "lead_created";
  lead: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    source?: string;
  };
}

interface TaskCardData extends BaseCardData {
  type: "task_created";
  task: {
    id: number;
    title: string;
    dueDate?: string;
    priority: "low" | "medium" | "high";
  };
}

interface MeetingCardData extends BaseCardData {
  type: "meeting_booked";
  meeting: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    location?: string;
  };
}

interface InvoiceCardData extends BaseCardData {
  type: "invoice_created";
  invoice: {
    id: string;
    customerName: string;
    amount: number;
    currency: string;
    status: "draft" | "sent" | "paid";
  };
}

interface CalendarEventsCardData extends BaseCardData {
  type: "calendar_events";
  events: Array<{
    id: string;
    title: string;
    startTime: string;
    endTime: string;
  }>;
  date: string;
}

export type ResponseCardData =
  | LeadCardData
  | TaskCardData
  | MeetingCardData
  | InvoiceCardData
  | CalendarEventsCardData;

// Lead Card Component
function LeadCard({ data }: { data: LeadCardData }) {
  const { lead } = data;

  return (
    <Card className="hover:shadow-lg transition-all hover:scale-[1.02] border-l-4 border-l-green-500">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-linear-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-base">Lead oprettet</h4>
              <Badge variant="secondary" className="text-xs">
                #{lead.id}
              </Badge>
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">{lead.name}</p>

              {lead.email && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{lead.email}</span>
                </div>
              )}

              {lead.phone && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{lead.phone}</span>
                </div>
              )}

              {lead.source && (
                <Badge variant="outline" className="text-xs mt-2">
                  {lead.source}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Task Card Component
function TaskCard({ data }: { data: TaskCardData }) {
  const { task } = data;

  const priorityColors = {
    low: "from-blue-400 to-blue-600",
    medium: "from-yellow-400 to-yellow-600",
    high: "from-red-400 to-red-600",
  };

  const priorityBorder = {
    low: "border-l-blue-500",
    medium: "border-l-yellow-500",
    high: "border-l-red-500",
  };

  return (
    <Card
      className={cn(
        "hover:shadow-lg transition-all hover:scale-[1.02] border-l-4",
        priorityBorder[task.priority]
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "w-12 h-12 rounded-lg bg-linear-to-br flex items-center justify-center shrink-0 shadow-md",
              priorityColors[task.priority]
            )}
          >
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-base">Opgave oprettet</h4>
              <Badge variant="secondary" className="text-xs">
                #{task.id}
              </Badge>
            </div>

            <p className="text-sm font-medium text-foreground mb-2">
              {task.title}
            </p>

            {task.dueDate && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {new Date(task.dueDate).toLocaleDateString("da-DK", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Meeting Card Component
function MeetingCard({ data }: { data: MeetingCardData }) {
  const { meeting } = data;

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("da-DK", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="hover:shadow-lg transition-all hover:scale-[1.02] border-l-4 border-l-purple-500">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-linear-to-br from-purple-400 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-base">Møde booket</h4>
            </div>

            <p className="text-sm font-medium text-foreground mb-2">
              {meeting.title}
            </p>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {formatTime(meeting.startTime)} -{" "}
                  {formatTime(meeting.endTime)}
                </span>
              </div>

              {meeting.location && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{meeting.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Invoice Card Component
function InvoiceCard({ data }: { data: InvoiceCardData }) {
  const { invoice } = data;

  const statusColors = {
    draft: "bg-gray-500",
    sent: "bg-blue-500",
    paid: "bg-green-500",
  };

  const statusLabels = {
    draft: "Kladde",
    sent: "Sendt",
    paid: "Betalt",
  };

  return (
    <Card className="hover:shadow-lg transition-all hover:scale-[1.02] border-l-4 border-l-yellow-500">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-linear-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shrink-0 shadow-md">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-base">Faktura oprettet</h4>
              <Badge variant="secondary" className="text-xs">
                {invoice.id}
              </Badge>
            </div>

            <p className="text-sm font-medium text-foreground mb-2">
              {invoice.customerName}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-lg font-bold text-foreground">
                  {invoice.amount.toLocaleString("da-DK")} {invoice.currency}
                </span>
              </div>
              <Badge className={cn("text-xs", statusColors[invoice.status])}>
                {statusLabels[invoice.status]}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Calendar Events Card Component
function CalendarEventsCard({ data }: { data: CalendarEventsCardData }) {
  const { events, date } = data;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("da-DK", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("da-DK", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <div>
            <p className="font-medium">{formatDate(date)}</p>
            <p className="text-xs text-muted-foreground">
              {events.length}{" "}
              {events.length === 1 ? "begivenhed" : "begivenheder"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ingen begivenheder i dag
            </p>
          ) : (
            events.map(event => (
              <div
                key={event.id}
                className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="flex flex-col items-center min-w-[60px]">
                  <span className="text-xs font-medium">
                    {formatTime(event.startTime)}
                  </span>
                  <span className="text-xs text-muted-foreground">-</span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(event.endTime)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{event.title}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Main Response Card Router
export function ResponseCard({ data }: { data: ResponseCardData }) {
  switch (data.type) {
    case "lead_created":
      return <LeadCard data={data} />;
    case "task_created":
      return <TaskCard data={data} />;
    case "meeting_booked":
      return <MeetingCard data={data} />;
    case "invoice_created":
      return <InvoiceCard data={data} />;
    case "calendar_events":
      return <CalendarEventsCard data={data} />;
    default:
      return null;
  }
}
