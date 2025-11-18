/**
 * TYPING INDICATOR - "Friday skriver..."
 * Animeret typing indicator med varianter
 */

import { Bot, User } from "lucide-react";

import { cn } from "@/lib/utils";

export type TypingVariant = "dots" | "ellipsis" | "pulse" | "wave";

interface TypingIndicatorProps {
  name?: string;
  avatar?: "ai" | "user" | "none";
  variant?: TypingVariant;
  className?: string;
}

export function TypingIndicator({
  name = "Friday",
  avatar = "ai",
  variant = "dots",
  className,
}: TypingIndicatorProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2",
        className
      )}
    >
      {/* Avatar */}
      {avatar !== "none" && (
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-md",
            avatar === "ai" && "bg-linear-to-br from-blue-500 to-purple-600",
            avatar === "user" && "bg-gray-600"
          )}
        >
          {avatar === "ai" ? (
            <Bot className="w-5 h-5 text-white" />
          ) : (
            <User className="w-5 h-5 text-white" />
          )}
        </div>
      )}

      {/* Typing Animation */}
      <div className="px-4 py-3 rounded-2xl bg-muted border border-border shadow-sm">
        <div className="flex items-center gap-2">
          {variant === "dots" && <DotsAnimation />}
          {variant === "ellipsis" && <EllipsisAnimation name={name} />}
          {variant === "pulse" && <PulseAnimation name={name} />}
          {variant === "wave" && <WaveAnimation />}
        </div>
      </div>
    </div>
  );
}

function DotsAnimation() {
  return (
    <div className="flex items-center gap-1">
      <div
        className="w-2 h-2 bg-primary rounded-full animate-bounce"
        style={{ animationDelay: "0ms" }}
      />
      <div
        className="w-2 h-2 bg-primary rounded-full animate-bounce"
        style={{ animationDelay: "150ms" }}
      />
      <div
        className="w-2 h-2 bg-primary rounded-full animate-bounce"
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
}

function EllipsisAnimation({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{name} skriver</span>
      <div className="flex gap-1">
        <span className="animate-pulse">.</span>
        <span className="animate-pulse" style={{ animationDelay: "200ms" }}>
          .
        </span>
        <span className="animate-pulse" style={{ animationDelay: "400ms" }}>
          .
        </span>
      </div>
    </div>
  );
}

function PulseAnimation({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
      <span className="text-sm text-muted-foreground">{name} skriver...</span>
    </div>
  );
}

function WaveAnimation() {
  return (
    <div className="flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map(i => (
        <div
          key={i}
          className="w-1 bg-primary rounded-full animate-pulse"
          style={{
            height: `${8 + Math.random() * 8}px`,
            animationDelay: `${i * 100}ms`,
          }}
        />
      ))}
    </div>
  );
}
