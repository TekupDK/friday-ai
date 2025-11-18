import {
  Mail,
  Calendar,
  FileText,
  User,
  Clock,
  DollarSign,
  CheckCircle,
  Inbox,
  Send,
  Archive,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/**
 * DESIGN 10: Unified Workspace
 * - Email + Calendar + Invoices i ét view
 * - Kontekstuel integration (email → calendar → invoice)
 * - Timeline view af al aktivitet
 * - Hurtig switch mellem kontekster
 */

const mockData = {
  emails: [
    {
      id: "1",
      from: "Matilde S.",
      subject: "Tilbud rengøring",
      time: "22:08",
      unread: true,
    },
    {
      id: "2",
      from: "Lars N.",
      subject: "Booking bekræftet",
      time: "17:20",
      unread: false,
    },
  ],
  calendar: [
    {
      id: "c1",
      title: "Rengøring - Matilde",
      date: "I dag 14:00",
      customer: "Matilde S.",
    },
    {
      id: "c2",
      title: "Besigtigelse - Lars",
      date: "I morgen 10:00",
      customer: "Lars N.",
    },
  ],
  invoices: [
    {
      id: "i1",
      customer: "Maria H.",
      amount: 8500,
      status: "unpaid",
      due: "Om 5 dage",
    },
    {
      id: "i2",
      customer: "Lars N.",
      amount: 12000,
      status: "paid",
      due: "Betalt",
    },
  ],
  timeline: [
    {
      time: "22:08",
      type: "email",
      icon: Mail,
      text: "Email fra Matilde S.",
      color: "text-blue-600",
    },
    {
      time: "17:20",
      type: "calendar",
      icon: Calendar,
      text: "Booking bekræftet - Lars N.",
      color: "text-green-600",
    },
    {
      time: "15:30",
      type: "invoice",
      icon: FileText,
      text: "Faktura sendt til Maria H.",
      color: "text-purple-600",
    },
    {
      time: "10:00",
      type: "email",
      icon: Send,
      text: "Tilbud sendt til Hanne A.",
      color: "text-blue-600",
    },
  ],
};

export function EmailCenterUnified() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex h-[700px]">
          {/* Left Sidebar - Context Switcher */}
          <div className="w-[240px] border-r bg-muted/20 flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-bold text-lg">Workspace</h3>
              <p className="text-xs text-muted-foreground">Alt på ét sted</p>
            </div>

            <div className="p-3 space-y-1 flex-1">
              <Button
                variant={activeTab === "all" ? "default" : "ghost"}
                className="w-full justify-start gap-2"
                onClick={() => setActiveTab("all")}
              >
                <Inbox className="h-4 w-4" />
                Alt ({mockData.timeline.length})
              </Button>
              <Button
                variant={activeTab === "emails" ? "default" : "ghost"}
                className="w-full justify-start gap-2"
                onClick={() => setActiveTab("emails")}
              >
                <Mail className="h-4 w-4" />
                Emails ({mockData.emails.length})
              </Button>
              <Button
                variant={activeTab === "calendar" ? "default" : "ghost"}
                className="w-full justify-start gap-2"
                onClick={() => setActiveTab("calendar")}
              >
                <Calendar className="h-4 w-4" />
                Kalender ({mockData.calendar.length})
              </Button>
              <Button
                variant={activeTab === "invoices" ? "default" : "ghost"}
                className="w-full justify-start gap-2"
                onClick={() => setActiveTab("invoices")}
              >
                <FileText className="h-4 w-4" />
                Fakturaer ({mockData.invoices.length})
              </Button>
            </div>

            <div className="p-3 border-t">
              <div className="text-xs text-muted-foreground mb-2">
                Quick Stats
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Unread</span>
                  <Badge variant="secondary">1</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Today</span>
                  <Badge variant="secondary">2</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Overdue</span>
                  <Badge variant="destructive">0</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            <div className="border-b p-4">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All Activity</TabsTrigger>
                  <TabsTrigger value="emails">Emails</TabsTrigger>
                  <TabsTrigger value="calendar">Calendar</TabsTrigger>
                  <TabsTrigger value="invoices">Invoices</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <ScrollArea className="flex-1 p-4">
              {/* All Activity Timeline */}
              {activeTab === "all" && (
                <div className="space-y-4">
                  <h3 className="font-semibold mb-4">Activity Timeline</h3>
                  {mockData.timeline.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={idx}
                        className="flex gap-3 p-3 rounded-lg border hover:bg-accent/30 transition-colors cursor-pointer"
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center bg-muted",
                            item.color
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.text}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {item.time}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Emails View */}
              {activeTab === "emails" && (
                <div className="space-y-2">
                  <h3 className="font-semibold mb-4">Emails</h3>
                  {mockData.emails.map(email => (
                    <div
                      key={email.id}
                      className={cn(
                        "p-4 rounded-lg border hover:bg-accent/30 transition-colors cursor-pointer",
                        email.unread && "bg-accent/20 border-primary/50"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-semibold text-sm">
                          {email.from}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {email.time}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {email.subject}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline">
                          <Send className="h-3 w-3 mr-1" />
                          Reply
                        </Button>
                        <Button size="sm" variant="outline">
                          <Archive className="h-3 w-3 mr-1" />
                          Archive
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Calendar View */}
              {activeTab === "calendar" && (
                <div className="space-y-2">
                  <h3 className="font-semibold mb-4">Kommende Events</h3>
                  {mockData.calendar.map(event => (
                    <div
                      key={event.id}
                      className="p-4 rounded-lg border hover:bg-accent/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm mb-1">
                            {event.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {event.date}
                          </div>
                          <div className="flex items-center gap-1 mt-2">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">{event.customer}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Invoices View */}
              {activeTab === "invoices" && (
                <div className="space-y-2">
                  <h3 className="font-semibold mb-4">Fakturaer</h3>
                  {mockData.invoices.map(invoice => (
                    <div
                      key={invoice.id}
                      className="p-4 rounded-lg border hover:bg-accent/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-sm">
                          {invoice.customer}
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          {invoice.amount.toLocaleString("da-DK")} kr
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={
                            invoice.status === "paid" ? "default" : "secondary"
                          }
                        >
                          {invoice.status === "paid" ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {invoice.status === "paid" ? "Betalt" : "Ubetalt"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {invoice.due}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Right Sidebar - Quick Info */}
          <div className="w-[280px] border-l bg-muted/20 p-4 space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-3">I Dag</h4>
              <div className="space-y-2">
                <div className="p-3 rounded-lg border bg-background">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">1 ny email</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Matilde S. - Tilbud
                  </div>
                </div>
                <div className="p-3 rounded-lg border bg-background">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">1 møde</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Kl. 14:00 - Matilde S.
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-3">Denne Uge</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg border bg-background text-center">
                  <div className="text-xl font-bold">2</div>
                  <div className="text-xs text-muted-foreground">Bookings</div>
                </div>
                <div className="p-2 rounded-lg border bg-background text-center">
                  <div className="text-xl font-bold text-green-600">20.5k</div>
                  <div className="text-xs text-muted-foreground">Revenue</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-3">Kræver Handling</h4>
              <div className="space-y-2">
                <div className="p-2 rounded-lg bg-yellow-50 border border-yellow-200 text-xs">
                  <div className="font-medium mb-1">1 lead venter svar</div>
                  <div className="text-muted-foreground">Send follow-up</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
