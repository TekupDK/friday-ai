/**
 * AI Thinking Indicator - Inline component som i Figma
 * Viser pulserende dots og progress bar
 */

import { cn } from "@/lib/utils";

interface AIThinkingProps {
  message?: string;
  className?: string;
}

export function AIThinking({ message = "AI Thinking...", className }: AIThinkingProps) {
  return (
    <div className={cn("flex items-start gap-2 animate-in fade-in duration-300", className)}>
      {/* Pulserende dots */}
      <div className="flex items-center gap-1.5 pt-1">
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
      </div>

      {/* Text */}
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  );
}
