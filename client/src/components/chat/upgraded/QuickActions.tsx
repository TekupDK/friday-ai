/**
 * QUICK ACTIONS - Inline action buttons
 * Vises under AI responses for hurtige handlinger
 */

import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  FileText,
  Mail,
  Phone,
  ExternalLink,
  Copy,
  Check,
  Download,
  Share2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface QuickAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: "default" | "secondary" | "outline" | "ghost";
  gradient?: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
  layout?: "horizontal" | "grid";
  className?: string;
}

export function QuickActions({
  actions,
  layout = "horizontal",
  className,
}: QuickActionsProps) {
  if (actions.length === 0) return null;

  return (
    <div
      className={cn(
        "flex gap-2 flex-wrap animate-in fade-in slide-in-from-bottom-2 duration-300",
        layout === "grid" && "grid grid-cols-2",
        className
      )}
    >
      {actions.map((action, idx) => {
        const Icon = action.icon;

        return (
          <Button
            key={idx}
            variant={action.variant || "outline"}
            size="sm"
            onClick={action.onClick}
            className={cn(
              "group relative overflow-hidden transition-all duration-200",
              "hover:scale-105 hover:shadow-md",
              action.gradient && "border-0 text-white"
            )}
          >
            {/* Gradient Background */}
            {action.gradient && (
              <div
                className={cn(
                  "absolute inset-0 bg-linear-to-r opacity-90 group-hover:opacity-100 transition-opacity",
                  action.gradient
                )}
              />
            )}

            <div className="relative flex items-center gap-2">
              <Icon className="w-4 h-4" />
              <span>{action.label}</span>
            </div>
          </Button>
        );
      })}
    </div>
  );
}

// Preset quick actions for common scenarios
export const presetActions = {
  calendar: (onClick: () => void): QuickAction => ({
    label: "Book møde",
    icon: Calendar,
    onClick,
    gradient: "from-purple-500 to-indigo-600",
  }),

  invoice: (onClick: () => void): QuickAction => ({
    label: "Send tilbud",
    icon: FileText,
    onClick,
    gradient: "from-yellow-500 to-orange-600",
  }),

  email: (onClick: () => void): QuickAction => ({
    label: "Send email",
    icon: Mail,
    onClick,
    gradient: "from-blue-500 to-cyan-600",
  }),

  call: (onClick: () => void): QuickAction => ({
    label: "Ring op",
    icon: Phone,
    onClick,
    gradient: "from-green-500 to-emerald-600",
  }),

  copy: (onClick: () => void, copied = false): QuickAction => ({
    label: copied ? "Kopieret!" : "Kopier",
    icon: copied ? Check : Copy,
    onClick,
    variant: "outline",
  }),

  download: (onClick: () => void): QuickAction => ({
    label: "Download",
    icon: Download,
    onClick,
    variant: "outline",
  }),

  share: (onClick: () => void): QuickAction => ({
    label: "Del",
    icon: Share2,
    onClick,
    variant: "outline",
  }),

  open: (onClick: () => void): QuickAction => ({
    label: "Åbn",
    icon: ExternalLink,
    onClick,
    variant: "outline",
  }),
};
