/**
 * LABEL MANAGEMENT CARD - Organisere emails med labels
 */

import { Tag, Plus, X, Mail, FolderOpen } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface EmailThread {
  id: string;
  subject: string;
  labels: string[];
}

interface LabelManagementCardProps {
  threads: EmailThread[];
  availableLabels: string[];
  onApplyLabels?: (threadIds: string[], labels: string[]) => void;
  onCancel?: () => void;
}

export function LabelManagementCard({
  threads,
  availableLabels,
  onApplyLabels,
  onCancel,
}: LabelManagementCardProps) {
  const [selectedThreads, setSelectedThreads] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [newLabel, setNewLabel] = useState("");

  const toggleThread = (threadId: string) => {
    setSelectedThreads(prev =>
      prev.includes(threadId)
        ? prev.filter(id => id !== threadId)
        : [...prev, threadId]
    );
  };

  const toggleLabel = (label: string) => {
    setSelectedLabels(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const addNewLabel = () => {
    if (newLabel.trim() && !availableLabels.includes(newLabel.trim())) {
      // In real app, would add to available labels
      toggleLabel(newLabel.trim());
      setNewLabel("");
    }
  };

  const handleApply = () => {
    if (selectedThreads.length > 0 && selectedLabels.length > 0) {
      onApplyLabels?.(selectedThreads, selectedLabels);
    }
  };

  return (
    <Card className="border-l-4 border-l-orange-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-md">
            <Tag className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold">
              Add Label: {selectedLabels[0] || "..."}
            </h4>
            <p className="text-xs text-muted-foreground">Organisere emails</p>
          </div>
        </div>

        {/* Threads Selection */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Vælg tråde:
          </p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {threads.map(thread => (
              <div
                key={thread.id}
                className="flex items-center gap-2 p-2 rounded hover:bg-muted/50"
              >
                <Checkbox
                  checked={selectedThreads.includes(thread.id)}
                  onCheckedChange={() => toggleThread(thread.id)}
                />
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm flex-1 truncate">
                  {thread.subject}
                </span>
                <div className="flex gap-1">
                  {thread.labels.map(label => (
                    <Badge key={label} variant="secondary" className="text-xs">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Labels Selection */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Vælg labels:
          </p>
          <div className="flex flex-wrap gap-2">
            {availableLabels.map(label => (
              <button
                key={label}
                onClick={() => toggleLabel(label)}
                className={cn(
                  "px-2 py-1 rounded-full text-xs border transition-colors",
                  selectedLabels.includes(label)
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-background border-border hover:bg-muted"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Add New Label */}
          <div className="flex gap-2">
            <Input
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              placeholder="Ny label..."
              className="h-8 text-sm"
            />
            <Button size="sm" variant="outline" onClick={addNewLabel}>
              <Plus className="w-3 h-3 mr-1" />
              Tilføj
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="p-2 rounded-lg bg-muted/50 text-xs">
          <span className="font-medium">
            {selectedThreads.length} tråde valgt
          </span>
          {selectedLabels.length > 0 && (
            <span className="ml-2">→ {selectedLabels.join(", ")}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            onClick={handleApply}
            className="flex-1 bg-linear-to-r from-orange-600 to-red-600"
            disabled={
              selectedThreads.length === 0 || selectedLabels.length === 0
            }
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Apply to {selectedThreads.length}
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
