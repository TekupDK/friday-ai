import { Calendar, FileText, Loader2, Mail, MoreVertical } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";

interface ActivityTimelineProps {
  customerId: number;
  onEmailClick?: (gmailThreadId: string) => void;
  onInvoiceClick?: (invoiceId: number) => void;
}

type ActivityType = "email" | "invoice" | "calendar";

export function ActivityTimeline({
  customerId,
  onEmailClick,
  onInvoiceClick,
}: ActivityTimelineProps) {
  const [filter, setFilter] = useState<ActivityType | "all">("all");

  const { data: activities, isLoading } =
    trpc.customer.getActivityTimeline.useQuery({
      customerId,
      limit: 50,
    });

  const filteredActivities = useMemo(() => {
    if (!activities) return [];
    if (filter === "all") return activities;
    return activities.filter(a => a.type === filter);
  }, [activities, filter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Ingen aktivitet endnu</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          Alle ({activities.length})
        </Button>
        <Button
          variant={filter === "email" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("email")}
          className="gap-1.5"
        >
          <Mail className="w-3.5 h-3.5" />
          Emails ({activities.filter(a => a.type === "email").length})
        </Button>
        <Button
          variant={filter === "invoice" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("invoice")}
          className="gap-1.5"
        >
          <FileText className="w-3.5 h-3.5" />
          Fakturaer ({activities.filter(a => a.type === "invoice").length})
        </Button>
        <Button
          variant={filter === "calendar" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("calendar")}
          className="gap-1.5"
        >
          <Calendar className="w-3.5 h-3.5" />
          Kalender ({activities.filter(a => a.type === "calendar").length})
        </Button>
      </div>

      {/* Timeline */}
      <ScrollArea className="h-[500px]">
        <div className="space-y-3">
          {filteredActivities.map((activity, idx) => {
            const isEmail = activity.type === "email";
            const isInvoice = activity.type === "invoice";
            const isCalendar = activity.type === "calendar";

            const date = new Date(activity.date);
            const dateStr = date.toLocaleDateString("da-DK", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            const timeStr = date.toLocaleTimeString("da-DK", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <Card
                key={activity.id}
                className={`hover:bg-accent/50 transition-colors ${
                  isEmail && onEmailClick ? "cursor-pointer" : ""
                }`}
                onClick={() => {
                  if (
                    isEmail &&
                    onEmailClick &&
                    activity.metadata.gmailThreadId
                  ) {
                    onEmailClick(activity.metadata.gmailThreadId);
                  } else if (isInvoice && onInvoiceClick) {
                    const invoiceId = parseInt(
                      activity.id.replace("invoice-", ""),
                      10
                    );
                    onInvoiceClick(invoiceId);
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        isEmail
                          ? "bg-blue-500/10 text-blue-500"
                          : isInvoice
                            ? "bg-green-500/10 text-green-500"
                            : "bg-purple-500/10 text-purple-500"
                      }`}
                    >
                      {isEmail ? (
                        <Mail className="w-5 h-5" />
                      ) : isInvoice ? (
                        <FileText className="w-5 h-5" />
                      ) : (
                        <Calendar className="w-5 h-5" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">
                            {activity.title}
                          </h4>
                          {activity.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                              {activity.description}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 shrink-0"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Metadata & Date */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {isEmail
                            ? "Email"
                            : isInvoice
                              ? "Faktura"
                              : "Kalender"}
                        </Badge>

                        {isEmail && !activity.metadata.isRead && (
                          <Badge variant="destructive" className="text-xs">
                            Ulæst
                          </Badge>
                        )}

                        {isInvoice && activity.metadata.status === "paid" && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-green-500/10 text-green-700"
                          >
                            Betalt
                          </Badge>
                        )}

                        {isInvoice &&
                          activity.metadata.status === "overdue" && (
                            <Badge variant="destructive" className="text-xs">
                              Forfald
                            </Badge>
                          )}

                        <span className="text-xs text-muted-foreground ml-auto">
                          {dateStr} • {timeStr}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
