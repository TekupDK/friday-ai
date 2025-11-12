/**
 * Tool Execution Modal - Viser Friday AI's tool execution i real-time
 * Inspireret af Claude/ChatGPT's tool use UI
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  UserPlus,
  CheckCircle2,
  FileText,
  Mail,
  Camera,
  Clock,
  Loader2,
  X,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToolSubtask {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  startTime?: Date;
  endTime?: Date;
}

export interface ToolExecution {
  id: string;
  name: string;
  displayName: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  progress: number; // 0-100
  subtasks: ToolSubtask[];
  startTime: Date;
  endTime?: Date;
  error?: string;
}

interface ToolExecutionModalProps {
  execution: ToolExecution | null;
  onCancel?: () => void;
  onClose?: () => void;
}

// Icon mapping for Friday AI's tools
const TOOL_ICONS = {
  create_lead: UserPlus,
  create_task: CheckCircle2,
  book_meeting: Calendar,
  create_invoice: FileText,
  search_email: Mail,
  request_flytter_photos: Camera,
  job_completion: CheckCircle2,
  check_calendar: Calendar,
} as const;

// Danish display names for tools
const TOOL_NAMES = {
  create_lead: "Opretter lead",
  create_task: "Opretter opgave",
  book_meeting: "Booker møde",
  create_invoice: "Opretter faktura",
  search_email: "Søger i emails",
  request_flytter_photos: "Anmoder om billeder",
  job_completion: "Afslutter job",
  check_calendar: "Tjekker kalender",
} as const;

function StatusIcon({ status }: { status: ToolSubtask["status"] }) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    case "running":
      return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
    case "failed":
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    default:
      return <Clock className="w-4 h-4 text-muted-foreground" />;
  }
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Progress</span>
        <span className="text-sm font-bold text-primary">{value}%</span>
      </div>
      <div className="w-full bg-secondary/30 rounded-full h-3 overflow-hidden">
        <div
          className="bg-blue-500 h-full transition-all duration-500 ease-out rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

function SubtaskItem({ subtask }: { subtask: ToolSubtask }) {
  const duration =
    subtask.endTime && subtask.startTime
      ? Math.round(
          (subtask.endTime.getTime() - subtask.startTime.getTime()) / 1000
        )
      : null;

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <StatusIcon status={subtask.status} />
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium",
            subtask.status === "completed" &&
              "text-muted-foreground line-through",
            subtask.status === "running" && "text-blue-600"
          )}
        >
          {subtask.name}
        </p>
      </div>
      {duration !== null && subtask.status === "completed" && (
        <span className="text-xs text-muted-foreground">{duration}s</span>
      )}
    </div>
  );
}

export function ToolExecutionModal({
  execution,
  onCancel,
  onClose,
}: ToolExecutionModalProps) {
  if (!execution) return null;

  const Icon =
    TOOL_ICONS[execution.name as keyof typeof TOOL_ICONS] || CheckCircle2;
  const displayName =
    TOOL_NAMES[execution.name as keyof typeof TOOL_NAMES] ||
    execution.displayName;

  const isActive =
    execution.status === "running" || execution.status === "pending";
  const canCancel = isActive && onCancel;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span>{displayName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          {isActive && <ProgressBar value={execution.progress} />}

          {/* Status Badge */}
          <div>
            <Badge
              variant={
                execution.status === "completed"
                  ? "default"
                  : execution.status === "failed"
                    ? "destructive"
                    : execution.status === "cancelled"
                      ? "secondary"
                      : "outline"
              }
            >
              {execution.status === "completed" && "✓ Færdig"}
              {execution.status === "running" && "⏳ Kører..."}
              {execution.status === "pending" && "⏸️ Venter..."}
              {execution.status === "failed" && "✗ Fejl"}
              {execution.status === "cancelled" && "⊗ Annulleret"}
            </Badge>
          </div>

          {/* Subtasks */}
          {execution.subtasks.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Delprocesser</h4>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {execution.subtasks.map(subtask => (
                  <SubtaskItem key={subtask.id} subtask={subtask} />
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {execution.error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{execution.error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-2">
            {canCancel && (
              <Button variant="outline" size="sm" onClick={onCancel}>
                <X className="w-4 h-4 mr-1" />
                Annuller
              </Button>
            )}
            {!isActive && (
              <Button variant="default" size="sm" onClick={onClose}>
                Luk
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
