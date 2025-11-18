/**
 * Calendar Event Card - Shortwave-Inspired Design
 * Inline event preview med date badge og booking detaljer
 */

import { Calendar, Clock, MapPin, Mail, Phone, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface CalendarEventData {
  title: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees?: string[];
  description?: string;
  isBooked?: boolean;

  // Rendetalje-specific booking data
  customerEmail?: string;
  customerPhone?: string;
  serviceType?: string;
  propertySize?: number;
  focusAreas?: string[];
  team?: string;
  estimatedTime?: string;
  estimatedPrice?: string;
  leadSource?: string;
  status?: string;
}

interface CalendarEventCardProps {
  data: CalendarEventData;
  onCreateEvent?: () => void;
  onSkip?: () => void;
}

export function CalendarEventCard({
  data,
  onCreateEvent,
  onSkip,
}: CalendarEventCardProps) {
  const startDate = new Date(data.startTime);
  const endDate = new Date(data.endTime);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("da-DK", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (date: Date) => {
    return date.toLocaleDateString("da-DK", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getMonth = (date: Date) => {
    return date.toLocaleDateString("da-DK", { month: "short" });
  };

  const getDay = (date: Date) => {
    return date.getDate();
  };

  const getWeekday = (date: Date) => {
    return date.toLocaleDateString("da-DK", { weekday: "short" });
  };

  return (
    <Card className="overflow-hidden bg-slate-900 border-slate-700 hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 max-w-md">
      {/* Date Badge - Shortwave Style */}
      <div className="flex items-start gap-4 p-4 pb-3">
        <div className="flex flex-col items-center justify-center bg-red-600 rounded-lg px-4 py-2 min-w-[80px] shrink-0 shadow-md">
          <div className="text-xs font-semibold uppercase text-white">
            {getMonth(startDate)}.
          </div>
          <div className="text-3xl font-bold leading-none my-1 text-white">
            {getDay(startDate)}
          </div>
          <div className="text-xs font-medium text-white">
            {getWeekday(startDate)}.
          </div>
        </div>

        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-start gap-2 mb-2">
            <Building2 className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
            <h3 className="font-semibold text-base leading-tight text-white">
              {data.title}
            </h3>
          </div>

          <div className="space-y-1.5 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {formatDateShort(startDate)} {formatTime(startDate)} -{" "}
                {formatTime(endDate)}
              </span>
            </div>

            {!data.isBooked && (
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>RenOS Automatisk Booking</span>
              </div>
            )}

            {data.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                <span>{data.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator className="bg-slate-700" />

      {/* Booking Details */}
      <div className="p-4 space-y-3 text-sm">
        {data.serviceType && (
          <div>
            <h4 className="font-bold uppercase text-xs mb-1">
              {data.serviceType}
              {data.propertySize && ` - ${data.propertySize}m²`}
            </h4>
          </div>
        )}

        {/* Contact Info */}
        {(data.customerEmail || data.customerPhone) && (
          <div className="space-y-1">
            {data.customerEmail && (
              <div className="flex items-center gap-2 text-gray-300">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>
                  Email:{" "}
                  <a
                    href={`mailto:${data.customerEmail}`}
                    className="text-blue-400 hover:underline"
                  >
                    {data.customerEmail}
                  </a>
                </span>
              </div>
            )}
            {data.customerPhone && (
              <div className="flex items-center gap-2 text-gray-300">
                <Phone className="w-3.5 h-3.5 text-green-400" />
                <span>Telefon: {data.customerPhone}</span>
              </div>
            )}
          </div>
        )}

        {/* Focus Areas */}
        {data.focusAreas && data.focusAreas.length > 0 && (
          <div>
            <h5 className="font-semibold text-xs uppercase mb-1.5 text-white">
              Fokusområder:
            </h5>
            <div className="space-y-0.5 text-gray-300">
              {data.focusAreas.map((area, idx) => (
                <div key={idx} className="text-xs">
                  • {area}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team & Time */}
        {(data.team || data.estimatedTime) && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            {data.team && (
              <div>
                <span className="font-semibold">TEAM:</span> {data.team}
              </div>
            )}
            {data.estimatedTime && (
              <div>
                <span className="font-semibold">TID:</span> {data.estimatedTime}
              </div>
            )}
          </div>
        )}

        {/* Pricing */}
        {data.estimatedPrice && (
          <div className="text-xs">
            <span className="font-semibold">ESTIMAT:</span>{" "}
            {data.estimatedPrice}
          </div>
        )}

        {/* Lead Info */}
        {(data.leadSource || data.status) && (
          <div className="pt-2 border-t border-slate-700 space-y-1 text-xs text-white">
            {data.leadSource && (
              <div>
                <span className="font-semibold">LEAD:</span>{" "}
                <span className="text-gray-400">{data.leadSource}</span>
              </div>
            )}
            {data.status && (
              <div>
                <span className="font-semibold">STATUS:</span>{" "}
                <span className="text-gray-400">{data.status}</span>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {data.description && (
          <p className="text-xs text-gray-400 pt-2 border-t border-slate-700">
            {data.description}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      {!data.isBooked && (
        <div className="flex gap-2 p-4 pt-0">
          {onSkip && (
            <Button
              variant="ghost"
              onClick={onSkip}
              className="flex-1 hover:bg-slate-800"
            >
              Skip
            </Button>
          )}
          {onCreateEvent && (
            <Button
              onClick={onCreateEvent}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md"
            >
              Create event
            </Button>
          )}
        </div>
      )}

      {data.isBooked && (
        <div className="px-4 pb-4">
          <div className="bg-green-900/20 border border-green-700 rounded-lg px-3 py-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-400">
              ✓ Event oprettet i kalender
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
