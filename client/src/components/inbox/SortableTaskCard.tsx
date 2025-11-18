import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, GripVertical, Link2, MoreVertical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";
type TaskPriority = "low" | "medium" | "high" | "urgent";

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  todo: {
    label: "To Do",
    color: "bg-blue-500",
  },
  in_progress: {
    label: "In Progress",
    color: "bg-yellow-500",
  },
  done: {
    label: "Done",
    color: "bg-green-500",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-gray-500",
  },
};

const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  low: { label: "Lav", variant: "outline" },
  medium: { label: "Medium", variant: "default" },
  high: { label: "Høj", variant: "secondary" },
  urgent: { label: "Urgent", variant: "destructive" },
};

interface SortableTaskCardProps {
  task: any;
  isSelected?: boolean;
  onSelect?: (taskId: number, checked: boolean) => void;
  onCheckboxChange: (task: any, checked: boolean) => void;
  onEditClick: (task: any) => void;
  onDeleteClick: (task: any) => void;
  onStatusChange: (taskId: number, status: TaskStatus) => void;
  getDueDateDisplay: (dueDate: Date | null | undefined) => {
    text: string;
    isOverdue?: boolean;
    isToday?: boolean;
    isUpcoming?: boolean;
  } | null;
}

export function SortableTaskCard({
  task,
  isSelected,
  onSelect,
  onCheckboxChange,
  onEditClick,
  onDeleteClick,
  onStatusChange,
  getDueDateDisplay,
}: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const statusConfig =
    STATUS_CONFIG[task.status as TaskStatus] || STATUS_CONFIG.todo;
  const priorityConfig =
    PRIORITY_CONFIG[task.priority as TaskPriority] || PRIORITY_CONFIG.medium;
  const dueDateDisplay = getDueDateDisplay(task.dueDate);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-4 hover:bg-accent/50 transition-colors ${
        isSelected ? "ring-2 ring-primary" : ""
      } ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
    >
      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          onClick={e => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </div>
        {onSelect ? (
          <Checkbox
            checked={isSelected || false}
            onCheckedChange={checked => onSelect(task.id, checked === true)}
            className="mt-1"
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <Checkbox
            checked={task.status === "done"}
            onCheckedChange={checked =>
              onCheckboxChange(task, checked === true)
            }
            className="mt-1"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <p
                className={`font-medium ${
                  task.status === "done"
                    ? "line-through text-muted-foreground"
                    : ""
                }`}
              >
                {task.title}
              </p>
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={priorityConfig.variant} className="text-xs">
                {priorityConfig.label}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEditClick(task)}>
                    Rediger
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      onStatusChange(
                        task.id,
                        task.status === "todo" ? "in_progress" : "todo"
                      )
                    }
                  >
                    Markér som{" "}
                    {task.status === "todo" ? "In Progress" : "To Do"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onStatusChange(task.id, "done")}
                  >
                    Markér som Done
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDeleteClick(task)}
                    className="text-destructive"
                  >
                    Slet
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {statusConfig.label}
            </Badge>
            {dueDateDisplay && (
              <div
                className={`text-xs flex items-center gap-1 ${
                  dueDateDisplay.isOverdue
                    ? "text-destructive font-medium"
                    : dueDateDisplay.isToday
                      ? "text-yellow-600 dark:text-yellow-400 font-medium"
                      : "text-muted-foreground"
                }`}
              >
                <Calendar className="w-3 h-3" />
                {dueDateDisplay.text}
              </div>
            )}
            {task.relatedTo && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Link2 className="w-3 h-3" />
                {task.relatedTo}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

