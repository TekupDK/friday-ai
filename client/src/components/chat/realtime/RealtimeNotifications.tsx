/**
 * REALTIME NOTIFICATIONS - Live notifikationer
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Bell, BellRing, MessageSquare, Users, FileText, Calendar, Check, X, Settings, Zap } from "lucide-react";
import { useState, useEffect } from "react";

export interface NotificationItem {
  id: string;
  type: 'message' | 'mention' | 'document' | 'calendar' | 'system' | 'collaboration';
  title: string;
  message: string;
  sender?: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  actionable?: boolean;
  actions?: Array<{
    label: string;
    action: string;
  }>;
}

interface RealtimeNotificationsProps {
  notifications?: NotificationItem[];
  onMarkAsRead?: (notificationId: string) => void;
  onAction?: (notificationId: string, action: string) => void;
  onClearAll?: () => void;
  onSettings?: () => void;
}

export function RealtimeNotifications({ 
  notifications = [],
  onMarkAsRead,
  onAction,
  onClearAll,
  onSettings 
}: RealtimeNotificationsProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Default notifications
  const defaultNotifications: NotificationItem[] = [
    {
      id: '1',
      type: 'message',
      title: 'Ny besked fra Sarah',
      message: 'Kan du gennemgå fakturaen for ABC Corp?',
      sender: 'Sarah Johnson',
      timestamp: 'lige nu',
      priority: 'medium',
      read: false,
      actionable: true,
      actions: [
        { label: 'Svar', action: 'reply' },
        { label: 'Arkivér', action: 'archive' }
      ]
    },
    {
      id: '2',
      type: 'mention',
      title: 'Du blev mentionet',
      message: '@john kan du hjælpe med kunde support?',
      sender: 'Mike Wilson',
      timestamp: 'for 2 min siden',
      priority: 'high',
      read: false,
      actionable: true,
      actions: [
        { label: 'Se besked', action: 'view' },
        { label: 'Svar', action: 'reply' }
      ]
    },
    {
      id: '3',
      type: 'collaboration',
      title: 'Live redigering',
      message: 'Emma redigerer "Faktura - ABC Corporation"',
      sender: 'Emma Davis',
      timestamp: 'for 5 min siden',
      priority: 'medium',
      read: false,
      actionable: true,
      actions: [
        { label: 'Join', action: 'join' },
        { label: 'Se', action: 'view' }
      ]
    },
    {
      id: '4',
      type: 'document',
      title: 'Dokument opdateret',
      message: 'Møde referat Q1 er blevet opdateret',
      sender: 'System',
      timestamp: 'for 15 min siden',
      priority: 'low',
      read: true,
      actionable: true,
      actions: [
        { label: 'Åbn', action: 'open' }
      ]
    },
    {
      id: '5',
      type: 'calendar',
      title: 'Møde påmindelse',
      message: 'Team møde starter om 30 minutter',
      sender: 'Kalender',
      timestamp: 'for 30 min siden',
      priority: 'high',
      read: false,
      actionable: true,
      actions: [
        { label: 'Join', action: 'join' },
        { label: 'Udsæt', action: 'postpone' }
      ]
    },
    {
      id: '6',
      type: 'system',
      title: 'System opdatering',
      message: 'Ny version 2.1.0 er tilgængelig',
      sender: 'System',
      timestamp: 'for 1 time siden',
      priority: 'low',
      read: true,
      actionable: false
    }
  ];

  const allNotifications = notifications.length > 0 ? notifications : defaultNotifications;

  const unreadCount = allNotifications.filter(n => !n.read).length;
  const urgentCount = allNotifications.filter(n => n.priority === 'urgent' && !n.read).length;

  const filteredNotifications = allNotifications.filter(notification => {
    if (showUnreadOnly && notification.read) return false;
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !notification.read;
    return notification.type === activeFilter;
  });

  const handleMarkAsRead = (notificationId: string) => {
    onMarkAsRead?.(notificationId);
  };

  const handleAction = (notificationId: string, action: string) => {
    onAction?.(notificationId, action);
    handleMarkAsRead(notificationId);
  };

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'message': return MessageSquare;
      case 'mention': return Bell;
      case 'document': return FileText;
      case 'calendar': return Calendar;
      case 'system': return Settings;
      case 'collaboration': return Users;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: NotificationItem['type']) => {
    switch (type) {
      case 'message': return 'bg-blue-500';
      case 'mention': return 'bg-purple-500';
      case 'document': return 'bg-green-500';
      case 'calendar': return 'bg-orange-500';
      case 'system': return 'bg-gray-500';
      case 'collaboration': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: NotificationItem['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityLabel = (priority: NotificationItem['priority']) => {
    switch (priority) {
      case 'urgent': return 'Akut';
      case 'high': return 'Høj';
      case 'medium': return 'Medium';
      case 'low': return 'Lav';
      default: return priority;
    }
  };

  const notificationTypes = [
    { id: 'all', label: 'Alle', count: allNotifications.length },
    { id: 'unread', label: 'Ulæst', count: unreadCount },
    { id: 'message', label: 'Beskeder', count: allNotifications.filter(n => n.type === 'message').length },
    { id: 'mention', label: 'Mentions', count: allNotifications.filter(n => n.type === 'mention').length },
    { id: 'collaboration', label: 'Samarbejde', count: allNotifications.filter(n => n.type === 'collaboration').length }
  ];

  return (
    <Card className="border-l-4 border-l-red-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-md">
              {unreadCount > 0 ? <BellRing className="w-5 h-5 text-white" /> : <Bell className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h4 className="font-semibold">Realtime Notifications</h4>
              <p className="text-xs text-muted-foreground">Live notifikationer</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge className="bg-red-500">{unreadCount} nye</Badge>
            )}
            {urgentCount > 0 && (
              <Badge className="bg-red-600">{urgentCount} akutte</Badge>
            )}
            <Button size="sm" variant="ghost" onClick={onSettings}>
              <Settings className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="space-y-2">
          <div className="flex gap-1 p-1 rounded-lg bg-muted">
            {notificationTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setActiveFilter(type.id)}
                className={cn(
                  "flex-1 px-2 py-1 rounded-md text-xs font-medium transition-colors",
                  activeFilter === type.id
                    ? "bg-background shadow-sm"
                    : "hover:bg-background/50"
                )}
              >
                {type.label} ({type.count})
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="unread-only"
              checked={showUnreadOnly}
              onChange={(e) => setShowUnreadOnly(e.target.checked)}
              className="h-3 w-3"
            />
            <label htmlFor="unread-only" className="text-xs text-muted-foreground">
              Vis kun ulæste
            </label>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h5 className="text-sm font-semibold">
              Notifikationer ({filteredNotifications.length}):
            </h5>
            {unreadCount > 0 && (
              <Button size="sm" variant="ghost" onClick={onClearAll}>
                Markér alle som læst
              </Button>
            )}
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-3 rounded-lg border transition-colors",
                      !notification.read
                        ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                        : "bg-background border-border"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white", getNotificationColor(notification.type))}>
                        <Icon className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{notification.title}</span>
                              <Badge className={getPriorityColor(notification.priority)}>
                                {getPriorityLabel(notification.priority)}
                              </Badge>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-red-500 rounded-full" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">{notification.message}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {notification.sender && <span>{notification.sender}</span>}
                              <span>•</span>
                              <span>{notification.timestamp}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        {notification.actionable && notification.actions && (
                          <div className="flex gap-1 mt-2">
                            {notification.actions.map((action, index) => (
                              <Button
                                key={index}
                                size="sm"
                                variant="outline"
                                onClick={() => handleAction(notification.id, action.action)}
                                className="h-7 px-2 text-xs"
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Mark as read */}
                      {!notification.read && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="h-6 w-6"
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Ingen notifikationer</p>
                <p className="text-xs">Du er helt opdateret!</p>
              </div>
            )}
          </div>
        </div>

        {/* Notification Stats */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20 text-center">
            <p className="font-bold text-red-700 dark:text-red-300">
              {unreadCount}
            </p>
            <p className="text-red-600 dark:text-red-400">Ulæst</p>
          </div>
          <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-center">
            <p className="font-bold text-orange-700 dark:text-orange-300">
              {allNotifications.filter(n => n.priority === 'high').length}
            </p>
            <p className="text-orange-600 dark:text-orange-400">Høj prioritet</p>
          </div>
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-center">
            <p className="font-bold text-blue-700 dark:text-blue-300">
              {allNotifications.filter(n => n.actionable).length}
            </p>
            <p className="text-blue-600 dark:text-blue-400">Handlinger</p>
          </div>
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20 text-center">
            <p className="font-bold text-green-700 dark:text-green-300">
              {allNotifications.filter(n => n.read).length}
            </p>
            <p className="text-green-600 dark:text-green-400">Læst</p>
          </div>
        </div>

        {/* Live Indicator */}
        <div className="p-2 rounded-lg bg-linear-to-r from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 border border-red-300 dark:border-red-700">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs text-red-700 dark:text-red-400">
              Live notifikationer aktive • Opdateres i real-time
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button onClick={onClearAll} variant="outline" className="flex-1">
            <Check className="w-4 h-4 mr-2" />
            Markér alle læst
          </Button>
          <Button onClick={onSettings} variant="outline" className="flex-1">
            <Settings className="w-4 h-4 mr-2" />
            Indstillinger
          </Button>
          <Button className="flex-1 bg-linear-to-r from-red-600 to-orange-600">
            <Zap className="w-4 h-4 mr-2" />
            Test notifikation
          </Button>
        </div>
      </div>
    </Card>
  );
}
