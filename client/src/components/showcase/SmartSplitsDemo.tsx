import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Mail, Flame, Clock, DollarSign, CheckCircle, Circle } from "lucide-react";

interface SmartSplit {
  id: string;
  name: string;
  icon: typeof Mail;
  color: string;
  count: number;
  active?: boolean;
}

const smartSplits: SmartSplit[] = [
  {
    id: 'all',
    name: 'Alle Emails',
    icon: Mail,
    color: 'text-blue-500',
    count: 20,
    active: true
  },
  {
    id: 'hot-leads',
    name: 'Hot Leads',
    icon: Flame,
    color: 'text-red-500',
    count: 0
  },
  {
    id: 'waiting',
    name: 'Venter på Svar',
    icon: Clock,
    color: 'text-yellow-500',
    count: 0
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: DollarSign,
    color: 'text-green-500',
    count: 0
  },
  {
    id: 'completed',
    name: 'Afsluttet',
    icon: CheckCircle,
    color: 'text-gray-500',
    count: 0
  }
];

export function SmartSplitsDemo() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-1">SMART SPLITS</h4>
        <p className="text-xs text-muted-foreground">
          AI-powered email kategorisering
        </p>
      </div>
      
      <ScrollArea className="h-[300px]">
        <div className="space-y-1">
          {smartSplits.map((split) => {
            const Icon = split.icon;
            
            return (
              <button
                key={split.id}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-lg transition-all",
                  "hover:bg-accent/50",
                  split.active 
                    ? "bg-primary/10 border border-primary/20" 
                    : "border border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    split.active ? "bg-primary/20" : "bg-muted"
                  )}>
                    <Icon className={cn("w-4 h-4", split.color)} />
                  </div>
                  
                  <span className={cn(
                    "text-sm font-medium",
                    split.active && "text-primary"
                  )}>
                    {split.name}
                  </span>
                </div>
                
                <Badge 
                  variant={split.active ? "default" : "secondary"}
                  className="rounded-full min-w-[32px] justify-center"
                >
                  {split.count}
                </Badge>
              </button>
            );
          })}
        </div>
      </ScrollArea>

      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            <Circle className="w-3 h-3 fill-green-500 text-green-500" />
            AI Auto-sorting aktiv
          </span>
          <button className="text-primary hover:underline">
            Indstillinger
          </button>
        </div>
      </div>
    </div>
  );
}
