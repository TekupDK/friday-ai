import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { GripVertical, User, Calendar } from "lucide-react";

interface Task {
  id: number;
  title: string;
  assignee?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
}

interface Column {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
}

const initialColumns: Column[] = [
  {
    id: 'todo',
    title: 'To Do',
    color: 'bg-gray-500',
    tasks: [
      { id: 1, title: 'Analyser nye leads', assignee: 'Hans', dueDate: 'I dag', priority: 'high' },
      { id: 2, title: 'Send tilbud til kunde', assignee: 'Maria', dueDate: 'I morgen', priority: 'medium' }
    ]
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    color: 'bg-blue-500',
    tasks: [
      { id: 3, title: 'Opret faktura', assignee: 'Peter', priority: 'high' },
      { id: 4, title: 'Book møde med team', priority: 'low' }
    ]
  },
  {
    id: 'review',
    title: 'Review',
    color: 'bg-purple-500',
    tasks: [
      { id: 5, title: 'Gennemse kontrakt', assignee: 'Hans', priority: 'medium' }
    ]
  },
  {
    id: 'done',
    title: 'Done',
    color: 'bg-green-500',
    tasks: [
      { id: 6, title: 'Email til kunde sendt', assignee: 'Maria', priority: 'low' },
      { id: 7, title: 'Kundemøde afholdt', assignee: 'Peter', priority: 'medium' }
    ]
  }
];

const priorityColors = {
  low: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  medium: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  high: 'bg-red-500/10 text-red-600 dark:text-red-400'
};

export function KanbanBoardDemo() {
  const [columns, setColumns] = useState(initialColumns);
  const [draggedTask, setDraggedTask] = useState<{ task: Task; fromColumn: string } | null>(null);

  const handleDragStart = (task: Task, columnId: string) => {
    setDraggedTask({ task, fromColumn: columnId });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (toColumnId: string) => {
    if (!draggedTask) return;

    setColumns(prevColumns => {
      const newColumns = prevColumns.map(col => {
        // Remove from source column
        if (col.id === draggedTask.fromColumn) {
          return {
            ...col,
            tasks: col.tasks.filter(t => t.id !== draggedTask.task.id)
          };
        }
        // Add to destination column
        if (col.id === toColumnId) {
          return {
            ...col,
            tasks: [...col.tasks, draggedTask.task]
          };
        }
        return col;
      });
      return newColumns;
    });

    setDraggedTask(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((column) => (
        <div
          key={column.id}
          className="flex flex-col gap-3"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(column.id)}
        >
          {/* Column header */}
          <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", column.color)} />
            <h3 className="font-semibold text-sm">{column.title}</h3>
            <Badge variant="secondary" className="ml-auto">
              {column.tasks.length}
            </Badge>
          </div>

          {/* Tasks */}
          <div className="space-y-2 min-h-[400px] p-2 rounded-lg border-2 border-dashed border-muted">
            {column.tasks.map((task, idx) => (
              <Card
                key={task.id}
                draggable
                onDragStart={() => handleDragStart(task, column.id)}
                className={cn(
                  "cursor-move transition-all duration-200 hover:shadow-md",
                  "hover:scale-[1.02] active:scale-95 active:cursor-grabbing",
                  "animate-in fade-in-0 slide-in-from-bottom-2"
                )}
                style={{
                  animationDelay: `${idx * 50}ms`,
                  animationDuration: '300ms'
                }}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-2 mb-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <p className="text-sm font-medium flex-1">{task.title}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", priorityColors[task.priority])}
                    >
                      {task.priority === 'high' && '🔥'}
                      {task.priority === 'medium' && '⚡'}
                      {task.priority === 'low' && '📋'}
                      {task.priority}
                    </Badge>

                    {task.assignee && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        {task.assignee}
                      </div>
                    )}

                    {task.dueDate && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {task.dueDate}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
