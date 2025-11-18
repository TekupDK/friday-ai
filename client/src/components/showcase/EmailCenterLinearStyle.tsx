import {
  Archive,
  Clock,
  CheckCircle2,
  Circle,
  Sparkles,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

/**
 * DESIGN 2: Linear-Inspired Minimal
 * - Ultra-clean, spacious layout
 * - Hover actions appear on hover
 * - Priority indicators (no badges unless hover)
 * - Single column focus view
 * - Smooth transitions
 */

interface EmailItem {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  time: string;
  priority: "urgent" | "high" | "normal";
  status: "todo" | "in-progress" | "done";
  aiScore: number;
}

const emails: EmailItem[] = [
  {
    id: "1",
    sender: "Matilde Skinneholm",
    subject: "Tilbud på rengøring for kontor",
    preview:
      "Hej – vi vil gerne have et tilbud på rengøring for vores kontor i København...",
    time: "22:08",
    priority: "urgent",
    status: "todo",
    aiScore: 95,
  },
  {
    id: "2",
    sender: "Hanne Andersen",
    subject: "Follow-up på tidligere mail",
    preview:
      "Hej, jeg følger op på vores tidligere mail vedrørende tilbuddet...",
    time: "17:39",
    priority: "high",
    status: "in-progress",
    aiScore: 88,
  },
  {
    id: "3",
    sender: "Rendetalje.dk",
    subject: "Booking af besigtigelse denne uge",
    preview:
      "Vi kan tirsdag eller torsdag denne uge. Hvad passer jer bedst?...",
    time: "20:53",
    priority: "high",
    status: "todo",
    aiScore: 92,
  },
  {
    id: "4",
    sender: "Lars Nielsen",
    subject: "Møde i morgen kl. 10:00",
    preview: "Bekræftelse på mødet i morgen kl. 10 i vores kontor...",
    time: "Igår",
    priority: "normal",
    status: "done",
    aiScore: 75,
  },
];

export function EmailCenterLinearStyle() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const getPriorityColor = (priority: string) => {
    if (priority === "urgent") return "border-l-red-500";
    if (priority === "high") return "border-l-orange-500";
    return "border-l-transparent";
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === "done")
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (status === "in-progress")
      return <Circle className="h-4 w-4 text-blue-500 fill-blue-500/20" />;
    return <Circle className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <Card>
      <CardContent className="p-0">
        {/* Minimal Header */}
        <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Inbox
              </h3>
              <p className="text-2xl font-bold mt-1">{emails.length} emails</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-2">
              <Sparkles className="h-4 w-4" />
              AI Sort
            </Button>
          </div>
        </div>

        {/* Clean Email List */}
        <ScrollArea className="h-[700px]">
          <div className="p-3">
            {emails.map((email, idx) => (
              <div
                key={email.id}
                onMouseEnter={() => setHoveredId(email.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() =>
                  setSelectedId(email.id === selectedId ? null : email.id)
                }
                className={cn(
                  "group relative mb-2 p-5 rounded-lg border-l-4 transition-all duration-200 cursor-pointer",
                  getPriorityColor(email.priority),
                  selectedId === email.id
                    ? "bg-accent/50 shadow-lg scale-[1.01]"
                    : "bg-card hover:bg-accent/30 hover:shadow-md",
                  "border border-border/50"
                )}
                style={{
                  animation: `fadeIn 0.3s ease-out ${idx * 0.08}s both`,
                }}
              >
                {/* Top Row */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <StatusIcon status={email.status} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {email.sender}
                        </span>
                        {hoveredId === email.id && email.aiScore >= 90 && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-green-100 text-green-700 border-green-300"
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI: {email.aiScore}
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-medium mt-0.5 text-foreground/90">
                        {email.subject}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {email.time}
                    </span>

                    {/* Hover Actions */}
                    <div
                      className={cn(
                        "flex items-center gap-1 transition-all duration-200",
                        hoveredId === email.id
                          ? "opacity-100 translate-x-0"
                          : "opacity-0 translate-x-2"
                      )}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={e => e.stopPropagation()}
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={e => e.stopPropagation()}
                      >
                        <Clock className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={e => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <ChevronRight
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        selectedId === email.id && "rotate-90"
                      )}
                    />
                  </div>
                </div>

                {/* Preview */}
                <p className="text-sm text-muted-foreground line-clamp-2 ml-7">
                  {email.preview}
                </p>

                {/* Expanded Content */}
                {selectedId === email.id && (
                  <div className="mt-4 pt-4 border-t ml-7 space-y-3 animate-in slide-in-from-top-2 duration-200">
                    <div className="text-sm">
                      <p className="mb-2">Hej,</p>
                      <p>{email.preview}</p>
                      <p className="mt-4">
                        Venlig hilsen,
                        <br />
                        {email.sender}
                      </p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="gap-2">
                        Reply
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2">
                        Forward
                      </Button>
                      <Button size="sm" variant="ghost" className="gap-2">
                        <Archive className="h-3.5 w-3.5" />
                        Archive
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </CardContent>
    </Card>
  );
}
