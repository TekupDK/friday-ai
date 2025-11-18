/**
 * THINKING INDICATOR - AI tænkning og processing status
 */

import { Brain, Zap, Search, CheckCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ThinkingStep {
  id: string;
  label: string;
  status: "pending" | "active" | "completed";
  duration?: number;
}

interface ThinkingIndicatorProps {
  message?: string;
  steps?: ThinkingStep[];
  isActive?: boolean;
  variant?: "simple" | "detailed";
}

export function ThinkingIndicator({
  message = "Friday AI tænker...",
  steps = [],
  isActive = true,
  variant = "simple",
}: ThinkingIndicatorProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    if (!isActive || steps.length === 0) return;

    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isActive, steps.length]);

  if (variant === "simple") {
    return (
      <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Brain className="w-6 h-6 text-blue-600 animate-pulse" />
            <div className="absolute -top-1 -right-1">
              <Zap className="w-3 h-3 text-amber-500 animate-bounce" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {message}
                {dots}
              </p>
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            </div>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className={cn(
                    "h-1 rounded-full transition-all duration-500",
                    isActive ? "bg-blue-600 animate-pulse" : "bg-blue-200",
                    i === 1 && "w-3",
                    i === 2 && "w-4 animation-delay-150",
                    i === 3 && "w-2 animation-delay-300",
                    i === 4 && "w-5 animation-delay-450"
                  )}
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Brain className="w-6 h-6 text-blue-600 animate-pulse" />
        <div>
          <h4 className="font-semibold text-sm">Friday AI Processing</h4>
          <p className="text-xs text-muted-foreground">{message}</p>
        </div>
      </div>

      {steps.length > 0 && (
        <div className="space-y-2 border-t pt-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-2 text-xs transition-opacity",
                step.status === "pending" && "opacity-50",
                step.status === "active" && "opacity-100",
                step.status === "completed" && "opacity-75"
              )}
            >
              {step.status === "completed" && (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              )}
              {step.status === "active" && (
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              )}
              {step.status === "pending" && (
                <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
              )}
              <span
                className={cn(
                  "flex-1",
                  step.status === "active" && "font-medium text-blue-600"
                )}
              >
                {step.label}
              </span>
              {step.duration && step.status === "completed" && (
                <Badge variant="outline" className="text-xs">
                  {step.duration}ms
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
