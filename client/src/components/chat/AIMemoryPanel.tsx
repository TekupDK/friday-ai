/**
 * AI Memory Panel - Timeline af Friday AI's actions
 * Viser historik over leads, tasks, meetings, invoices m.m.
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar, 
  UserPlus, 
  CheckCircle2, 
  FileText, 
  Mail,
  Sun,
  Clock,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AIMemoryItem {
  id: string;
  type: 'lead' | 'task' | 'meeting' | 'invoice' | 'email' | 'info';
  title: string;
  subtitle?: string;
  timestamp: Date;
  messageId?: string; // Reference til original chat message
}

interface AIMemoryPanelProps {
  items: AIMemoryItem[];
  onItemClick?: (item: AIMemoryItem) => void;
  className?: string;
}

const MEMORY_ICONS = {
  lead: UserPlus,
  task: CheckCircle2,
  meeting: Calendar,
  invoice: FileText,
  email: Mail,
  info: Sun,
} as const;

const MEMORY_COLORS = {
  lead: 'text-green-600 bg-green-100',
  task: 'text-blue-600 bg-blue-100',
  meeting: 'text-purple-600 bg-purple-100',
  invoice: 'text-yellow-600 bg-yellow-100',
  email: 'text-gray-600 bg-gray-100',
  info: 'text-orange-600 bg-orange-100',
} as const;

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Lige nu';
  if (diffMins < 60) return `${diffMins} min siden`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'time' : 'timer'} siden`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'dag' : 'dage'} siden`;
  
  return date.toLocaleDateString('da-DK', { 
    day: 'numeric', 
    month: 'short' 
  });
}

function MemoryItemComponent({ 
  item, 
  onClick 
}: { 
  item: AIMemoryItem; 
  onClick?: () => void;
}) {
  const Icon = MEMORY_ICONS[item.type];
  const colorClass = MEMORY_COLORS[item.type];

  return (
    <div 
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg transition-all border border-transparent",
        onClick && "cursor-pointer hover:bg-muted/50 hover:border-primary/20 hover:shadow-sm"
      )}
      onClick={onClick}
    >
      {/* Icon */}
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm", colorClass)}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold truncate">{item.title}</p>
          <span className="text-xs text-muted-foreground ml-2 shrink-0">{getRelativeTime(item.timestamp)}</span>
        </div>
        {item.subtitle && (
          <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
        )}
      </div>
    </div>
  );
}

export function AIMemoryPanel({ 
  items, 
  onItemClick,
  className 
}: AIMemoryPanelProps) {
  // Group items by date
  const groupedItems = items.reduce((acc, item) => {
    const dateKey = item.timestamp.toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(item);
    return acc;
  }, {} as Record<string, AIMemoryItem[]>);

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const getDateLabel = (dateKey: string): string => {
    if (dateKey === today) return 'I dag';
    if (dateKey === yesterday) return 'I går';
    return new Date(dateKey).toLocaleDateString('da-DK', { 
      day: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <Card className={cn("border-t", className)}>
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">AI Memory</h3>
          <Badge variant="secondary" className="ml-auto">
            {items.length}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Seneste handlinger fra Friday
        </p>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                Ingen handlinger endnu
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Friday vil huske dine seneste actions her
              </p>
            </div>
          ) : (
            Object.entries(groupedItems).map(([dateKey, dateItems]) => (
              <div key={dateKey} className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground px-3">
                  {getDateLabel(dateKey)}
                </h4>
                <div className="space-y-1">
                  {dateItems.map(item => (
                    <MemoryItemComponent
                      key={item.id}
                      item={item}
                      onClick={onItemClick ? () => onItemClick(item) : undefined}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}

// Helper function to create memory items from action results
export function createMemoryItem(
  actionType: string,
  actionData: any,
  messageId: string
): AIMemoryItem | null {
  const timestamp = new Date();

  switch (actionType) {
    case 'create_lead':
      return {
        id: `lead-${actionData.id}-${timestamp.getTime()}`,
        type: 'lead',
        title: 'Oprettet lead:',
        subtitle: actionData.name,
        timestamp,
        messageId,
      };

    case 'create_task':
      return {
        id: `task-${actionData.id}-${timestamp.getTime()}`,
        type: 'task',
        title: 'Oprettet opgave:',
        subtitle: actionData.title,
        timestamp,
        messageId,
      };

    case 'book_meeting':
      return {
        id: `meeting-${actionData.id}-${timestamp.getTime()}`,
        type: 'meeting',
        title: 'Booket møde:',
        subtitle: actionData.startTime ? new Date(actionData.startTime).toLocaleString('da-DK', {
          weekday: 'short',
          hour: '2-digit',
          minute: '2-digit'
        }) : undefined,
        timestamp,
        messageId,
      };

    case 'create_invoice':
      return {
        id: `invoice-${actionData.id}-${timestamp.getTime()}`,
        type: 'invoice',
        title: 'Oprettet faktura:',
        subtitle: `${actionData.customerName} - ${actionData.amount} kr`,
        timestamp,
        messageId,
      };

    case 'search_email':
      return {
        id: `email-${timestamp.getTime()}`,
        type: 'email',
        title: 'Søgte i emails',
        subtitle: `${actionData.resultCount || 0} resultater`,
        timestamp,
        messageId,
      };

    case 'check_calendar':
      return {
        id: `calendar-${timestamp.getTime()}`,
        type: 'info',
        title: 'Tjekkede kalender',
        subtitle: actionData.date ? new Date(actionData.date).toLocaleDateString('da-DK') : undefined,
        timestamp,
        messageId,
      };

    default:
      return null;
  }
}
