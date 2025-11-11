/**
 * Email Thread Card - Gmail Integration
 * Viser email thread summary med AI analysis
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface EmailThreadData {
  subject: string;
  from: string;
  messageCount: number;
  summary: string;
  labels: string[];
  priority: 'high' | 'medium' | 'low';
  hasAttachments?: boolean;
}

interface EmailThreadCardProps {
  data: EmailThreadData;
  onClick?: () => void;
}

export function EmailThreadCard({ data, onClick }: EmailThreadCardProps) {
  const priorityColors = {
    high: 'border-l-red-500',
    medium: 'border-l-yellow-500',
    low: 'border-l-blue-500',
  };

  return (
    <Card 
      className={cn(
        "hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 border-l-4 cursor-pointer",
        priorityColors[data.priority]
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">{data.subject}</h4>
              <p className="text-xs text-muted-foreground truncate">{data.from}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {data.hasAttachments && <span className="text-lg">📎</span>}
              <Badge variant="secondary" className="text-xs">
                {data.messageCount} msgs
              </Badge>
            </div>
          </div>

          {/* AI Summary */}
          <div className="bg-blue-50/50 dark:bg-blue-950/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <span className="text-xl shrink-0">✨</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium mb-1">AI Summary</p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {data.summary}
                </p>
              </div>
            </div>
          </div>

          {/* Labels */}
          {data.labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {data.labels.map((label, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {label}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
