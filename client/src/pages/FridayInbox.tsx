import {
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Clock,
  Flame,
  Inbox,
  LayoutPanelTop,
  LucideIcon,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useFridayInboxData,
  type FridayInboxSegments,
  type FridayInboxSuggestion,
} from "@/features/friday-inbox/hooks/useFridayInboxData";
import { useEmailActions } from "@/hooks/useEmailActions";
import { cn } from "@/lib/utils";

type SegmentKey = keyof FridayInboxSegments;

const segmentOrder: SegmentKey[] = ["hot", "followUp", "finance", "done"];

const segmentMeta: Record<
  SegmentKey,
  { label: string; description: string; icon: LucideIcon; gradient: string }
> = {
  hot: {
    label: "Hot leads",
    description: "AI-score > 75 og ulæste",
    icon: Flame,
    gradient: "from-rose-500/30 to-orange-500/20",
  },
  followUp: {
    label: "Follow-ups",
    description: "Tilbud sendt • ingen respons",
    icon: Clock,
    gradient: "from-amber-500/25 to-yellow-400/15",
  },
  finance: {
    label: "Finance",
    description: "Betalinger og fakturaer",
    icon: ShieldCheck,
    gradient: "from-emerald-500/25 to-teal-500/15",
  },
  done: {
    label: "Done",
    description: "Arkiverede og afsluttede",
    icon: CheckCircle2,
    gradient: "from-indigo-500/25 to-blue-500/15",
  },
};

const priorityTheme: Record<
  FridayInboxSuggestion["priority"],
  { badge: string; glow: string; text: string }
> = {
  urgent: {
    badge: "bg-gradient-to-r from-rose-500 to-red-500 text-white border-none",
    glow: "shadow-[0_0_25px_rgba(244,63,94,0.45)]",
    text: "text-red-100",
  },
  high: {
    badge: "bg-gradient-to-r from-orange-500 to-amber-500 text-white border-none",
    glow: "shadow-[0_0_20px_rgba(251,146,60,0.4)]",
    text: "text-amber-100",
  },
  medium: {
    badge: "bg-gradient-to-r from-sky-500 to-cyan-500 text-white border-none",
    glow: "shadow-[0_0_20px_rgba(14,165,233,0.35)]",
    text: "text-sky-100",
  },
  low: {
    badge: "bg-gradient-to-r from-slate-500 to-slate-600 text-white border-none",
    glow: "shadow-[0_0_15px_rgba(148,163,184,0.35)]",
    text: "text-slate-200",
  },
};

const currencyFormatter = new Intl.NumberFormat("da-DK", {
  style: "currency",
  currency: "DKK",
  maximumFractionDigits: 0,
});

export default function FridayInbox() {
  const {
    emails,
    segments,
    stats,
    suggestions,
    intelligence,
    isLoading,
    isRefreshing,
    selectedThreadId,
    selectEmail,
    refetchAll,
  } = useFridayInboxData();

  const {
    archiveThread,
    markThreadAsRead,
    isArchiving,
    isMarkingRead,
  } = useEmailActions();

  const [activeSegment, setActiveSegment] = useState<SegmentKey>("hot");

  const activeEmails = segments[activeSegment] ?? [];
  const doneCount = segments.done.length;

  const aiChat = useMemo(() => {
    const remaining = Math.max(stats.total - doneCount, 0);

    return [
      {
        id: "overview",
        title: "Prioritering klar",
        body: `Jeg monitorerer ${stats.total} aktive tråde – ${stats.hot} er brandvarme leads og ${stats.followUp} venter på opfølgning.`,
      },
      {
        id: "focus",
        title: "Fokus på værdi",
        body: `Potentiel værdi i pipeline: ${currencyFormatter.format(
          stats.totalValue
        )}. Jeg foreslår at starte med de ${stats.hot} hottest leads.`,
      },
      {
        id: "completion",
        title: "Automations-status",
        body: `${stats.completionRate}% af dine workflows er done. Jeg holder de resterende ${remaining} i live view.`,
      },
    ];
  }, [doneCount, stats]);

  const statCards = useMemo(
    () => [
      {
        icon: Flame,
        label: "Hot leads",
        value: stats.hot,
        description: "Klar til svar nu",
      },
      {
        icon: Clock,
        label: "Follow-ups",
        value: stats.followUp,
        description: "Tilbud sendt • ingen respons",
      },
      {
        icon: ShieldCheck,
        label: "Finance",
        value: stats.finance,
        description: "Opkrævninger du skal lukke",
      },
      {
        icon: Inbox,
        label: "Ulæste",
        value: stats.unread,
        description: "Venter på triagering",
      },
    ],
    [stats]
  );

  const completionWidth = Math.min(stats.completionRate, 100);

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10 lg:px-8">
        <HeroSection stats={stats} onRefresh={refetchAll} refreshing={isRefreshing} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <LiveInboxBoard
              activeSegment={activeSegment}
              setActiveSegment={setActiveSegment}
              activeEmails={activeEmails}
              selectedThreadId={selectedThreadId}
              segments={segments}
              intelligence={intelligence}
              isLoading={isLoading && emails.length === 0}
              selectEmail={selectEmail}
              markThreadAsRead={markThreadAsRead}
              archiveThread={archiveThread}
              isArchiving={isArchiving}
              isMarkingRead={isMarkingRead}
              refetchAll={refetchAll}
              isRefreshing={isRefreshing}
            />
          </div>

          <div className="space-y-6">
            <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/60">
                    KPI overview
                  </p>
                  <h3 className="mt-1 text-xl font-semibold">Realtime performance</h3>
                </div>
                <Badge variant="outline" className="border-white/20 text-white/70">
                  Synkroniseret
                </Badge>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {statCards.map(card => (
                  <div
                    key={card.label}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <card.icon className="h-5 w-5 text-white/70" />
                    <p className="mt-3 text-xs uppercase tracking-wide text-white/60">
                      {card.label}
                    </p>
                    <p className="text-3xl font-semibold">{card.value}</p>
                    <p className="text-xs text-white/50">{card.description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between text-sm text-white/60">
                  <span>Automations completion</span>
                  <span>{completionWidth}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                    style={{ width: `${completionWidth}%` }}
                  />
                </div>
              </div>
            </Card>

            <AIAutopilotCard
              suggestions={suggestions}
              selectEmail={selectEmail}
              markThreadAsRead={markThreadAsRead}
              isMarkingRead={isMarkingRead}
            />
          </div>
        </div>

        <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Bot className="h-5 w-5 text-white/70" />
            <div>
              <p className="text-xs uppercase tracking-wider text-white/60">
                Friday AI Autopilot
              </p>
              <h3 className="text-xl font-semibold">Live reasoning feed</h3>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {aiChat.map(message => (
              <div
                key={message.id}
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-4"
              >
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/60">
                  <Sparkles className="h-3.5 w-3.5 text-white/70" />
                  AI status
                </div>
                <h4 className="mt-3 text-lg font-semibold">{message.title}</h4>
                <p className="mt-2 text-sm text-white/70">{message.body}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

interface HeroProps {
  stats: ReturnType<typeof useFridayInboxData>["stats"];
  onRefresh: () => Promise<void>;
  refreshing: boolean;
}

function HeroSection({ stats, onRefresh, refreshing }: HeroProps) {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#111827] p-10 shadow-[0_25px_80px_rgba(15,23,42,0.6)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_45%),radial-gradient(circle_at_80%_20%,_rgba(248,113,113,0.15),_transparent_45%)]" />
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-4">
          <Badge className="bg-white/10 text-white backdrop-blur">
            Friday • Nyt layout
          </Badge>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/60">
              Your Next AI Inbox
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
              Friday holder din indbakke i flow – helt automatisk
            </h1>
            <p className="mt-4 max-w-2xl text-base text-white/70">
              Inspireret af Jace.AI men bygget på vores data. Friday prioriterer emails,
              triggere workflows og foreslår næste handling – alt i ét live dashboard.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-white text-slate-900 hover:bg-slate-100" onClick={onRefresh} disabled={refreshing}>
              <Sparkles className="h-4 w-4" />
              {refreshing ? "Synkroniserer..." : "Synkroniser nu"}
            </Button>
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <LayoutPanelTop className="h-4 w-4" />
              Se automations
            </Button>
          </div>
        </div>

        <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/10 p-6 text-sm text-white/70 backdrop-blur lg:max-w-sm">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/60">
              Aktive workflows
            </p>
            <p className="mt-2 text-3xl font-semibold">{stats.total}</p>
            <p className="text-xs text-white/60">emails in play lige nu</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p className="text-white/60">Hot</p>
              <p className="mt-1 text-2xl font-semibold">{stats.hot}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p className="text-white/60">Follow-ups</p>
              <p className="mt-1 text-2xl font-semibold">{stats.followUp}</p>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-white/60">
              Potentiel værdi
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {currencyFormatter.format(stats.totalValue)}
            </p>
            <p className="text-xs text-white/60">estimeret pipeline</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface LiveInboxBoardProps {
  activeSegment: SegmentKey;
  setActiveSegment: (segment: SegmentKey) => void;
  activeEmails: ReturnType<typeof useFridayInboxData>["emails"];
  selectedThreadId: string | null;
  segments: FridayInboxSegments;
  intelligence: ReturnType<typeof useFridayInboxData>["intelligence"];
  isLoading: boolean;
  selectEmail: (threadId: string) => void;
  markThreadAsRead: (threadId: string) => void;
  archiveThread: (threadId: string) => void;
  isArchiving: boolean;
  isMarkingRead: boolean;
  refetchAll: () => Promise<void>;
  isRefreshing: boolean;
}

function LiveInboxBoard({
  activeSegment,
  setActiveSegment,
  activeEmails,
  selectedThreadId,
  segments,
  intelligence,
  isLoading,
  selectEmail,
  markThreadAsRead,
  archiveThread,
  isArchiving,
  isMarkingRead,
  refetchAll,
  isRefreshing,
}: LiveInboxBoardProps) {
  return (
    <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-white/60">
            Live triagering
          </p>
          <h2 className="text-2xl font-semibold">Inbox autopilot</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-white/20 text-white hover:bg-white/10"
          onClick={refetchAll}
          disabled={isRefreshing}
        >
          <RefreshCw className="h-4 w-4" />
          {isRefreshing ? "Opdaterer..." : "Opdater view"}
        </Button>
      </div>

      <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
        {segmentOrder.map(segment => {
          const config = segmentMeta[segment];
          const Icon = config.icon;
          const isActive = activeSegment === segment;
          return (
            <button
              key={segment}
              onClick={() => setActiveSegment(segment)}
              className={cn(
                "group flex min-w-[180px] flex-1 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition",
                isActive
                  ? "border-white/60 bg-white/10"
                  : "border-white/10 bg-white/5 hover:border-white/30"
              )}
            >
              <div
                className={cn(
                  "rounded-xl p-2 text-white shadow-inner",
                  isActive ? "bg-white/20" : "bg-white/10"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">{config.label}</p>
                <p className="text-xs text-white/60">{config.description}</p>
              </div>
              <Badge className="ml-auto bg-white/10 text-white">
                {segments[segment].length}
              </Badge>
            </button>
          );
        })}
      </div>

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <SegmentSkeleton />
        ) : activeEmails.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-10 text-center text-white/60">
            Ingen items i {segmentMeta[activeSegment].label} lige nu. Friday holder øje og
            sender nyt hertil så snart noget ændrer sig.
          </div>
        ) : (
          activeEmails.slice(0, 5).map(email => {
            const intel = intelligence[email.threadId];
            const priorityLevel = (intel?.priority?.level ||
              (email.unread ? "high" : "medium")) as FridayInboxSuggestion["priority"];
            const theme = priorityTheme[priorityLevel] ?? priorityTheme.medium;
            const isSelected = selectedThreadId === email.threadId;

            return (
              <div
                key={email.threadId}
                className={cn(
                  "relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:border-white/40",
                  isSelected && "border-white/60 bg-white/10"
                )}
              >
                <div
                  className={cn(
                    "pointer-events-none absolute inset-px rounded-3xl opacity-0 blur-3xl transition",
                    isSelected && "opacity-40",
                    theme.glow
                  )}
                />

                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-white/60">
                      {email.from}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold">{email.subject}</h3>
                    <p className="mt-3 text-sm text-white/60 line-clamp-2">{email.snippet}</p>
                  </div>
                  <Badge className={cn("uppercase tracking-wide text-[11px]", theme.badge)}>
                    {priorityLevel}
                  </Badge>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-white/60">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatEmailTimestamp(email.internalDate ?? email.date)}
                  </div>
                  {intel?.category?.category && (
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {intel.category.category}
                    </div>
                  )}
                  {email.aiAnalysis?.estimatedValue && (
                    <div className="flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5" />
                      {currencyFormatter.format(email.aiAnalysis.estimatedValue)}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="bg-white text-slate-900 hover:bg-slate-100"
                    onClick={() => selectEmail(email.threadId)}
                  >
                    Åbn tråd
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => markThreadAsRead(email.threadId)}
                    disabled={isMarkingRead}
                  >
                    Markér læst
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                    onClick={() => archiveThread(email.threadId)}
                    disabled={isArchiving}
                  >
                    Afslut
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}

interface AIAutopilotCardProps {
  suggestions: FridayInboxSuggestion[];
  selectEmail: (threadId: string) => void;
  markThreadAsRead: (threadId: string) => void;
  isMarkingRead: boolean;
}

function AIAutopilotCard({
  suggestions,
  selectEmail,
  markThreadAsRead,
  isMarkingRead,
}: AIAutopilotCardProps) {
  return (
    <Card className="border-white/10 bg-gradient-to-b from-white/10 to-transparent p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-white/60">
            Autopilot
          </p>
          <h3 className="text-xl font-semibold">AI næste handlinger</h3>
        </div>
        <Badge variant="outline" className="border-white/20 text-white/70">
          Realtime feed
        </Badge>
      </div>

      <ScrollArea className="mt-6 max-h-[460px] pr-3">
        {suggestions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center text-sm text-white/60">
            Ingen anbefalinger i køen endnu. Når Friday finder noget vigtigt, dukker det
            op her.
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map(suggestion => {
              const theme = priorityTheme[suggestion.priority];
              return (
                <div
                  key={suggestion.threadId}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-white/60">
                        {suggestion.contactName}
                      </p>
                      <h4 className="text-base font-semibold">{suggestion.subject}</h4>
                      <p className="mt-2 text-sm text-white/70">{suggestion.reason}</p>
                    </div>
                    <Badge className={cn("text-[11px] uppercase", theme.badge)}>
                      {suggestion.priority}
                    </Badge>
                  </div>
                  {suggestion.estimatedValue && (
                    <p className={cn("mt-3 text-xs font-semibold", theme.text)}>
                      Estimeret værdi {currencyFormatter.format(suggestion.estimatedValue)}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      className="bg-white text-slate-900 hover:bg-slate-100"
                      onClick={() => selectEmail(suggestion.threadId)}
                    >
                      <Sparkles className="h-4 w-4" />
                      Triager
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/10"
                      onClick={() => markThreadAsRead(suggestion.threadId)}
                      disabled={isMarkingRead}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Markér læst
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}

function SegmentSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-3xl border border-white/10 bg-white/5 p-5"
        >
          <Skeleton className="h-3.5 w-1/3 bg-white/20" />
          <Skeleton className="mt-3 h-5 w-2/3 bg-white/20" />
          <Skeleton className="mt-6 h-3 bg-white/10" />
        </div>
      ))}
    </div>
  );
}

function formatEmailTimestamp(value?: number | string) {
  if (!value) {
    return "Ukendt";
  }

  const date =
    typeof value === "number"
      ? new Date(value)
      : Number.isNaN(Date.parse(value))
        ? new Date()
        : new Date(value);

  return date.toLocaleString("da-DK", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
