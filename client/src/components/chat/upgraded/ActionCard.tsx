/**
 * ACTION CARD - Visuelt opgraderet
 * Universal card for AI actions med moderne glassmorphism
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon, ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";

export interface ActionCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  iconColor: string; // e.g., "from-blue-500 to-purple-600"
  badge?: string;
  timestamp?: Date;
  status?: "success" | "pending" | "error";
  metadata?: Array<{ label: string; value: string; icon?: LucideIcon }>;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: "default" | "outline";
  }>;
  onCardClick?: () => void;
  copyableId?: string;
}

export function ActionCard({
  title,
  description,
  icon: Icon,
  iconColor,
  badge,
  timestamp,
  status = "success",
  metadata = [],
  actions = [],
  onCardClick,
  copyableId,
}: ActionCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (copyableId) {
      await navigator.clipboard.writeText(copyableId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statusStyles = {
    success: "border-l-green-500 bg-green-50/50 dark:bg-green-950/20",
    pending: "border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20",
    error: "border-l-red-500 bg-red-50/50 dark:bg-red-950/20",
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-l-4 transition-all duration-300",
        "hover:shadow-xl hover:scale-[1.02]",
        "backdrop-blur-sm bg-white/90 dark:bg-slate-900/90",
        statusStyles[status],
        onCardClick && "cursor-pointer"
      )}
      onClick={onCardClick}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
              "shadow-lg backdrop-blur-sm",
              "bg-linear-to-br",
              iconColor,
              "group-hover:scale-110 transition-transform duration-300"
            )}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h4 className="font-semibold text-base truncate">{title}</h4>
              {badge && (
                <Badge variant="secondary" className="shrink-0 shadow-sm">
                  {badge}
                </Badge>
              )}
            </div>

            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}
          </div>

          {/* Copy ID Button */}
          {copyableId && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Metadata */}
        {metadata.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {metadata.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                {item.icon && (
                  <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                )}
                <span className="text-muted-foreground">{item.label}:</span>
                <span className="font-medium truncate">{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex gap-2 pt-2 border-t">
            {actions.map((action, idx) => (
              <Button
                key={idx}
                variant={action.variant || "outline"}
                size="sm"
                onClick={e => {
                  e.stopPropagation();
                  action.onClick();
                }}
                className="flex-1"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        {timestamp && (
          <div className="flex justify-end">
            <span className="text-xs text-muted-foreground">
              {timestamp.toLocaleTimeString("da-DK", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
