/**
 * THINKING INDICATOR - Visuelt opgraderet
 * Flere varianter: dots, wave, pulse, progress
 */

import { Bot, Sparkles, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export type ThinkingVariant =
  | "dots"
  | "wave"
  | "pulse"
  | "progress"
  | "sparkle";

interface ThinkingIndicatorProps {
  variant?: ThinkingVariant;
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ThinkingIndicator({
  variant = "dots",
  message = "Friday tænker...",
  className,
  size = "md",
}: ThinkingIndicatorProps) {
  const sizeClasses = {
    sm: "gap-1",
    md: "gap-1.5",
    lg: "gap-2",
  };

  const dotSizes = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 animate-in fade-in duration-300",
        className
      )}
    >
      {/* Icon */}
      <div className="relative">
        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
          {variant === "sparkle" ? (
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </div>
        {/* Pulsing ring */}
        <div className="absolute inset-0 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 animate-ping opacity-20" />
      </div>

      {/* Indicator */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {variant === "dots" && <DotsIndicator size={size} />}
          {variant === "wave" && <WaveIndicator size={size} />}
          {variant === "pulse" && <PulseIndicator size={size} />}
          {variant === "progress" && <ProgressIndicator />}
          {variant === "sparkle" && <SparkleIndicator size={size} />}

          <span className="text-sm text-muted-foreground font-medium">
            {message}
          </span>
        </div>
      </div>
    </div>
  );
}

// Dots Indicator (classic)
function DotsIndicator({ size }: { size: "sm" | "md" | "lg" }) {
  const dotSize = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
  }[size];

  return (
    <div className="flex items-center gap-1">
      <span
        className={cn(dotSize, "bg-blue-500 rounded-full animate-bounce")}
        style={{ animationDelay: "0ms" }}
      />
      <span
        className={cn(dotSize, "bg-purple-500 rounded-full animate-bounce")}
        style={{ animationDelay: "150ms" }}
      />
      <span
        className={cn(dotSize, "bg-pink-500 rounded-full animate-bounce")}
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
}

// Wave Indicator
function WaveIndicator({ size }: { size: "sm" | "md" | "lg" }) {
  const barHeights = size === "sm" ? "h-3" : size === "md" ? "h-4" : "h-5";

  return (
    <div className="flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map(i => (
        <div
          key={i}
          className={cn(
            "w-0.5 rounded-full bg-linear-to-t from-blue-500 to-purple-500",
            "animate-pulse",
            barHeights
          )}
          style={{
            animationDelay: `${i * 100}ms`,
            transform: `scaleY(${0.3 + Math.random() * 0.7})`,
          }}
        />
      ))}
    </div>
  );
}

// Pulse Indicator
function PulseIndicator({ size }: { size: "sm" | "md" | "lg" }) {
  const circleSize = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }[size];

  return (
    <div className="relative">
      <div
        className={cn(
          circleSize,
          "rounded-full bg-linear-to-br from-blue-500 to-purple-500 animate-pulse"
        )}
      />
      <div
        className={cn(
          circleSize,
          "absolute inset-0 rounded-full bg-linear-to-br from-blue-500 to-purple-500 animate-ping opacity-30"
        )}
      />
    </div>
  );
}

// Progress Indicator
function ProgressIndicator() {
  return (
    <div className="w-24 h-1 bg-muted rounded-full overflow-hidden">
      <div
        className="h-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse"
        style={{
          animation: "shimmer 2s ease-in-out infinite",
          backgroundSize: "200% 100%",
        }}
      />
    </div>
  );
}

// Sparkle Indicator
function SparkleIndicator({ size }: { size: "sm" | "md" | "lg" }) {
  return (
    <div className="flex items-center gap-1">
      <Sparkles
        className="w-3 h-3 text-blue-500 animate-pulse"
        style={{ animationDelay: "0ms" }}
      />
      <Sparkles
        className="w-4 h-4 text-purple-500 animate-pulse"
        style={{ animationDelay: "200ms" }}
      />
      <Sparkles
        className="w-3 h-3 text-pink-500 animate-pulse"
        style={{ animationDelay: "400ms" }}
      />
    </div>
  );
}

// Shimmer keyframes (add to global CSS if needed)
const shimmerStyles = `
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;
