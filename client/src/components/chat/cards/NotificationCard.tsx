/**
 * NOTIFICATION CARD - Notifikation kort
 */

import { Bell, Check, X, Info, AlertCircle } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";


export interface NotificationCardProps {
  notification?: {
    id: string;
    type: "info" | "warning" | "success" | "error";
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    actionLabel?: string;
  };
  onAction?: () => void;
  onDismiss?: () => void;
}

export function NotificationCard({
  notification = {
    id: "1",
    type: "info",
    title: "Ny opgave tildelt",
    message: 'Du er blevet tildelt opgaven "Opdater kundedata"',
    timestamp: "for 10 minutter siden",
    read: false,
    actionLabel: "Se opgave",
  },
  onAction,
  onDismiss,
}: NotificationCardProps) {
  const [isRead, setIsRead] = useState(notification.read);

  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return <Check className="w-5 h-5 text-white" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-white" />;
      case "error":
        return <X className="w-5 h-5 text-white" />;
      default:
        return <Info className="w-5 h-5 text-white" />;
    }
  };

  const getColor = () => {
    switch (notification.type) {
      case "success":
        return "bg-emerald-600";
      case "warning":
        return "bg-amber-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <Card
      className={cn(
        "border-l-4 transition-all",
        !isRead ? "bg-blue-50 dark:bg-blue-950/20" : "",
        notification.type === "success" && "border-l-green-500",
        notification.type === "warning" && "border-l-yellow-500",
        notification.type === "error" && "border-l-red-500",
        notification.type === "info" && "border-l-blue-500"
      )}
    >
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                getColor()
              )}
            >
              {getIcon()}
            </div>
            <div>
              <h4 className="font-semibold">{notification.title}</h4>
              <span className="text-xs text-muted-foreground">
                {notification.timestamp}
              </span>
            </div>
          </div>
          {!isRead && <Badge className="bg-blue-500">Ny</Badge>}
        </div>

        <p className="text-sm text-muted-foreground">{notification.message}</p>

        <div className="flex gap-2 pt-2">
          {notification.actionLabel && (
            <Button
              size="sm"
              onClick={() => {
                setIsRead(true);
                onAction?.();
              }}
            >
              {notification.actionLabel}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setIsRead(true);
              onDismiss?.();
            }}
          >
            Afvis
          </Button>
        </div>
      </div>
    </Card>
  );
}
