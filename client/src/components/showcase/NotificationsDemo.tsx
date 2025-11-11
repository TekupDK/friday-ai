import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  Mail, 
  Calendar, 
  DollarSign, 
  Users, 
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: 'email' | 'calendar' | 'invoice' | 'lead' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority?: 'low' | 'medium' | 'high';
}

const notifications: Notification[] = [
  {
    id: '1',
    type: 'email',
    title: 'Ny email fra kunde',
    message: 'Hans Jensen har sendt en forespørgsel om vinduespudsning',
    timestamp: '2 min siden',
    read: false,
    priority: 'high'
  },
  {
    id: '2',
    type: 'calendar',
    title: 'Møde om 30 minutter',
    message: 'Team standup meeting starter snart',
    timestamp: '28 min siden',
    read: false,
    priority: 'medium'
  },
  {
    id: '3',
    type: 'invoice',
    title: 'Faktura betalt',
    message: 'Kunde #1234 har betalt faktura på 5.600 kr.',
    timestamp: '1 time siden',
    read: true,
    priority: 'low'
  },
  {
    id: '4',
    type: 'lead',
    title: 'Nyt lead fra rengoring.nu',
    message: 'Potentiel kunde søger flytning assistance i København',
    timestamp: '2 timer siden',
    read: false,
    priority: 'high'
  },
  {
    id: '5',
    type: 'system',
    title: 'Friday AI opdatering',
    message: 'Ny AI model tilgængelig: Claude 3.5 Sonnet',
    timestamp: '3 timer siden',
    read: true,
    priority: 'low'
  },
  {
    id: '6',
    type: 'email',
    title: 'Påmindelse: Ubesvaret email',
    message: 'Du har en ubesvaret email fra Maria Nielsen',
    timestamp: '5 timer siden',
    read: true,
    priority: 'medium'
  }
];

const iconMap = {
  email: Mail,
  calendar: Calendar,
  invoice: DollarSign,
  lead: Users,
  system: Bell
};

const priorityColor = {
  low: 'text-muted-foreground',
  medium: 'text-orange-500',
  high: 'text-red-500'
};

export function NotificationsDemo() {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card className="w-full max-w-md">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          <h3 className="font-semibold">Notifikationer</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm">
          <CheckCircle className="w-4 h-4 mr-1" />
          Marker alle som læst
        </Button>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="divide-y">
          {notifications.map((notif) => {
            const Icon = iconMap[notif.type];
            
            return (
              <div
                key={notif.id}
                className={cn(
                  "p-4 hover:bg-accent/50 transition-colors cursor-pointer",
                  !notif.read && "bg-accent/30"
                )}
              >
                <div className="flex gap-3">
                  <div className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                    notif.read ? "bg-muted" : "bg-primary/10"
                  )}>
                    <Icon className={cn(
                      "w-5 h-5",
                      notif.read ? "text-muted-foreground" : "text-primary"
                    )} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className={cn(
                        "text-sm font-medium",
                        !notif.read && "font-semibold"
                      )}>
                        {notif.title}
                      </p>
                      {notif.priority && (
                        <AlertCircle className={cn(
                          "w-4 h-4 flex-shrink-0",
                          priorityColor[notif.priority]
                        )} />
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {notif.message}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {notif.timestamp}
                    </div>
                  </div>

                  {!notif.read && (
                    <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <Button variant="outline" className="w-full" size="sm">
          Se alle notifikationer
        </Button>
      </div>
    </Card>
  );
}
