/**
 * Tool Execution Box - Inline component som i Figma
 * Viser tool execution med emoji, text og progress bar
 */

import { cn } from "@/lib/utils";

export interface ToolExecutionBoxProps {
  emoji: string;
  message: string;
  progress: number; // 0-100
  status?: "running" | "completed" | "failed";
  className?: string;
}

export function ToolExecutionBox({
  emoji,
  message,
  progress,
  status = "running",
  className,
}: ToolExecutionBoxProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl transition-all duration-300",
        "bg-blue-50/80 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50",
        "animate-in fade-in slide-in-from-bottom-2",
        status === "completed" &&
          "bg-green-50/80 dark:bg-green-950/30 border-green-100 dark:border-green-900/50",
        status === "failed" &&
          "bg-red-50/80 dark:bg-red-950/30 border-red-100 dark:border-red-900/50",
        className
      )}
    >
      {/* Emoji icon */}
      <div className="text-2xl shrink-0">{emoji}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground mb-2">{message}</p>

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-blue-200/50 dark:bg-blue-900/30 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500 ease-out rounded-full",
                status === "completed"
                  ? "bg-green-500"
                  : status === "failed"
                    ? "bg-red-500"
                    : "bg-blue-500"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground min-w-[35px] text-right">
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
}
