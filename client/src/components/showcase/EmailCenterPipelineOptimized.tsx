import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Send,
  Calendar,
  FileText,
  CheckCircle,
  Zap,
  Clock,
  AlertTriangle,
  DollarSign,
  User,
} from "lucide-react";

/**
 * DESIGN 8: Pipeline-Optimized with Quick Actions
 * - Fokus på Friday AI's 5 pipeline stages
 * - One-click quick actions per stage
 * - Visual workflow med arrows
 * - Keyboard shortcuts (1-5)
 * - Progress tracking
 */

interface PipelineEmail {
  id: string;
  from: string;
  subject: string;
  source: string;
  time: string;
  stage:
    | "needs_action"
    | "venter_pa_svar"
    | "i_kalender"
    | "finance"
    | "afsluttet";
  quickActions: string[];
  estimatedValue?: number;
}

const stages = [
  {
    id: "needs_action",
    label: "Needs Action",
    icon: Zap,
    color: "bg-red-500",
    shortcut: "1",
  },
  {
    id: "venter_pa_svar",
    label: "Venter på svar",
    icon: Clock,
    color: "bg-yellow-500",
    shortcut: "2",
  },
  {
    id: "i_kalender",
    label: "I kalender",
    icon: Calendar,
    color: "bg-blue-500",
    shortcut: "3",
  },
  {
    id: "finance",
    label: "Finance",
    icon: DollarSign,
    color: "bg-green-500",
    shortcut: "4",
  },
  {
    id: "afsluttet",
    label: "Afsluttet",
    icon: CheckCircle,
    color: "bg-gray-400",
    shortcut: "5",
  },
];

const quickActionsByStage: Record<
  string,
  Array<{ label: string; icon: any; description: string }>
> = {
  needs_action: [
    {
      label: "Send Tilbud",
      icon: Send,
      description: "Brug template → Venter på svar",
    },
    {
      label: "Opret Lead",
      icon: User,
      description: "Gem i CRM → Venter på svar",
    },
    {
      label: "Ring Kunde",
      icon: Calendar,
      description: "Book opkald → I kalender",
    },
  ],
  venter_pa_svar: [
    {
      label: "Bekræft Booking",
      icon: CheckCircle,
      description: "Booking bekræftet → I kalender",
    },
    { label: "Send Follow-up", icon: Send, description: "Automated follow-up" },
    {
      label: "Mark Lost",
      icon: AlertTriangle,
      description: "Ikke interesseret → Afsluttet",
    },
  ],
  i_kalender: [
    {
      label: "Job Completed",
      icon: CheckCircle,
      description: "Opgave færdig → Finance",
    },
    { label: "Reschedule", icon: Calendar, description: "Flyt i kalender" },
    { label: "Send Reminder", icon: Clock, description: "24h før reminder" },
  ],
  finance: [
    { label: "Send Faktura", icon: FileText, description: "Billy integration" },
    {
      label: "Mark Paid",
      icon: DollarSign,
      description: "Betaling modtaget → Afsluttet",
    },
    { label: "Send Reminder", icon: Clock, description: "Payment reminder" },
  ],
  afsluttet: [
    { label: "Reopen", icon: ArrowRight, description: "Genåbn sag" },
    {
      label: "Archive",
      icon: CheckCircle,
      description: "Permanent arkivering",
    },
  ],
};

const emails: PipelineEmail[] = [
  {
    id: "1",
    from: "Matilde Skinneholm",
    subject: "Tilbud rengøring",
    source: "Rengøring.nu",
    time: "22:08",
    stage: "needs_action",
    quickActions: ["Send Tilbud", "Opret Lead"],
    estimatedValue: 40000,
  },
  {
    id: "2",
    from: "Hanne Andersen",
    subject: "Følg op tilbud",
    source: "Direct",
    time: "17:39",
    stage: "venter_pa_svar",
    quickActions: ["Bekræft Booking", "Send Follow-up"],
    estimatedValue: 25000,
  },
  {
    id: "3",
    from: "Lars Nielsen",
    subject: "Booking bekræftet",
    source: "Direct",
    time: "10:15",
    stage: "i_kalender",
    quickActions: ["Job Completed", "Send Reminder"],
  },
  {
    id: "4",
    from: "Maria Hansen",
    subject: "Job færdig",
    source: "Website",
    time: "Igår",
    stage: "finance",
    quickActions: ["Send Faktura", "Mark Paid"],
    estimatedValue: 8500,
  },
];

export function EmailCenterPipelineOptimized() {
  const [activeStage, setActiveStage] = useState("needs_action");
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  const filteredEmails = emails.filter(e => e.stage === activeStage);
  const stageIndex = stages.findIndex(s => s.id === activeStage);

  return (
    <Card>
      <CardContent className="p-0">
        {/* Pipeline Visual Navigation */}
        <div className="border-b p-4 bg-muted/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Pipeline Workflow</h3>
            <div className="text-xs text-muted-foreground">
              Press{" "}
              <kbd className="px-2 py-1 bg-background border rounded">1-5</kbd>{" "}
              to switch stages
            </div>
          </div>

          {/* Stage Pills with Arrows */}
          <div className="flex items-center gap-2">
            {stages.map((stage, idx) => {
              const Icon = stage.icon;
              const count = emails.filter(e => e.stage === stage.id).length;
              const isActive = stage.id === activeStage;

              return (
                <div key={stage.id} className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveStage(stage.id)}
                    className={cn(
                      "relative flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all",
                      isActive
                        ? "border-primary bg-primary/10 scale-105 shadow-md"
                        : "border-border hover:border-primary/50 hover:bg-accent/30"
                    )}
                  >
                    {/* Shortcut Badge */}
                    <div
                      className={cn(
                        "absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border-2 border-background",
                        stage.color,
                        "text-white"
                      )}
                    >
                      {stage.shortcut}
                    </div>

                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        stage.color
                      )}
                    >
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm">{stage.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {count} emails
                      </div>
                    </div>
                  </button>

                  {/* Arrow */}
                  {idx < stages.length - 1 && (
                    <ArrowRight
                      className={cn(
                        "h-5 w-5",
                        idx < stageIndex
                          ? "text-primary"
                          : "text-muted-foreground/30"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Stage Progress */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Progress:</span>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 via-blue-500 via-green-500 to-gray-400 transition-all"
                style={{
                  width: `${((stageIndex + 1) / stages.length) * 100}%`,
                }}
              />
            </div>
            <span className="text-xs font-semibold">
              {stageIndex + 1}/{stages.length}
            </span>
          </div>
        </div>

        <div className="flex h-[600px]">
          {/* Email List */}
          <div className="w-[45%] border-r">
            <div className="border-b p-3 bg-muted/30">
              <h4 className="font-semibold text-sm">
                {stages[stageIndex].label}
              </h4>
              <p className="text-xs text-muted-foreground">
                {filteredEmails.length} emails i denne stage
              </p>
            </div>

            <ScrollArea className="h-[calc(100%-61px)]">
              {filteredEmails.length > 0 ? (
                <div className="divide-y">
                  {filteredEmails.map((email, idx) => (
                    <div
                      key={email.id}
                      onClick={() => setSelectedEmail(email.id)}
                      className={cn(
                        "p-4 cursor-pointer transition-all",
                        selectedEmail === email.id &&
                          "bg-accent/50 border-l-4 border-l-primary",
                        "hover:bg-accent/30"
                      )}
                      style={{
                        animation: `slideUp 0.3s ease-out ${idx * 0.05}s both`,
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold text-sm">
                            {email.from}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {email.subject}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {email.time}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {email.source}
                        </Badge>
                        {email.estimatedValue && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <DollarSign className="h-3 w-3" />
                            {email.estimatedValue.toLocaleString("da-DK")} kr
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Ingen emails i denne stage
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Godt arbejde! 🎉
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Quick Actions Panel */}
          <div className="flex-1 p-6">
            {selectedEmail ? (
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Quick Actions
                </h3>

                <p className="text-sm text-muted-foreground mb-6">
                  One-click actions for current stage. Each action automatically
                  moves email to next stage if applicable.
                </p>

                <div className="space-y-3">
                  {quickActionsByStage[activeStage]?.map((action, idx) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={idx}
                        variant="outline"
                        className="w-full h-auto py-4 justify-start group hover:border-primary hover:bg-primary/5"
                      >
                        <div className="flex items-start gap-3 text-left w-full">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-sm mb-1">
                              {action.label}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {action.description}
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Button>
                    );
                  })}
                </div>

                {/* Stage Transition Preview */}
                <div className="mt-6 p-4 rounded-lg bg-muted/30 border">
                  <h4 className="text-sm font-semibold mb-2">After Action</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">
                      Email will move to:
                    </span>
                    {stageIndex < stages.length - 1 && (
                      <Badge variant="outline" className="gap-2">
                        {stages[stageIndex + 1].label}
                        <ArrowRight className="h-3 w-3" />
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Keyboard Shortcuts Help */}
                <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <h4 className="text-sm font-semibold mb-2 text-blue-900">
                    💡 Pro Tip
                  </h4>
                  <p className="text-xs text-blue-800">
                    Use keyboard shortcuts{" "}
                    <kbd className="px-1.5 py-0.5 bg-white border rounded">
                      1-5
                    </kbd>{" "}
                    to switch between stages, and{" "}
                    <kbd className="px-1.5 py-0.5 bg-white border rounded">
                      Space
                    </kbd>{" "}
                    to execute first quick action.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Zap className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  Select an email to see quick actions
                </p>
              </div>
            )}
          </div>
        </div>

        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </CardContent>
    </Card>
  );
}
