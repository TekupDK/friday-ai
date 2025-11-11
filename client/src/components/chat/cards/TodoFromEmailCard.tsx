/**
 * TODO FROM EMAIL CARD - Oprette todos fra emails
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { CheckSquare, Plus, X, Mail, Calendar } from "lucide-react";
import { useState } from "react";

export interface EmailThread {
  id: string;
  subject: string;
  snippet: string;
}

interface TodoFromEmailCardProps {
  threads: EmailThread[];
  onCreate?: (todo: { name: string; notes: string; threadIds: string[] }) => void;
  onCancel?: () => void;
}

export function TodoFromEmailCard({ 
  threads,
  onCreate,
  onCancel 
}: TodoFromEmailCardProps) {
  const [todoName, setTodoName] = useState("");
  const [todoNotes, setTodoNotes] = useState("");
  const [selectedThreads, setSelectedThreads] = useState<string[]>([]);

  const toggleThread = (threadId: string) => {
    setSelectedThreads(prev => 
      prev.includes(threadId) 
        ? prev.filter(id => id !== threadId)
        : [...prev, threadId]
    );
  };

  const handleCreate = () => {
    if (todoName.trim() && selectedThreads.length > 0) {
      onCreate?.({
        name: todoName.trim(),
        notes: todoNotes.trim(),
        threadIds: selectedThreads
      });
    }
  };

  // Auto-generate todo name from first selected thread
  const autoGenerateName = () => {
    if (selectedThreads.length > 0) {
      const firstThread = threads.find(t => t.id === selectedThreads[0]);
      if (firstThread && !todoName) {
        setTodoName(`Følg op: ${firstThread.subject}`);
      }
    }
  };

  return (
    <Card className="border-l-4 border-l-teal-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold">Add to Todo</h4>
            <p className="text-xs text-muted-foreground">Oprette todos fra emails</p>
          </div>
        </div>

        {/* Todo Details */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Todo Name:</label>
            <Input
              value={todoName}
              onChange={(e) => setTodoName(e.target.value)}
              placeholder="F.eks: Følg op på kunde..."
              className="h-9 mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Notes:</label>
            <Textarea
              value={todoNotes}
              onChange={(e) => setTodoNotes(e.target.value)}
              placeholder="Optional noter..."
              className="min-h-[60px] mt-1"
            />
          </div>
        </div>

        {/* Threads to Add */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-muted-foreground">Threads to add:</label>
            {selectedThreads.length > 0 && (
              <Button size="sm" variant="ghost" onClick={autoGenerateName} className="text-xs">
                Auto-generer navn
              </Button>
            )}
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {threads.map((thread) => (
              <div key={thread.id} className="flex items-start gap-2 p-2 rounded hover:bg-muted/50">
                <Checkbox
                  checked={selectedThreads.includes(thread.id)}
                  onCheckedChange={() => toggleThread(thread.id)}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium truncate">Thread #{thread.id}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{thread.subject}</p>
                  <p className="text-xs text-muted-foreground truncate">{thread.snippet}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 text-xs">
          <span className="font-medium text-teal-700 dark:text-teal-400">
            {selectedThreads.length} tråde valgt
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button 
            onClick={handleCreate} 
            className="flex-1 bg-linear-to-r from-teal-600 to-cyan-600"
            disabled={!todoName.trim() || selectedThreads.length === 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Button>
          <Button onClick={onCancel} variant="outline" className="flex-1">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
}
