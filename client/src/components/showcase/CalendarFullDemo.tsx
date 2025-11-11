import { useMemo, useState } from "react";
import { addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay, isSameMonth, format, parseISO } from "date-fns";
import { da } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Users, Briefcase } from "lucide-react";

interface CalendarEvent {
  id: string;
  date: string; // ISO
  title: string;
  time?: string;
  type: "meeting" | "task" | "lead" | "invoice";
  location?: string;
  attendees?: number;
}

const demoEvents: CalendarEvent[] = [
  { id: "1", date: new Date().toISOString(), title: "Kundemøde: Rengøring", time: "10:00", type: "meeting", location: "København", attendees: 2 },
  { id: "2", date: new Date().toISOString(), title: "Send tilbud", time: "15:00", type: "task" },
  { id: "3", date: addDays(new Date(), 1).toISOString(), title: "Nyt lead: Webdesign", time: "09:00", type: "lead" },
  { id: "4", date: addDays(new Date(), 3).toISOString(), title: "Forfaldsdato: Faktura #4567", type: "invoice" },
  { id: "5", date: addDays(new Date(), 6).toISOString(), title: "Demo: AI Email Assistant", time: "13:30", type: "meeting", attendees: 3 },
];

const typeStyles: Record<CalendarEvent["type"], { dot: string; badge: string; icon: React.ReactNode }> = {
  meeting: { dot: "bg-blue-500", badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400", icon: <Users className="w-3 h-3" /> },
  task: { dot: "bg-orange-500", badge: "bg-orange-500/10 text-orange-600 dark:text-orange-400", icon: <Clock className="w-3 h-3" /> },
  lead: { dot: "bg-emerald-500", badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", icon: <Briefcase className="w-3 h-3" /> },
  invoice: { dot: "bg-purple-500", badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400", icon: <CalendarIcon className="w-3 h-3" /> },
};

export function CalendarFullDemo() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const monthMatrix = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    const days: Date[] = [];
    let day = start;
    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  const eventsByDay = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const e of demoEvents) {
      const key = format(parseISO(e.date), "yyyy-MM-dd");
      if (!map[key]) map[key] = [];
      map[key].push(e);
    }
    return map;
  }, []);

  const weekdayNames = ["Man","Tir","Ons","Tor","Fre","Lør","Søn"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <h4 className="text-xl font-semibold ml-2">
            {format(currentMonth, "MMMM yyyy", { locale: da })}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400">Møder</Badge>
          <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400">Opgaver</Badge>
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Leads</Badge>
          <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400">Faktura</Badge>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 text-xs text-muted-foreground border-b">
            {weekdayNames.map((d) => (
              <div key={d} className="px-3 py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-border">
            {monthMatrix.map((day, idx) => {
              const key = format(day, "yyyy-MM-dd");
              const dayEvents = eventsByDay[key] || [];
              const isToday = isSameDay(day, new Date());
              const inMonth = isSameMonth(day, currentMonth);

              return (
                <div
                  key={idx}
                  className={cn(
                    "min-h-[110px] bg-background p-2 transition-all",
                    "hover:bg-accent/50 animate-in fade-in-0",
                    !inMonth && "opacity-60"
                  )}
                  style={{ animationDelay: `${(idx % 7) * 20}ms` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-sm",
                      isToday ? "bg-primary text-primary-foreground" : "")}>{format(day, "d")}</div>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-muted-foreground">{dayEvents.length} evt</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <Tooltip key={ev.id}>
                        <TooltipTrigger asChild>
                          <div className={cn("flex items-center gap-2 px-2 py-1 rounded-md border text-xs truncate",
                            typeStyles[ev.type].badge,
                            "hover:shadow-sm cursor-pointer transition-all")}
                          >
                            <div className={cn("w-1.5 h-1.5 rounded-full", typeStyles[ev.type].dot)} />
                            <span className="truncate flex-1">{ev.title}</span>
                            {ev.time && <span className="opacity-70">{ev.time}</span>}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs space-y-1">
                            <div className="font-medium flex items-center gap-1">{typeStyles[ev.type].icon} {ev.title}</div>
                            {ev.time && <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{ev.time}</div>}
                            {ev.location && <div className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.location}</div>}
                            {ev.attendees && <div className="flex items-center gap-1"><Users className="w-3 h-3" />{ev.attendees} deltagere</div>}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-muted-foreground">+{dayEvents.length - 3} flere</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dagens opgaver</CardTitle>
          <CardDescription>Auto-genereret af Friday AI</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {demoEvents
              .filter((e) => format(parseISO(e.date), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd"))
              .map((e) => (
                <div key={e.id} className={cn("p-3 rounded-md border text-sm flex items-center gap-2",
                  typeStyles[e.type].badge,
                  "animate-in slide-in-from-bottom-2")}
                >
                  <div className={cn("w-2 h-2 rounded-full", typeStyles[e.type].dot)} />
                  <span className="font-medium">{e.title}</span>
                  {e.time && <span className="ml-auto text-xs opacity-70 flex items-center gap-1"><Clock className="w-3 h-3" />{e.time}</span>}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
