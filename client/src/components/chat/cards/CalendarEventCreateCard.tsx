/**
 * CALENDAR EVENT CREATE CARD - Shortwave-inspireret
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, X } from "lucide-react";
import { useState } from "react";

export interface CalendarEventData {
  title: string;
  date: string;
  time: string;
  endTime?: string;
  location?: string;
  description?: string;
  attendees?: string[];
}

interface CalendarEventCreateCardProps {
  data: CalendarEventData;
  onCreate?: (event: CalendarEventData) => void;
  onCancel?: () => void;
}

export function CalendarEventCreateCard({ data: initial, onCreate, onCancel }: CalendarEventCreateCardProps) {
  const [data, setData] = useState(initial);

  const update = (field: keyof CalendarEventData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="border-l-4 border-l-purple-500">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Create Event</h4>
              <p className="text-xs text-muted-foreground">Ny kalenderbegivenhed</p>
            </div>
          </div>
          <Badge variant="secondary">Ny</Badge>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground flex items-center gap-1.5">
              📌 Titel
            </label>
            <Input value={data.title} onChange={(e) => update('title', e.target.value)} className="h-9 mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                📅 Dato
              </label>
              <Input type="date" value={data.date} onChange={(e) => update('date', e.target.value)} className="h-9 mt-1" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                ⏰ Tid
              </label>
              <Input type="time" value={data.time} onChange={(e) => update('time', e.target.value)} className="h-9 mt-1" />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <MapPin className="w-3 h-3" /> Lokation
            </label>
            <Input value={data.location || ''} onChange={(e) => update('location', e.target.value)} placeholder="Optional..." className="h-9 mt-1" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground flex items-center gap-1.5">
              📝 Beskrivelse
            </label>
            <Textarea value={data.description || ''} onChange={(e) => update('description', e.target.value)} placeholder="Optional..." className="min-h-[60px] mt-1" />
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <Button onClick={() => onCreate?.(data)} className="flex-1 bg-linear-to-r from-purple-600 to-pink-600">
            <Calendar className="w-4 h-4 mr-2" />Create
          </Button>
          <Button onClick={onCancel} variant="outline" className="flex-1">
            <X className="w-4 h-4 mr-2" />Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
}
