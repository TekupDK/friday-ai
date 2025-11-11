/**
 * MEMORY MANAGER - ChatGPT-style memory management og project scopes
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Brain, Trash2, Eye, EyeOff, Folder, Lock } from "lucide-react";
import { useState } from "react";

export interface MemoryItem {
  id: string;
  key: string;
  value: string;
  source: 'user' | 'inferred' | 'explicit';
  createdAt: string;
  project?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  memoryCount: number;
  isActive: boolean;
}

interface MemoryManagerProps {
  memories: MemoryItem[];
  projects: Project[];
  memoryEnabled: boolean;
  onToggleMemory?: (enabled: boolean) => void;
  onDeleteMemory?: (id: string) => void;
  onClearMemories?: () => void;
  onSelectProject?: (projectId: string) => void;
  activeProject?: string;
}

export function MemoryManager({
  memories,
  projects,
  memoryEnabled,
  onToggleMemory,
  onDeleteMemory,
  onClearMemories,
  onSelectProject,
  activeProject
}: MemoryManagerProps) {
  const [showMemories, setShowMemories] = useState(false);

  const getSourceBadge = (source: MemoryItem['source']) => {
    switch (source) {
      case 'user':
        return <Badge className="bg-blue-600 text-xs">User</Badge>;
      case 'explicit':
        return <Badge className="bg-emerald-600 text-xs">Explicit</Badge>;
      case 'inferred':
        return <Badge variant="outline" className="text-xs">Inferred</Badge>;
    }
  };

  return (
    <Card className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold">Memory & Context</h3>
        </div>
        <Switch
          checked={memoryEnabled}
          onCheckedChange={onToggleMemory}
        />
      </div>

      {/* Project Scope Selector */}
      {projects.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <Folder className="w-3 h-3" />
            Active Project Scope
          </label>
          <div className="space-y-1">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => onSelectProject?.(project.id)}
                className={cn(
                  "w-full flex items-center justify-between p-2 rounded-lg border transition-colors",
                  activeProject === project.id
                    ? "bg-blue-50 dark:bg-blue-950/20 border-blue-600"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                <div className="text-left">
                  <p className="text-sm font-medium">{project.name}</p>
                  <p className="text-xs text-muted-foreground">{project.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {project.memoryCount} memories
                  </Badge>
                  {activeProject === project.id && (
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Memory Stats */}
      <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600">{memories.length}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">
            {memories.filter(m => m.source === 'user').length}
          </p>
          <p className="text-xs text-muted-foreground">User</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-600">
            {memories.filter(m => m.source === 'inferred').length}
          </p>
          <p className="text-xs text-muted-foreground">Auto</p>
        </div>
      </div>

      {/* Toggle Memories View */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowMemories(!showMemories)}
        className="w-full"
      >
        {showMemories ? (
          <>
            <EyeOff className="w-4 h-4 mr-2" />
            Hide Memories
          </>
        ) : (
          <>
            <Eye className="w-4 h-4 mr-2" />
            View Memories ({memories.length})
          </>
        )}
      </Button>

      {/* Memories List */}
      {showMemories && (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {memories.map((memory) => (
            <div
              key={memory.id}
              className="p-3 rounded-lg border bg-card hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">{memory.key}</p>
                    {getSourceBadge(memory.source)}
                  </div>
                  <p className="text-xs text-muted-foreground">{memory.value}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDeleteMemory?.(memory.id)}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{memory.createdAt}</span>
                {memory.project && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Folder className="w-3 h-3" />
                      {memory.project}
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t">
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          disabled={!memoryEnabled}
        >
          <Lock className="w-4 h-4 mr-2" />
          Temporary Chat
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onClearMemories}
          disabled={memories.length === 0}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear All
        </Button>
      </div>
    </Card>
  );
}
