import { Mail, Phone, Calendar, FileText, Check, Clock } from "lucide-react";
import { useState, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";


interface TimelineEvent {
  id: number;
  type: "email" | "call" | "meeting" | "note";
  title: string;
  description: string;
  timestamp: string;
  status: "completed" | "pending" | "upcoming";
}

const events: TimelineEvent[] = [
  {
    id: 1,
    type: "email",
    title: "Email sendt til kunde",
    description: "Tilbud på vinduespudsning sendt",
    timestamp: "10:30",
    status: "completed",
  },
  {
    id: 2,
    type: "call",
    title: "Opkald til kunde",
    description: "Bekræftet mødetidspunkt",
    timestamp: "14:15",
    status: "completed",
  },
  {
    id: 3,
    type: "meeting",
    title: "Møde planlagt",
    description: "Besigtigelse af kontor",
    timestamp: "I morgen 10:00",
    status: "upcoming",
  },
  {
    id: 4,
    type: "note",
    title: "Note tilføjet",
    description: "Kunde ønsker månedlig service",
    timestamp: "16:45",
    status: "pending",
  },
];

const iconMap = {
  email: Mail,
  call: Phone,
  meeting: Calendar,
  note: FileText,
};

const colorMap = {
  email: "text-blue-500",
  call: "text-green-500",
  meeting: "text-purple-500",
  note: "text-orange-500",
};

export function AnimatedTimeline() {
  const [visibleEvents, setVisibleEvents] = useState<number[]>([]);

  useEffect(() => {
    // Staggered reveal animation
    events.forEach((event, idx) => {
      setTimeout(() => {
        setVisibleEvents(prev => [...prev, event.id]);
      }, idx * 200);
    });
  }, []);

  return (
    <div className="relative max-w-2xl">
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent" />

      <div className="space-y-6">
        {events.map((event, idx) => {
          const Icon = iconMap[event.type];
          const isVisible = visibleEvents.includes(event.id);
          const isLast = idx === events.length - 1;

          return (
            <div
              key={event.id}
              className={cn(
                "relative pl-16 transition-all duration-500 ease-out",
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-4"
              )}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              {/* Icon circle */}
              <div className="absolute left-0 flex items-center">
                <div
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500",
                    "bg-background border-2",
                    event.status === "completed" &&
                      "border-green-500 bg-green-500/10",
                    event.status === "pending" &&
                      "border-orange-500 bg-orange-500/10",
                    event.status === "upcoming" &&
                      "border-blue-500 bg-blue-500/10",
                    isVisible && "scale-100",
                    !isVisible && "scale-0"
                  )}
                >
                  <Icon className={cn("w-6 h-6", colorMap[event.type])} />
                </div>

                {/* Status indicator */}
                {event.status === "completed" && (
                  <Check
                    className={cn(
                      "absolute -top-1 -right-1 w-5 h-5 text-green-500 bg-background rounded-full transition-all duration-300",
                      isVisible ? "scale-100 rotate-0" : "scale-0 rotate-180"
                    )}
                    style={{ transitionDelay: `${idx * 100 + 300}ms` }}
                  />
                )}
              </div>

              {/* Content card */}
              <Card
                className={cn(
                  "transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
                  isLast && "mb-0"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    </div>

                    <Badge
                      variant={
                        event.status === "completed"
                          ? "default"
                          : event.status === "pending"
                            ? "secondary"
                            : "outline"
                      }
                      className={cn(
                        "whitespace-nowrap transition-all duration-300",
                        isVisible
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-75"
                      )}
                      style={{ transitionDelay: `${idx * 100 + 200}ms` }}
                    >
                      {event.status === "completed" && "✓ Færdig"}
                      {event.status === "pending" && "⏳ Afventer"}
                      {event.status === "upcoming" && "📅 Planlagt"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {event.timestamp}
                  </div>
                </CardContent>
              </Card>

              {/* Connecting dot */}
              {!isLast && (
                <div
                  className={cn(
                    "absolute left-[31px] -bottom-3 w-1 h-1 rounded-full bg-primary transition-all duration-300",
                    isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"
                  )}
                  style={{ transitionDelay: `${idx * 100 + 400}ms` }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
