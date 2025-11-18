/**
 * CALENDAR CARD - Kalender begivenhed kort
 */

import { Calendar, Clock, MapPin, Users, Video } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";


export interface CalendarCardProps {
  event?: {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    duration: string;
    location: string;
    type: "meeting" | "call" | "event" | "reminder";
    attendees: number;
    isOnline: boolean;
  };
  onJoin?: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
}

export function CalendarCard({
  event = {
    id: "1",
    title: "Team Møde - Q1 Review",
    description: "Gennemgang af Q1 resultater og planlægning af Q2",
    date: "I dag",
    time: "14:00",
    duration: "1 time",
    location: "Mødelokale A",
    type: "meeting",
    attendees: 5,
    isOnline: false,
  },
  onJoin,
  onEdit,
  onCancel,
}: CalendarCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTypeColor = () => {
    switch (event.type) {
      case "call":
        return "bg-emerald-600";
      case "event":
        return "bg-purple-600";
      case "reminder":
        return "bg-amber-500";
      default:
        return "bg-blue-600";
    }
  };

  return (
    <Card className="border-l-4 border-l-orange-500">
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                getTypeColor()
              )}
            >
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">{event.title}</h4>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span>{event.date}</span>
                <span>•</span>
                <span>{event.time}</span>
                <span>•</span>
                <span>{event.duration}</span>
              </div>
            </div>
          </div>
          {event.isOnline && (
            <Badge className="bg-green-500">
              <Video className="w-3 h-3 mr-1" />
              Online
            </Badge>
          )}
        </div>

        <p className="text-sm text-muted-foreground">{event.description}</p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{event.attendees} deltagere</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t">
          {event.isOnline ? (
            <Button size="sm" onClick={onJoin}>
              <Video className="w-3 h-3 mr-1" />
              Join møde
            </Button>
          ) : (
            <Button size="sm" onClick={onJoin}>
              <Calendar className="w-3 h-3 mr-1" />
              Se detaljer
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={onEdit}>
            Rediger
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            Afmeld
          </Button>
        </div>
      </div>
    </Card>
  );
}
