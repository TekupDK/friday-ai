import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Brush } from "lucide-react";

type CleaningSectionProps = {
  selectedDate: Date;
  viewMode: "day" | "week";
  dayEvents: any[];
  weekEvents: any[];
  onOpen: (ev: any) => void;
};

export function CleaningSection({
  selectedDate,
  viewMode,
  dayEvents,
  weekEvents,
  onOpen,
}: CleaningSectionProps) {
  const [scope, setScope] = useState<"day" | "week">(viewMode);

  useEffect(() => {
    setScope(viewMode);
  }, [viewMode]);

  const stripDiacritics = (s: string) =>
    (s?.toString() || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  // Keywords to match in both raw (with diacritics) and normalized text
  const keywordsRaw = [
    "rengør",
    "rengøring",
    "flytterengøring",
    "rengoer",
    "clean",
    "cleaning",
  ];
  const keywordsNormalized = [
    "reng",
    "rengor",
    "rengo",
    "rengoer",
    "rengoring",
    "flytterengor",
    "clean",
    "cleaning",
  ];

  const filterCleaning = (events: any[]) =>
    (events || []).filter((event: any) => {
      const raw = [event?.summary, event?.description, event?.location]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const normalized = stripDiacritics(raw);
      return (
        keywordsNormalized.some(k => normalized.includes(k)) ||
        keywordsRaw.some(k => raw.includes(k))
      );
    });

  const items = useMemo(
    () =>
      scope === "day" ? filterCleaning(dayEvents) : filterCleaning(weekEvents),
    [scope, dayEvents, weekEvents]
  );

  const label =
    scope === "day"
      ? selectedDate.toLocaleDateString("da-DK", {
          weekday: "short",
          day: "numeric",
          month: "short",
        })
      : (() => {
          const d = new Date(selectedDate);
          const day = (d.getDay() + 6) % 7;
          const start = new Date(d);
          start.setDate(start.getDate() - day);
          const end = new Date(start);
          end.setDate(end.getDate() + 6);
          return `${start.toLocaleDateString("da-DK", { day: "numeric", month: "short" })} - ${end.toLocaleDateString("da-DK", { day: "numeric", month: "short" })}`;
        })();

  return (
    <div className="mb-4 border rounded-lg p-3 bg-muted/20">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Brush className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-semibold">Rengøring ({items.length})</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {label}
          </span>
          <div className="inline-flex items-center rounded-md border p-0.5">
            <Button
              variant={scope === "day" ? "default" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => setScope("day")}
            >
              Dag
            </Button>
            <Button
              variant={scope === "week" ? "default" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => setScope("week")}
            >
              Uge
            </Button>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-xs text-muted-foreground">
          {scope === "day"
            ? "Ingen rengøringsaftaler i dag"
            : "Ingen rengøringsaftaler denne uge"}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((ev: any) => {
            const startTime = ev.start?.dateTime || ev.start?.date || ev.start;
            const endTime = ev.end?.dateTime || ev.end?.date || ev.end;
            const isAllDay = !!ev.start?.date && !ev.start?.dateTime;
            const timeLabel = isAllDay
              ? "Hele dagen"
              : `${new Date(startTime).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" })} - ${new Date(endTime).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" })}`;
            const datePrefix =
              scope === "week"
                ? `${new Date(startTime).toLocaleDateString("da-DK", { weekday: "short" })} · `
                : "";
            const textRaw =
              `${ev?.summary ?? ""} ${ev?.description ?? ""}`.toLowerCase();
            const textNorm = textRaw
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "");
            let badge: { label: string; className: string } | null = null;
            if (/\bflytter/.test(textNorm)) {
              badge = {
                label: "Flytterengøring",
                className: "bg-rose-500/15 text-rose-400",
              };
            } else if (/\bugentlig|\bugentligt|weekly/.test(textNorm)) {
              badge = {
                label: "Ugentlig",
                className: "bg-amber-500/15 text-amber-400",
              };
            } else if (/\bfast\b/.test(textNorm)) {
              badge = {
                label: "Fast",
                className: "bg-emerald-500/15 text-emerald-400",
              };
            } else if (
              /hovedrengor|hovedrengoer|hovedrengøring/.test(textNorm)
            ) {
              badge = {
                label: "Hovedrengøring",
                className: "bg-sky-500/15 text-sky-400",
              };
            } else if (/vindue|vinduer|windows/.test(textNorm)) {
              badge = {
                label: "Vinduer",
                className: "bg-cyan-500/15 text-cyan-400",
              };
            }
            return (
              <button
                key={ev.id}
                className="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs hover:bg-muted/50 transition-colors"
                onClick={() => onOpen(ev)}
                title="Klik for at se detaljer"
              >
                {badge && (
                  <span
                    className={`hidden sm:inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                )}
                <span className="font-medium truncate max-w-[200px]">
                  {ev.summary}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground whitespace-nowrap">
                  {datePrefix}
                  {timeLabel}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

