/**
 * TASK CARD - Opgave kort
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckSquare, Clock, User, Calendar, ChevronRight } from "lucide-react";
import { useState } from "react";

export interface TaskCardProps {
  task?: {
    id: string;
    title: string;
    description: string;
    status: "pending" | "in-progress" | "completed";
    priority: "low" | "medium" | "high";
    assignee: string;
    dueDate: string;
    progress: number;
  };
  onStart?: () => void;
  onComplete?: () => void;
  onView?: () => void;
}

export function TaskCard({
  task = {
    id: "1",
    title: "Opdater kundedata",
    description: "Gennemgå og opdater alle kundeoplysninger i CRM systemet",
    status: "in-progress",
    priority: "high",
    assignee: "John Smith",
    dueDate: "I morgen",
    progress: 65,
  },
  onStart,
  onComplete,
  onView,
}: TaskCardProps) {
  const [status, setStatus] = useState(task.status);

  const getPriorityColor = () => {
    switch (task.priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      default:
        return "bg-green-500";
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Færdig</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-500">I gang</Badge>;
      default:
        return <Badge variant="secondary">Afventer</Badge>;
    }
  };

  return (
    <Card className="border-l-4 border-l-purple-500">
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-600 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">{task.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge()}
                <Badge className={getPriorityColor()}>
                  {task.priority === "high"
                    ? "Høj"
                    : task.priority === "medium"
                      ? "Medium"
                      : "Lav"}
                </Badge>
              </div>
            </div>
          </div>
          <Button size="icon" variant="ghost" onClick={onView}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">{task.description}</p>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Fremskridt</span>
            <span>{task.progress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{task.assignee}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{task.dueDate}</span>
            </div>
          </div>
          <div className="flex gap-1">
            {status === "pending" && (
              <Button
                size="sm"
                onClick={() => {
                  setStatus("in-progress");
                  onStart?.();
                }}
              >
                Start
              </Button>
            )}
            {status === "in-progress" && (
              <Button
                size="sm"
                onClick={() => {
                  setStatus("completed");
                  onComplete?.();
                }}
              >
                Færdig
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
