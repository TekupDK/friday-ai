/**
 * ACTION BUTTONS GROUP - Handlingsknapper til hurtige operationer
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Send, 
  Calendar, 
  DollarSign, 
  Phone, 
  Mail, 
  MessageSquare,
  FileText,
  CheckSquare,
  Clock,
  Star,
  Archive,
  Trash2,
  MoreHorizontal,
  type LucideIcon
} from "lucide-react";

export interface ActionButton {
  id: string;
  label: string;
  icon: 'send' | 'calendar' | 'dollar' | 'phone' | 'mail' | 'message' | 'file' | 'check' | 'clock' | 'star' | 'archive' | 'trash' | 'more';
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  badge?: string | number;
  disabled?: boolean;
  primary?: boolean;
}

interface ActionButtonsGroupProps {
  actions: ActionButton[];
  onAction?: (actionId: string) => void;
  layout?: 'horizontal' | 'grid' | 'vertical';
  compact?: boolean;
}

const iconMap: Record<ActionButton['icon'], LucideIcon> = {
  send: Send,
  calendar: Calendar,
  dollar: DollarSign,
  phone: Phone,
  mail: Mail,
  message: MessageSquare,
  file: FileText,
  check: CheckSquare,
  clock: Clock,
  star: Star,
  archive: Archive,
  trash: Trash2,
  more: MoreHorizontal
};

export function ActionButtonsGroup({ 
  actions, 
  onAction,
  layout = 'horizontal',
  compact = false
}: ActionButtonsGroupProps) {
  const getLayoutClass = () => {
    switch (layout) {
      case 'grid': return 'grid grid-cols-2 gap-2';
      case 'vertical': return 'flex flex-col gap-2';
      default: return 'flex flex-wrap gap-2';
    }
  };

  return (
    <Card className={cn("p-3", compact && "p-2")}>
      <div className={getLayoutClass()}>
        {actions.map((action) => {
          const Icon = iconMap[action.icon];
          
          return (
            <Button
              key={action.id}
              variant={action.primary ? 'default' : (action.variant || 'outline')}
              size={compact ? 'sm' : 'default'}
              onClick={() => onAction?.(action.id)}
              disabled={action.disabled}
              className={cn(
                "relative",
                layout === 'grid' && "w-full justify-start",
                action.primary && "bg-blue-600 hover:bg-blue-700"
              )}
            >
              <Icon className={cn("w-4 h-4", !compact && "mr-2")} />
              {!compact && action.label}
              {action.badge && (
                <Badge 
                  className="absolute -top-2 -right-2 px-1.5 min-w-[20px] h-5 flex items-center justify-center bg-red-500"
                  variant="destructive"
                >
                  {action.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </Card>
  );
}
