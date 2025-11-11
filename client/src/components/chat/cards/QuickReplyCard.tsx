/**
 * QUICK REPLY CARD - Hurtig svar kort
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Zap, Send, Clock, Star } from "lucide-react";
import { useState } from "react";

export interface QuickReplyCardProps {
  quickReply?: {
    id: string;
    title: string;
    templates: Array<{
      id: string;
      label: string;
      message: string;
      category: string;
    }>;
  };
  onSendReply?: (message: string) => void;
  onEditTemplate?: (id: string) => void;
}

export function QuickReplyCard({ 
  quickReply = {
    id: '1',
    title: 'Hurtige svar',
    templates: [
      {
        id: '1',
        label: 'Tak for henvendelse',
        message: 'Tak for din henvendelse. Vi vender tilbage inden for 24 timer.',
        category: 'standard'
      },
      {
        id: '2',
        label: 'Booking bekræftet',
        message: 'Din booking er bekræftet. Du vil modtage en bekræftelse på email.',
        category: 'booking'
      },
      {
        id: '3',
        label: 'Mere info nødvendig',
        message: 'Vi har brug for mere information for at kunne hjælpe dig videre.',
        category: 'support'
      },
      {
        id: '4',
        label: 'Videresender til support',
        message: 'Jeg videresender din henvendelse til vores support team.',
        category: 'support'
      }
    ]
  },
  onSendReply,
  onEditTemplate
}: QuickReplyCardProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'booking': return 'bg-green-500';
      case 'support': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="border-l-4 border-l-yellow-500">
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">{quickReply.title}</h4>
              <p className="text-xs text-muted-foreground">
                {quickReply.templates.length} skabeloner tilgængelige
              </p>
            </div>
          </div>
          <Badge className="bg-yellow-500">
            <Clock className="w-3 h-3 mr-1" />
            Hurtig
          </Badge>
        </div>

        <div className="space-y-2">
          {quickReply.templates.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-all",
                selectedTemplate === template.id
                  ? "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-300"
                  : "bg-background border-border hover:bg-muted"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{template.label}</span>
                    <Badge className={getCategoryColor(template.category)}>
                      {template.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {template.message}
                  </p>
                </div>
                {selectedTemplate === template.id && (
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-1 pt-2 border-t">
          <Button 
            size="sm" 
            onClick={() => {
              const template = quickReply.templates.find(t => t.id === selectedTemplate);
              if (template) {
                onSendReply?.(template.message);
              }
            }}
            disabled={!selectedTemplate}
          >
            <Send className="w-3 h-3 mr-1" />
            Send svar
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => selectedTemplate && onEditTemplate?.(selectedTemplate)}
            disabled={!selectedTemplate}
          >
            Rediger
          </Button>
        </div>
      </div>
    </Card>
  );
}
