/**
 * EMAIL THREAD CARD - Opgraderet
 * Gmail integration med AI summary, labels, og actions
 */

import {
  Mail,
  Paperclip,
  Star,
  Archive,
  Trash2,
  Reply,
  Forward,
  ExternalLink,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";


export interface EmailThreadData {
  id: string;
  subject: string;
  from: {
    name: string;
    email: string;
  };
  messageCount: number;
  summary: string;
  aiInsights?: string;
  labels: Array<{ name: string; color: string }>;
  priority: "high" | "medium" | "low";
  hasAttachments?: boolean;
  attachmentCount?: number;
  timestamp: Date;
  isUnread?: boolean;
  isStarred?: boolean;
  snippet?: string;
}

interface EmailThreadCardProps {
  data: EmailThreadData;
  onOpen?: (id: string) => void;
  onReply?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onStar?: (id: string) => void;
}

export function EmailThreadCardUpgraded({
  data,
  onOpen,
  onReply,
  onArchive,
  onDelete,
  onStar,
}: EmailThreadCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [starred, setStarred] = useState(data.isStarred || false);

  const priorityConfig = {
    high: {
      border: "border-l-red-500",
      badge: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400",
      icon: "🔴",
    },
    medium: {
      border: "border-l-yellow-500",
      badge:
        "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400",
      icon: "🟡",
    },
    low: {
      border: "border-l-blue-500",
      badge: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
      icon: "🔵",
    },
  };

  const config = priorityConfig[data.priority];

  const handleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStarred(!starred);
    onStar?.(data.id);
  };

  const handleAction = (action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    action();
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return "Lige nu";
    if (hours < 24) return `${hours}t siden`;
    if (hours < 48) return "I går";
    return date.toLocaleDateString("da-DK", { day: "numeric", month: "short" });
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-l-4 transition-all duration-300",
        "hover:shadow-xl hover:scale-[1.01]",
        "bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm",
        config.border,
        data.isUnread && "bg-blue-50/50 dark:bg-blue-950/20",
        "cursor-pointer"
      )}
      onClick={() => {
        setIsExpanded(!isExpanded);
        onOpen?.(data.id);
      }}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative p-4 space-y-3">
        {/* Header Row */}
        <div className="flex items-start gap-3">
          {/* Email Icon */}
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-md",
              "bg-linear-to-br from-blue-500 to-purple-600",
              "group-hover:scale-110 transition-transform duration-300"
            )}
          >
            <Mail className="w-5 h-5 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <h4
                  className={cn(
                    "font-semibold text-sm truncate",
                    data.isUnread && "font-bold"
                  )}
                >
                  {data.subject}
                </h4>
                {data.messageCount > 1 && (
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {data.messageCount}
                  </Badge>
                )}
              </div>

              {/* Star & Time */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleStar}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Star
                    className={cn(
                      "w-4 h-4 transition-colors",
                      starred
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground hover:text-yellow-400"
                    )}
                  />
                </button>
                <span className="text-xs text-muted-foreground">
                  {formatTime(data.timestamp)}
                </span>
              </div>
            </div>

            {/* From */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <User className="w-3.5 h-3.5" />
              <span className="font-medium">{data.from.name}</span>
              <span className="text-muted-foreground/60">
                &lt;{data.from.email}&gt;
              </span>
            </div>

            {/* Summary */}
            <p className="text-sm text-muted-foreground line-clamp-2">
              {data.summary}
            </p>
          </div>
        </div>

        {/* Labels & Attachments */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority Badge */}
          <Badge className={config.badge}>
            {config.icon}{" "}
            {data.priority === "high"
              ? "Høj"
              : data.priority === "medium"
                ? "Medium"
                : "Lav"}
          </Badge>

          {/* Labels */}
          {data.labels.map((label, idx) => (
            <Badge
              key={idx}
              variant="outline"
              style={{ borderColor: label.color, color: label.color }}
              className="text-xs"
            >
              {label.name}
            </Badge>
          ))}

          {/* Attachments */}
          {data.hasAttachments && (
            <Badge variant="secondary" className="text-xs">
              <Paperclip className="w-3 h-3 mr-1" />
              {data.attachmentCount || 1}
            </Badge>
          )}
        </div>

        {/* AI Insights - Expandable */}
        {data.aiInsights && isExpanded && (
          <div className="pt-3 border-t border-border/50 animate-in slide-in-from-top-2">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-linear-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-200 dark:border-purple-800">
              <div className="w-6 h-6 rounded-full bg-linear-to-br from-purple-500 to-blue-600 flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold mb-1">AI Insights</p>
                <p className="text-xs text-muted-foreground">
                  {data.aiInsights}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions - Show on hover or when expanded */}
        <div
          className={cn(
            "flex items-center gap-2 pt-2 border-t border-border/50",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            isExpanded && "opacity-100"
          )}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAction(() => onReply?.(data.id))}
            className="flex-1"
          >
            <Reply className="w-3.5 h-3.5 mr-1.5" />
            Svar
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleAction(() => onArchive?.(data.id))}
            className="flex-1"
          >
            <Archive className="w-3.5 h-3.5 mr-1.5" />
            Arkiver
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleAction(() => onDelete?.(data.id))}
            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Slet
          </Button>

          <Button variant="ghost" size="icon" className="shrink-0">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
