/**
 * CALENDAR EVENT EDIT CARD - Redigere/slette events
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Edit2, Trash2, Save, X } from "lucide-react";
import { useState } from "react";

export interface CalendarEventData {
  id: string;
  title: string;
  date: string;
  time: string;
  endTime?: string;
  location?: string;
  description?: string;
  attendees?: string[];
}

interface CalendarEventEditCardProps {
  event: CalendarEventData;
  onUpdate?: (event: CalendarEventData) => void;
  onDelete?: (eventId: string) => void;
  onCancel?: () => void;
}

export function CalendarEventEditCard({
  event: initialEvent,
  onUpdate,
  onDelete,
  onCancel,
}: CalendarEventEditCardProps) {
  const [event, setEvent] = useState(initialEvent);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const update = (field: keyof CalendarEventData, value: any) => {
    setEvent(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onUpdate?.(event);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete?.(event.id);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  return (
    <Card className="border-l-4 border-l-purple-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Edit Event</h4>
              <p className="text-xs text-muted-foreground">
                Opdater kalenderbegivenhed
              </p>
            </div>
          </div>
          <Badge variant="secondary">#{event.id}</Badge>
        </div>

        {/* Event Details */}
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">📌 Titel</label>
            {isEditing ? (
              <Input
                value={event.title}
                onChange={e => update("title", e.target.value)}
                className="h-9 mt-1"
              />
            ) : (
              <p className="font-semibold text-sm mt-1">{event.title}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">📅 Dato</label>
              {isEditing ? (
                <Input
                  type="date"
                  value={event.date}
                  onChange={e => update("date", e.target.value)}
                  className="h-9 mt-1"
                />
              ) : (
                <p className="text-sm mt-1">{event.date}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground">⏰ Tid</label>
              {isEditing ? (
                <Input
                  type="time"
                  value={event.time}
                  onChange={e => update("time", e.target.value)}
                  className="h-9 mt-1"
                />
              ) : (
                <p className="text-sm mt-1">{event.time}</p>
              )}
            </div>
          </div>

          {event.endTime && (
            <div>
              <label className="text-xs text-muted-foreground">
                ⏰ Slut tid
              </label>
              {isEditing ? (
                <Input
                  type="time"
                  value={event.endTime}
                  onChange={e => update("endTime", e.target.value)}
                  className="h-9 mt-1"
                />
              ) : (
                <p className="text-sm mt-1">{event.endTime}</p>
              )}
            </div>
          )}

          <div>
            <label className="text-xs text-muted-foreground">📍 Lokation</label>
            {isEditing ? (
              <Input
                value={event.location || ""}
                onChange={e => update("location", e.target.value)}
                placeholder="Optional..."
                className="h-9 mt-1"
              />
            ) : (
              <p className="text-sm mt-1">
                {event.location || "Ingen lokation"}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs text-muted-foreground">
              📝 Beskrivelse
            </label>
            {isEditing ? (
              <Textarea
                value={event.description || ""}
                onChange={e => update("description", e.target.value)}
                placeholder="Optional..."
                className="min-h-[60px] mt-1"
              />
            ) : (
              <p className="text-sm mt-1 whitespace-pre-wrap">
                {event.description || "Ingen beskrivelse"}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          {!isEditing ? (
            <>
              <Button onClick={() => setIsEditing(true)} className="flex-1">
                <Edit2 className="w-4 h-4 mr-2" />
                Rediger
              </Button>
              <Button
                onClick={handleDelete}
                variant="outline"
                className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
              >
                {showDeleteConfirm ? (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Bekræft slet
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Slet
                  </>
                )}
              </Button>
              <Button onClick={onCancel} variant="ghost">
                <X className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleSave}
                className="flex-1 bg-linear-to-r from-purple-600 to-pink-600"
              >
                <Save className="w-4 h-4 mr-2" />
                Gem
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Annuller
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
