import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Clock, Paperclip, MessageSquare, Eye } from "lucide-react";

/**
 * DESIGN 3: Notion-Style Kanban Board
 * - Columns for workflow stages
 * - Card-based design
 * - Drag & drop visual cues
 * - Property tags
 * - Avatar + timestamp
 */

interface EmailCard {
  id: string;
  sender: string;
  avatar: string;
  subject: string;
  preview: string;
  time: string;
  stage: 'inbox' | 'review' | 'replied' | 'done';
  hasAttachment: boolean;
  priority: 'high' | 'normal' | 'low';
  tags: string[];
  comments: number;
}

const emails: EmailCard[] = [
  { id: '1', sender: 'Matilde Skinneholm', avatar: 'MS', subject: 'Tilbud på rengøring', preview: 'Vi vil gerne have et tilbud...', time: '22:08', stage: 'inbox', hasAttachment: false, priority: 'high', tags: ['Hot Lead', 'Rengøring.nu'], comments: 2 },
  { id: '2', sender: 'Hanne Andersen', avatar: 'HA', subject: 'Follow-up', preview: 'Jeg følger op på...', time: '17:39', stage: 'inbox', hasAttachment: false, priority: 'high', tags: ['Follow-up'], comments: 1 },
  { id: '3', sender: 'Rendetalje.dk', avatar: 'RD', subject: 'Booking', preview: 'Vi kan tirsdag eller torsdag...', time: '20:53', stage: 'review', hasAttachment: true, priority: 'high', tags: ['Booking'], comments: 0 },
  { id: '4', sender: 'Lars Nielsen', avatar: 'LN', subject: 'Møde bekræftelse', preview: 'Bekræftelse på mødet...', time: 'Igår', stage: 'replied', hasAttachment: false, priority: 'normal', tags: ['Meeting'], comments: 3 },
];

const stages = [
  { id: 'inbox', label: 'Inbox', color: 'bg-blue-500' },
  { id: 'review', label: 'Under Review', color: 'bg-yellow-500' },
  { id: 'replied', label: 'Replied', color: 'bg-purple-500' },
  { id: 'done', label: 'Done', color: 'bg-green-500' },
];

export function EmailCenterKanbanStyle() {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const getEmailsByStage = (stage: string) => {
    return emails.filter(e => e.stage === stage);
  };

  const getPriorityDot = (priority: string) => {
    if (priority === 'high') return 'bg-red-500';
    if (priority === 'normal') return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  return (
    <Card>
      <CardContent className="p-4">
        {/* Board Header */}
        <div className="mb-4">
          <h3 className="text-xl font-bold">Email Pipeline</h3>
          <p className="text-sm text-muted-foreground">Kanban-style workflow • Drag cards between stages</p>
        </div>

        {/* Kanban Columns */}
        <div className="grid grid-cols-4 gap-4">
          {stages.map(stage => {
            const stageEmails = getEmailsByStage(stage.id);
            
            return (
              <div key={stage.id} className="flex flex-col">
                {/* Column Header */}
                <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                  <div className={cn("w-2 h-2 rounded-full", stage.color)} />
                  <span className="font-semibold text-sm">{stage.label}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">{stageEmails.length}</Badge>
                </div>

                {/* Column Content */}
                <ScrollArea className="h-[650px] pr-2">
                  <div className="space-y-3">
                    {stageEmails.map((email, idx) => (
                      <div
                        key={email.id}
                        draggable
                        onDragStart={() => setDraggedId(email.id)}
                        onDragEnd={() => setDraggedId(null)}
                        className={cn(
                          "group p-4 rounded-lg border bg-card cursor-grab active:cursor-grabbing",
                          "hover:shadow-md transition-all duration-200",
                          draggedId === email.id && "opacity-50 scale-95"
                        )}
                        style={{ 
                          animation: `cardSlide 0.3s ease-out ${idx * 0.08}s both` 
                        }}
                      >
                        {/* Card Header */}
                        <div className="flex items-start gap-2 mb-3">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="text-xs font-semibold">{email.avatar}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <div className={cn("w-1.5 h-1.5 rounded-full", getPriorityDot(email.priority))} />
                              <span className="font-medium text-sm truncate">{email.sender}</span>
                            </div>
                            <h4 className="font-semibold text-sm line-clamp-2 leading-tight">
                              {email.subject}
                            </h4>
                          </div>
                        </div>

                        {/* Preview */}
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {email.preview}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {email.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs px-2 py-0">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Card Footer */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {email.time}
                            </div>
                            {email.hasAttachment && (
                              <div className="flex items-center gap-1">
                                <Paperclip className="h-3 w-3" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {email.comments > 0 && (
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                <span>{email.comments}</span>
                              </div>
                            )}
                            <Eye className="h-3 w-3" />
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Add Card Placeholder */}
                    <button className="w-full p-3 rounded-lg border-2 border-dashed border-muted-foreground/20 hover:border-muted-foreground/40 hover:bg-muted/20 transition-colors text-xs text-muted-foreground">
                      + Add email
                    </button>
                  </div>
                </ScrollArea>
              </div>
            );
          })}
        </div>

        <style>{`
          @keyframes cardSlide {
            from {
              opacity: 0;
              transform: translateY(8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </CardContent>
    </Card>
  );
}
