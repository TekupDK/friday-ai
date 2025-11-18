/**
 * CONTACT CARD - Kontakt kort
 */

import { User, Mail, Phone, MapPin, Briefcase } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ContactCardProps {
  contact?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    role: string;
    location: string;
    status: "online" | "offline" | "away";
    avatar?: string;
  };
  onEmail?: () => void;
  onCall?: () => void;
  onView?: () => void;
}

export function ContactCard({
  contact = {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@abc-corp.com",
    phone: "+45 2345 6789",
    company: "ABC Corporation",
    role: "Sales Manager",
    location: "København, Danmark",
    status: "online",
  },
  onEmail,
  onCall,
  onView,
}: ContactCardProps) {
  const getStatusColor = () => {
    switch (contact.status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="border-l-4 border-l-cyan-500">
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-cyan-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div
                className={cn(
                  "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white",
                  getStatusColor()
                )}
              />
            </div>
            <div>
              <h4 className="font-semibold">{contact.name}</h4>
              <p className="text-xs text-muted-foreground">{contact.role}</p>
            </div>
          </div>
          <Badge variant="outline">{contact.company}</Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="w-3 h-3" />
            <span>{contact.email}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="w-3 h-3" />
            <span>{contact.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{contact.location}</span>
          </div>
        </div>

        <div className="flex gap-1 pt-2 border-t">
          <Button size="sm" onClick={onEmail}>
            <Mail className="w-3 h-3 mr-1" />
            Email
          </Button>
          <Button size="sm" variant="outline" onClick={onCall}>
            <Phone className="w-3 h-3 mr-1" />
            Ring
          </Button>
          <Button size="sm" variant="outline" onClick={onView}>
            Se profil
          </Button>
        </div>
      </div>
    </Card>
  );
}
