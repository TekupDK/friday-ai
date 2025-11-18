/**
 * TASK CARD DETAILED - Task manager med subtasks
 */

import { CheckCircle2, Circle, Calendar, User, Flag } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";


export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskData {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  assignee?: string;
  subtasks: SubTask[];
  tags: string[];
}

const PRIORITY_CONFIG = {
  low: {
    icon: "🔵",
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/20",
  },
  medium: {
    icon: "🟡",
    color: "text-yellow-600",
    bg: "bg-yellow-50 dark:bg-yellow-950/20",
  },
  high: {
    icon: "🔴",
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-950/20",
  },
};

interface TaskCardDetailedProps {
  data: TaskData;
  onToggleSubtask?: (subtaskId: string) => void;
  onUpdateStatus?: (status: TaskData["status"]) => void;
  onDelete?: () => void;
}

export function TaskCardDetailed({
  data,
  onToggleSubtask,
  onUpdateStatus,
  onDelete,
}: TaskCardDetailedProps) {
  const [expanded, setExpanded] = useState(false);
  const priorityConfig = PRIORITY_CONFIG[data.priority];
  const completedSubtasks = data.subtasks.filter(st => st.completed).length;
  const progress =
    data.subtasks.length > 0
      ? (completedSubtasks / data.subtasks.length) * 100
      : 0;

  return (
    <Card
      className={cn(
        "border-l-4 transition-all",
        data.status === "done"
          ? "opacity-60 border-l-green-500"
          : "border-l-blue-500"
      )}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 mt-0.5"
            onClick={() =>
              onUpdateStatus?.(data.status === "done" ? "todo" : "done")
            }
          >
            {data.status === "done" ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground" />
            )}
          </Button>

          <div className="flex-1 min-w-0">
            <h4
              className={cn(
                "font-semibold text-base",
                data.status === "done" && "line-through text-muted-foreground"
              )}
            >
              {data.title}
            </h4>

            {data.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {data.description}
              </p>
            )}

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant="secondary" className={priorityConfig.bg}>
                {priorityConfig.icon} {data.priority}
              </Badge>

              {data.status !== "todo" && (
                <Badge>
                  {data.status === "in_progress" ? "⏳ I gang" : "✅ Færdig"}
                </Badge>
              )}

              {data.tags.map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {data.dueDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>
                {data.dueDate.toLocaleDateString("da-DK", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
          )}
          {data.assignee && (
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>{data.assignee}</span>
            </div>
          )}
        </div>

        {/* Subtasks Progress */}
        {data.subtasks.length > 0 && (
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Subtasks</span>
              <span className="font-medium">
                {completedSubtasks}/{data.subtasks.length}
              </span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {/* Subtasks List */}
        {expanded && data.subtasks.length > 0 && (
          <div className="space-y-2 pt-2 border-t animate-in slide-in-from-top-2">
            {data.subtasks.map(subtask => (
              <div key={subtask.id} className="flex items-center gap-2 group">
                <Checkbox
                  checked={subtask.completed}
                  onCheckedChange={() => onToggleSubtask?.(subtask.id)}
                />
                <label
                  className={cn(
                    "text-sm flex-1 cursor-pointer",
                    subtask.completed && "line-through text-muted-foreground"
                  )}
                >
                  {subtask.title}
                </label>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t">
          {data.subtasks.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="flex-1"
            >
              {expanded ? "▲ Skjul" : `▼ Vis ${data.subtasks.length} subtasks`}
            </Button>
          )}

          {data.status !== "done" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateStatus?.("in_progress")}
              className="flex-1"
            >
              Start
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
          >
            Slet
          </Button>
        </div>
      </div>
    </Card>
  );
}
