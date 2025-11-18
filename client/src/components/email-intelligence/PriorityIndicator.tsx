/**
 * PriorityIndicator - Display email priority level
 */

import { AlertTriangle, ArrowUp, Minus, ArrowDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";

interface PriorityIndicatorProps {
  level: "urgent" | "high" | "normal" | "low";
  score?: number;
  reasoning?: string | null;
  className?: string;
}

const PRIORITY_CONFIG = {
  urgent: {
    label: "Urgent",
    icon: AlertTriangle,
    className: "bg-red-500 text-white hover:bg-red-600",
  },
  high: {
    label: "Høj",
    icon: ArrowUp,
    className: "bg-orange-500 text-white hover:bg-orange-600",
  },
  normal: {
    label: "Normal",
    icon: Minus,
    className: "bg-blue-500 text-white hover:bg-blue-600",
  },
  low: {
    label: "Lav",
    icon: ArrowDown,
    className: "bg-gray-400 text-white hover:bg-gray-500",
  },
};

export function PriorityIndicator({
  level,
  score,
  reasoning,
  className = "",
}: PriorityIndicatorProps) {
  const config = PRIORITY_CONFIG[level];
  const Icon = config.icon;

  const title = reasoning
    ? `${config.label} prioritet${score ? ` (${score}/100)` : ""}\n${reasoning}`
    : `${config.label} prioritet${score ? ` (${score}/100)` : ""}`;

  return (
    <Badge
      variant="default"
      className={`${config.className} ${className} flex items-center gap-1`}
      title={title}
    >
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
      {score !== undefined && (
        <span className="text-xs opacity-90">{score}</span>
      )}
    </Badge>
  );
}
