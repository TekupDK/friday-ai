/**
 * FREE BUSY CARD - Tjekke ledig tid
 */

import { Calendar, Clock, Users, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";


export interface TimeSlot {
  id: string;
  time: string;
  duration: string;
  available: boolean;
  conflictingEvent?: string;
}

interface FreeBusyCardProps {
  date?: string;
  timeSlots?: TimeSlot[];
  onBookSlot?: (slotId: string) => void;
  onChangeDate?: (date: string) => void;
  onCancel?: () => void;
}

export function FreeBusyCard({
  date = new Date().toISOString().split("T")[0],
  timeSlots = [],
  onBookSlot,
  onChangeDate,
  onCancel,
}: FreeBusyCardProps) {
  const [selectedDate, setSelectedDate] = useState(date);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Generate sample time slots if none provided
  const defaultSlots: TimeSlot[] = [
    { id: "1", time: "09:00", duration: "30 min", available: true },
    { id: "2", time: "09:30", duration: "30 min", available: true },
    {
      id: "3",
      time: "10:00",
      duration: "1 time",
      available: false,
      conflictingEvent: "Team Møde",
    },
    { id: "4", time: "11:00", duration: "30 min", available: true },
    {
      id: "5",
      time: "11:30",
      duration: "1 time",
      available: false,
      conflictingEvent: "Kunde Call",
    },
    { id: "6", time: "13:00", duration: "30 min", available: true },
    { id: "7", time: "13:30", duration: "1 time", available: true },
    {
      id: "8",
      time: "14:30",
      duration: "30 min",
      available: false,
      conflictingEvent: "Lunch",
    },
    { id: "9", time: "15:00", duration: "1 time", available: true },
    { id: "10", time: "16:00", duration: "30 min", available: true },
  ];

  const slots = timeSlots.length > 0 ? timeSlots : defaultSlots;

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    onChangeDate?.(newDate);
  };

  const handleSlotSelect = (slotId: string) => {
    const slot = slots.find(s => s.id === slotId);
    if (slot?.available) {
      setSelectedSlot(slotId);
    }
  };

  const handleBook = () => {
    if (selectedSlot) {
      onBookSlot?.(selectedSlot);
    }
  };

  const availableSlots = slots.filter(s => s.available).length;
  const totalSlots = slots.length;

  return (
    <Card className="border-l-4 border-l-blue-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold">Ledig Tid</h4>
            <p className="text-xs text-muted-foreground">Tjek ledige tider</p>
          </div>
        </div>

        {/* Date Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Vælg dato:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => handleDateChange(e.target.value)}
            className="w-full h-9 px-3 border rounded-lg text-sm"
          />
        </div>

        {/* Availability Summary */}
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                {availableSlots} af {totalSlots} tider ledige
              </span>
            </div>
            <Badge
              className={availableSlots > 0 ? "bg-green-500" : "bg-red-500"}
            >
              {availableSlots > 0 ? "Ledig" : "Optaget"}
            </Badge>
          </div>
        </div>

        {/* Time Slots */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Tidspunkter:
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {slots.map(slot => (
              <button
                key={slot.id}
                onClick={() => handleSlotSelect(slot.id)}
                disabled={!slot.available}
                className={cn(
                  "p-3 rounded-lg border text-left transition-all",
                  slot.available
                    ? selectedSlot === slot.id
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-background border-border hover:bg-blue-50 dark:hover:bg-blue-950/20"
                    : "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-60"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      {slot.available ? (
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                      ) : (
                        <XCircle className="w-3 h-3 text-red-600" />
                      )}
                      <span className="text-sm font-medium">{slot.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {slot.duration}
                    </p>
                    {slot.conflictingEvent && (
                      <p className="text-xs text-red-600 truncate">
                        {slot.conflictingEvent}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Slot Info */}
        {selectedSlot && (
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 text-xs">
            <span className="font-medium text-green-700 dark:text-green-400">
              Valgt: {slots.find(s => s.id === selectedSlot)?.time} (
              {slots.find(s => s.id === selectedSlot)?.duration})
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            onClick={handleBook}
            className="flex-1 bg-linear-to-r from-blue-600 to-cyan-600"
            disabled={!selectedSlot}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Book tid
          </Button>
          <Button onClick={onCancel} variant="outline" className="flex-1">
            Annuller
          </Button>
        </div>
      </div>
    </Card>
  );
}
