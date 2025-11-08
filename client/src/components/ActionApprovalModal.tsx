import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useEmailContext } from "@/contexts/EmailContext";
import {
  AlertTriangle,
  Archive,
  Calendar,
  Clock,
  FileCheck,
  FileText,
  Mail,
  Plus,
  Send,
  Sparkles,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";

export interface PendingAction {
  id: string;
  type:
    | "create_lead"
    | "create_task"
    | "book_meeting"
    | "create_invoice"
    | "search_gmail"
    | "request_flytter_photos"
    | "job_completion"
    | "check_calendar" // Calendar viewing action
    | "send_email"
    | "delete_email"
    | "archive_email"
    | "snooze_email"
    | "mark_email_done"
    | "ai_generate_summaries"
    | "ai_suggest_labels"
    | "update_calendar_event"
    | "delete_calendar_event"
    | "check_calendar_conflicts";
  params: Record<string, any>;
  impact: string;
  preview: string;
  riskLevel: "low" | "medium" | "high";
}

interface ActionApprovalModalProps {
  action: PendingAction | null;
  open: boolean;
  onApprove: (alwaysApprove: boolean) => void;
  onReject: () => void;
}

export const ACTION_ICONS = {
  create_lead: UserPlus,
  create_task: Plus,
  book_meeting: Calendar,
  create_invoice: FileText,
  search_gmail: Mail,
  request_flytter_photos: AlertTriangle,
  job_completion: FileCheck,
  check_calendar: Calendar, // Calendar viewing
  send_email: Send,
  delete_email: Trash2,
  archive_email: Archive,
  snooze_email: Clock,
  mark_email_done: FileCheck,
  ai_generate_summaries: Sparkles,
  ai_suggest_labels: Sparkles,
  update_calendar_event: Calendar,
  delete_calendar_event: Trash2,
  check_calendar_conflicts: AlertTriangle,
};

export const ACTION_LABELS = {
  create_lead: "Opret Lead",
  create_task: "Opret Opgave",
  book_meeting: "Book Kalenderaftale",
  create_invoice: "Opret Faktura",
  search_gmail: "Søg i Gmail",
  request_flytter_photos: "Anmod om Billeder",
  job_completion: "Afslut Job",
  check_calendar: "Vis Kalender", // Calendar viewing
  send_email: "Send E-mail",
  delete_email: "Slet E-mail",
  archive_email: "Arkiver E-mail",
  snooze_email: "Udsæt E-mail",
  mark_email_done: "Marker E-mail som Færdig",
  ai_generate_summaries: "AI: Generér Resuméer",
  ai_suggest_labels: "AI: Foreslå Labels",
  update_calendar_event: "Rediger Kalender Booking",
  delete_calendar_event: "Slet Kalender Booking",
  check_calendar_conflicts: "Tjek Kalender Konflikter",
};

export const RISK_COLORS = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-red-100 text-red-800 border-red-200",
};

export const RISK_LABELS = {
  low: "Lav risiko",
  medium: "Mellem risiko",
  high: "Høj risiko",
};

export function ActionApprovalModal({
  action,
  open,
  onApprove,
  onReject,
}: ActionApprovalModalProps) {
  const [alwaysApprove, setAlwaysApprove] = useState(false);
  const emailContext = useEmailContext();
  const selectedCount = emailContext.state.selectedThreads.size;

  // Keyboard shortcuts: Cmd/Ctrl+Enter to approve, Escape to reject
  useEffect(() => {
    if (!open || !action) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Enter = Approve
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        onApprove(alwaysApprove);
      }
      // Escape = Reject
      if (e.key === "Escape") {
        e.preventDefault();
        onReject();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, action, onApprove, onReject, alwaysApprove]); // Keyboard shortcuts: Cmd/Ctrl+Enter to approve, Escape to reject

  if (!action) return null;

  const Icon = ACTION_ICONS[action.type] || Sparkles; // Fallback icon
  const label = ACTION_LABELS[action.type] || action.type;
  const riskColor = RISK_COLORS[action.riskLevel] || RISK_COLORS.low;
  const riskLabel = RISK_LABELS[action.riskLevel] || "Lav risiko";

  return (
    <AlertDialog
      open={open}
      onOpenChange={isOpen => {
        // When dialog tries to close (isOpen = false), call onReject
        if (!isOpen) {
          onReject();
        }
      }}
    >
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-lg ${
                action.riskLevel === "high"
                  ? "bg-red-100 text-red-600"
                  : action.riskLevel === "medium"
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-green-100 text-green-600"
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="text-lg font-semibold">
                {label}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm mt-1">
                Friday vil udføre denne handling
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-3 py-3">
          {/* Impact */}
          <div>
            <p className="text-sm text-muted-foreground">{action.impact}</p>
          </div>

          {/* Preview */}
          {action.preview && (
            <div className="p-3 bg-muted/50 border border-border rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{action.preview}</p>
            </div>
          )}

          {/* Selection hint for inbox AI actions */}
          {(action.type === "ai_generate_summaries" ||
            action.type === "ai_suggest_labels") &&
            selectedCount > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-xs">
                  {selectedCount} emails valgt
                </Badge>
              </div>
            )}

          {/* Risk warning for high risk actions */}
          {action.riskLevel === "high" && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-xs text-red-700">
                Dette er en høj risiko handling. Dobbelttjek at alt er korrekt.
              </p>
            </div>
          )}

          {/* Always Approve Option */}
          {action.riskLevel === "low" && (
            <div className="flex items-start gap-2 pt-2">
              <Checkbox
                id="always-approve"
                checked={alwaysApprove}
                onCheckedChange={checked =>
                  setAlwaysApprove(checked as boolean)
                }
                className="mt-0.5"
              />
              <Label
                htmlFor="always-approve"
                className="text-xs text-muted-foreground cursor-pointer"
              >
                Godkend altid automatisk
              </Label>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onReject}>Afvis</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onApprove(alwaysApprove)}
            className={`${
              action.riskLevel === "high"
                ? "bg-red-600 hover:bg-red-700"
                : action.riskLevel === "medium"
                  ? "bg-yellow-600 hover:bg-yellow-700"
                  : ""
            }`}
          >
            {action.riskLevel === "high" ? "Ja, udfør" : "Godkend"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
