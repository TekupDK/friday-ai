import { Clock, Flag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  dueDate?: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  category?: string;
}

const tasks: Task[] = [
  {
    id: "1",
    title: "Hvad kan jeg hjælpe med?",
    category: "Chat Suggestion",
    priority: "low",
    completed: false,
  },
  {
    id: "2",
    title: "Tjek min kalender i dag",
    dueDate: "I dag",
    priority: "medium",
    completed: false,
  },
  {
    id: "3",
    title: "Vis ubetalte fakturaer",
    dueDate: "I dag",
    priority: "high",
    completed: false,
  },
  {
    id: "4",
    title: "Find nye leads",
    priority: "medium",
    completed: false,
  },
  {
    id: "5",
    title: "Hvad kan Friday?",
    category: "Info",
    priority: "low",
    completed: true,
  },
];

const priorityConfig = {
  low: { color: "text-gray-500", bg: "bg-gray-500/10" },
  medium: { color: "text-orange-500", bg: "bg-orange-500/10" },
  high: { color: "text-red-500", bg: "bg-red-500/10" },
};

export function TaskListCompact() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Denne Uge</span>
          <Badge variant="secondary" className="text-xs">
            {tasks.filter(t => !t.completed).length} aktive
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {tasks.map(task => (
            <div
              key={task.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-all",
                "hover:bg-accent/50 cursor-pointer",
                task.completed && "opacity-50"
              )}
            >
              <Checkbox checked={task.completed} className="mt-0.5" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      task.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {task.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {task.dueDate && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {task.dueDate}
                    </div>
                  )}
                  {task.category && (
                    <Badge variant="outline" className="text-xs">
                      {task.category}
                    </Badge>
                  )}
                </div>
              </div>

              <div
                className={cn(
                  "w-2 h-2 rounded-full flex-shrink-0 mt-2",
                  priorityConfig[task.priority].bg
                )}
              >
                <div
                  className={cn(
                    "w-full h-full rounded-full",
                    priorityConfig[task.priority].color.replace("text-", "bg-")
                  )}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <button className="text-sm text-primary hover:underline">
            + Tilføj ny opgave
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
