/**
 * PHASE TRACKER - Pipeline stages og lead progression
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, Circle, ArrowRight } from "lucide-react";

export interface Phase {
  id: string;
  label: string;
  status: 'completed' | 'active' | 'pending';
  date?: string;
  note?: string;
}

interface PhaseTrackerProps {
  phases: Phase[];
  title?: string;
  compact?: boolean;
}

export function PhaseTracker({ phases, title = "Pipeline Status", compact = false }: PhaseTrackerProps) {
  if (compact) {
    return (
      <Card className="p-3">
        <h4 className="text-xs font-semibold mb-3">{title}</h4>
        <div className="flex items-center gap-1">
          {phases.map((phase, index) => (
            <div key={phase.id} className="flex items-center">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all",
                  phase.status === 'completed' && "bg-emerald-600 text-white",
                  phase.status === 'active' && "bg-blue-600 text-white animate-pulse",
                  phase.status === 'pending' && "bg-slate-200 dark:bg-slate-700 text-slate-500"
                )}
              >
                {phase.status === 'completed' ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              {index < phases.length - 1 && (
                <div
                  className={cn(
                    "w-4 h-0.5 transition-colors",
                    phase.status === 'completed' ? "bg-emerald-600" : "bg-slate-200 dark:bg-slate-700"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <Badge variant="outline">
          {phases.filter(p => p.status === 'completed').length} / {phases.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {phases.map((phase, index) => (
          <div key={phase.id} className="relative">
            <div className="flex gap-3">
              {/* Icon */}
              <div className="relative flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all z-10",
                    phase.status === 'completed' && "bg-emerald-600 text-white",
                    phase.status === 'active' && "bg-blue-600 text-white ring-4 ring-blue-200 dark:ring-blue-900",
                    phase.status === 'pending' && "bg-slate-200 dark:bg-slate-700 text-slate-500"
                  )}
                >
                  {phase.status === 'completed' ? (
                    <Check className="w-4 h-4" />
                  ) : phase.status === 'active' ? (
                    <Circle className="w-4 h-4 fill-current" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>
                
                {/* Connector line */}
                {index < phases.length - 1 && (
                  <div
                    className={cn(
                      "w-0.5 h-full absolute top-8 transition-colors",
                      phase.status === 'completed' ? "bg-emerald-600" : "bg-slate-200 dark:bg-slate-700"
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-6">
                <div className="flex items-start justify-between mb-1">
                  <h4
                    className={cn(
                      "font-medium text-sm",
                      phase.status === 'active' && "text-blue-600"
                    )}
                  >
                    {phase.label}
                  </h4>
                  {phase.status === 'completed' && phase.date && (
                    <span className="text-xs text-muted-foreground">{phase.date}</span>
                  )}
                  {phase.status === 'active' && (
                    <Badge className="bg-blue-600">Aktiv</Badge>
                  )}
                </div>
                {phase.note && (
                  <p className="text-xs text-muted-foreground">{phase.note}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="pt-2 border-t">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Fremskridt</span>
          <span>
            {Math.round((phases.filter(p => p.status === 'completed').length / phases.length) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-600 transition-all duration-500"
            style={{
              width: `${(phases.filter(p => p.status === 'completed').length / phases.length) * 100}%`
            }}
          />
        </div>
      </div>
    </Card>
  );
}
