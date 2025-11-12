import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  BellRing,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Check,
  Clock,
  User,
  Mail,
  Calendar,
  CreditCard,
  Zap,
  MessageSquare,
  Settings,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { da } from "date-fns/locale";

export interface NotificationItem {
  id: string;
  type: "success" | "error" | "warning" | "info" | "system";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority?: "low" | "medium" | "high" | "urgent";
  category?:
    | "message"
    | "booking"
    | "payment"
    | "system"
    | "reminder"
    | "alert";
  actionLabel?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
  dismissible?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

interface NotificationSystemProps extends React.HTMLAttributes<HTMLDivElement> {
  notifications: NotificationItem[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDismiss?: (id: string) => void;
  onAction?: (notification: NotificationItem) => void;
  onClearAll?: () => void;
  maxVisible?: number;
  showUnreadBadge?: boolean;
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "center";
  variant?: "dropdown" | "panel" | "toast";
  className?: string;
}

const notificationIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  system: Settings,
};

const notificationColors = {
  success: "text-green-600 bg-green-50 border-green-200",
  error: "text-red-600 bg-red-50 border-red-200",
  warning: "text-amber-600 bg-amber-50 border-amber-200",
  info: "text-blue-600 bg-blue-50 border-blue-200",
  system: "text-purple-600 bg-purple-50 border-purple-200",
};

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

const categoryIcons = {
  message: MessageSquare,
  booking: Calendar,
  payment: CreditCard,
  system: Settings,
  reminder: Clock,
  alert: AlertTriangle,
};

export function NotificationSystem({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  onAction,
  onClearAll,
  maxVisible = 5,
  showUnreadBadge = true,
  position = "top-right",
  variant = "dropdown",
  className,
  ...props
}: NotificationSystemProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [filter, setFilter] = React.useState<"all" | "unread">("all");

  const unreadCount = notifications.filter(n => !n.read).length;
  const visibleNotifications = notifications
    .filter(n => filter === "all" || !n.read)
    .slice(0, maxVisible);

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    if (notification.actionUrl && onAction) {
      onAction(notification);
    }
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    return (
      <Badge
        variant="outline"
        className={cn(
          "text-xs",
          priorityColors[priority as keyof typeof priorityColors]
        )}
      >
        {priority.toUpperCase()}
      </Badge>
    );
  };

  if (variant === "toast") {
    return (
      <div
        className={cn(
          "fixed z-50 space-y-2",
          {
            "top-4 right-4": position === "top-right",
            "top-4 left-4": position === "top-left",
            "bottom-4 right-4": position === "bottom-right",
            "bottom-4 left-4": position === "bottom-left",
            "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2":
              position === "center",
          },
          className
        )}
        {...props}
      >
        {visibleNotifications.map(notification => {
          const Icon = notificationIcons[notification.type];
          const CategoryIcon = notification.category
            ? categoryIcons[notification.category]
            : null;

          return (
            <div
              key={notification.id}
              className={cn(
                "flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-md animate-in slide-in-from-right-2",
                notificationColors[notification.type],
                !notification.read && "border-l-4"
              )}
            >
              <Icon className="w-5 h-5 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm truncate">
                    {notification.title}
                  </h4>
                  {notification.category && CategoryIcon && (
                    <CategoryIcon className="w-3 h-3 opacity-60" />
                  )}
                </div>
                <p className="text-sm opacity-90 mb-2">
                  {notification.message}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs opacity-70">
                    {formatDistanceToNow(new Date(notification.timestamp), {
                      addSuffix: true,
                      locale: da,
                    })}
                  </span>
                  {notification.actionLabel && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-xs"
                      onClick={() => onAction?.(notification)}
                    >
                      {notification.actionLabel}
                    </Button>
                  )}
                </div>
              </div>
              {notification.dismissible !== false && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-black/10"
                  onClick={() => onDismiss?.(notification.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)} {...props}>
      {/* Notification Bell */}
      <Button
        variant="outline"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        {unreadCount > 0 ? (
          <BellRing className="w-4 h-4" />
        ) : (
          <Bell className="w-4 h-4" />
        )}
        {showUnreadBadge && unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-500">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-background border border-border rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold">Notifikationer</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilter(filter === "all" ? "unread" : "all")}
              >
                {filter === "all" ? "Vis ulæste" : "Vis alle"}
              </Button>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
                  Markér alle som læst
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-border">
            <Button
              variant={filter === "all" ? "default" : "ghost"}
              size="sm"
              className="flex-1 rounded-none border-r border-border"
              onClick={() => setFilter("all")}
            >
              Alle ({notifications.length})
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "ghost"}
              size="sm"
              className="flex-1 rounded-none"
              onClick={() => setFilter("unread")}
            >
              Ulæste ({unreadCount})
            </Button>
          </div>

          {/* Notifications List */}
          <ScrollArea className="max-h-96">
            {visibleNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  {filter === "unread"
                    ? "Ingen ulæste notifikationer"
                    : "Ingen notifikationer"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {visibleNotifications.map(notification => {
                  const Icon = notificationIcons[notification.type];
                  const CategoryIcon = notification.category
                    ? categoryIcons[notification.category]
                    : null;

                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 hover:bg-accent/50 cursor-pointer transition-colors",
                        !notification.read &&
                          "bg-blue-50/30 border-l-4 border-l-blue-500"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="w-5 h-5 mt-0.5 shrink-0 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">
                              {notification.title}
                            </h4>
                            {notification.category && CategoryIcon && (
                              <CategoryIcon className="w-3 h-3 opacity-60" />
                            )}
                            {getPriorityBadge(notification.priority)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(
                                new Date(notification.timestamp),
                                {
                                  addSuffix: true,
                                  locale: da,
                                }
                              )}
                            </span>
                            {notification.actionLabel && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 px-2 text-xs"
                                onClick={e => {
                                  e.stopPropagation();
                                  onAction?.(notification);
                                }}
                              >
                                {notification.actionLabel}
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                          {notification.dismissible !== false && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                              onClick={e => {
                                e.stopPropagation();
                                onDismiss?.(notification.id);
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {notifications.length > maxVisible && (
            <div className="p-3 border-t border-border bg-muted/30">
              <p className="text-xs text-center text-muted-foreground">
                Viser {visibleNotifications.length} af {notifications.length}{" "}
                notifikationer
              </p>
            </div>
          )}

          {notifications.length > 0 && (
            <div className="p-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={onClearAll}
              >
                Ryd alle notifikationer
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
