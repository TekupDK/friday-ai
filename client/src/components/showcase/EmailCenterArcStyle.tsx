import {
  Inbox,
  Star,
  Archive,
  Send,
  FileText,
  Users,
  Calendar,
  ChevronRight,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/**
 * DESIGN 4: Arc Browser-Inspired Sidebar
 * - Vertikal sidebar navigation
 * - Spacious, modern layout
 * - Color-coded sections
 * - Quick access favorites
 * - Smooth hover states
 */

interface Email {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  time: string;
  category: string;
  unread: boolean;
  important: boolean;
}

const emails: Email[] = [
  {
    id: "1",
    sender: "Matilde Skinneholm",
    subject: "Tilbud på rengøring",
    preview: "Hej – vi vil gerne have et tilbud på rengøring...",
    time: "22:08",
    category: "inbox",
    unread: true,
    important: true,
  },
  {
    id: "2",
    sender: "Hanne Andersen",
    subject: "Follow-up",
    preview: "Jeg følger op på vores tidligere mail...",
    time: "17:39",
    category: "inbox",
    unread: true,
    important: true,
  },
  {
    id: "3",
    sender: "Rendetalje.dk",
    subject: "Booking",
    preview: "Vi kan tirsdag eller torsdag denne uge...",
    time: "20:53",
    category: "inbox",
    unread: false,
    important: true,
  },
  {
    id: "4",
    sender: "Lars Nielsen",
    subject: "Møde i morgen",
    preview: "Bekræftelse på mødet i morgen kl. 10...",
    time: "Igår",
    category: "archive",
    unread: false,
    important: false,
  },
];

const sidebarItems = [
  {
    id: "inbox",
    label: "Inbox",
    icon: Inbox,
    count: 3,
    color: "text-blue-500",
  },
  {
    id: "important",
    label: "Important",
    icon: Star,
    count: 3,
    color: "text-yellow-500",
  },
  { id: "sent", label: "Sent", icon: Send, count: 0, color: "text-green-500" },
  {
    id: "archive",
    label: "Archive",
    icon: Archive,
    count: 1,
    color: "text-gray-500",
  },
];

const smartCategories = [
  {
    id: "ai-priority",
    label: "AI Priority",
    icon: Sparkles,
    color: "text-purple-500",
  },
  { id: "leads", label: "Hot Leads", icon: Zap, color: "text-red-500" },
  {
    id: "invoices",
    label: "Invoices",
    icon: FileText,
    color: "text-orange-500",
  },
  {
    id: "meetings",
    label: "Meetings",
    icon: Calendar,
    color: "text-indigo-500",
  },
];

export function EmailCenterArcStyle() {
  const [activeSection, setActiveSection] = useState("inbox");
  const [hoveredEmail, setHoveredEmail] = useState<string | null>(null);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex h-[700px]">
          {/* Arc-Style Sidebar */}
          <div className="w-[240px] border-r bg-muted/30 p-4">
            <div className="space-y-6">
              {/* Logo/Title */}
              <div className="px-2">
                <h2 className="text-lg font-bold">Friday AI</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Email Center
                </p>
              </div>

              {/* Main Navigation */}
              <div className="space-y-1">
                <div className="px-2 mb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Mailboxes
                  </span>
                </div>
                {sidebarItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all",
                        activeSection === item.id
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "hover:bg-accent/50 text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={cn(
                            "h-4 w-4",
                            activeSection !== item.id && item.color
                          )}
                        />
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                      </div>
                      {item.count > 0 && (
                        <Badge
                          variant={
                            activeSection === item.id ? "secondary" : "outline"
                          }
                          className="h-5 min-w-[20px] text-xs"
                        >
                          {item.count}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>

              <Separator />

              {/* Smart Categories */}
              <div className="space-y-1">
                <div className="px-2 mb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Smart
                  </span>
                </div>
                {smartCategories.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <Icon className={cn("h-4 w-4", cat.color)} />
                      <span className="text-sm">{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              <Separator />

              {/* Quick Actions */}
              <div className="space-y-2 px-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                >
                  <Users className="h-3.5 w-3.5" />
                  Contacts
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Calendar
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Inbox</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {emails.filter(e => e.unread).length} unread •{" "}
                    {emails.length} total
                  </p>
                </div>
                <Button className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  AI Sort
                </Button>
              </div>
            </div>

            {/* Email List */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {emails.map((email, idx) => (
                  <div
                    key={email.id}
                    onMouseEnter={() => setHoveredEmail(email.id)}
                    onMouseLeave={() => setHoveredEmail(null)}
                    className={cn(
                      "group p-5 rounded-xl border transition-all duration-200 cursor-pointer",
                      email.unread
                        ? "bg-accent/20 border-border"
                        : "bg-card border-transparent",
                      "hover:shadow-lg hover:scale-[1.01] hover:border-border"
                    )}
                    style={{
                      animation: `popIn 0.3s ease-out ${idx * 0.05}s both`,
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar Circle */}
                      <div
                        className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm shrink-0",
                          email.important
                            ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {email.sender.substring(0, 2).toUpperCase()}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "font-semibold text-sm",
                                  email.unread && "font-bold"
                                )}
                              >
                                {email.sender}
                              </span>
                              {email.important && (
                                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                              )}
                            </div>
                            <h4
                              className={cn(
                                "font-medium mt-1",
                                email.unread
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              )}
                            >
                              {email.subject}
                            </h4>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {email.time}
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {email.preview}
                        </p>

                        {/* Hover Actions */}
                        {hoveredEmail === email.id && (
                          <div className="flex gap-2 mt-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <Button size="sm" variant="secondary">
                              Reply
                            </Button>
                            <Button size="sm" variant="ghost">
                              Archive
                            </Button>
                            <Button size="sm" variant="ghost">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <style>{`
          @keyframes popIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </CardContent>
    </Card>
  );
}
