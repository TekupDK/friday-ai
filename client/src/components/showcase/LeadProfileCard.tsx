import {
  Mail,
  Phone,
  MapPin,
  Calendar as CalendarIcon,
  DollarSign,
  UserCheck,
  Star,
  Clock,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";


interface LeadProfile {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  location?: string;
  status: "New" | "Contacted" | "Qualified" | "Customer";
  priority: "Low" | "Medium" | "High";
  estimatedValue?: number;
  winRate?: number; // percent
  tags?: string[];
}

const demoLead: LeadProfile = {
  name: "Camilla Niehaus",
  company: "Rendetalje.dk",
  email: "camilla@rendetalje.dk",
  phone: "+45 52 12 34 56",
  location: "København, DK",
  status: "Qualified",
  priority: "High",
  estimatedValue: 45000,
  winRate: 72,
  tags: ["Rengøring", "Kontor", "Website lead"],
};

const statusColors = {
  New: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Contacted: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  Qualified: "bg-green-500/10 text-green-600 dark:text-green-400",
  Customer: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

const priorityColors = {
  Low: "bg-muted text-muted-foreground",
  Medium: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  High: "bg-red-500/10 text-red-600 dark:text-red-400",
};

export function LeadProfileCard({ lead = demoLead }: { lead?: LeadProfile }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="" alt={lead.name} />
              <AvatarFallback>
                {lead.name
                  .split(" ")
                  .map(n => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{lead.name}</CardTitle>
              <CardDescription>{lead.company}</CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={cn(statusColors[lead.status])}>
              {lead.status}
            </Badge>
            <Badge className={cn(priorityColors[lead.priority])}>
              {lead.priority}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Contact row */}
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            {lead.email}
          </div>
          {lead.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {lead.phone}
            </div>
          )}
          {lead.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {lead.location}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" /> Kilde: Website
          </div>
        </div>

        <Separator className="my-4" />

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <div className="text-xs text-muted-foreground">Est. Value</div>
            <div className="text-xl font-bold flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {lead.estimatedValue?.toLocaleString("da-DK")} kr
            </div>
          </div>
          <div className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <div className="text-xs text-muted-foreground">Win Rate</div>
            <div className="text-xl font-bold">{lead.winRate}%</div>
          </div>
          <div className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <div className="text-xs text-muted-foreground">
              Seneste aktivitet
            </div>
            <div className="text-sm flex items-center gap-1">
              <Clock className="w-4 h-4" /> I dag 10:30
            </div>
          </div>
          <div className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <div className="text-xs text-muted-foreground">Tags</div>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              {lead.tags?.map(t => (
                <Badge key={t} variant="secondary" className="text-xs">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm">
            <Mail className="w-4 h-4 mr-1" /> Send email
          </Button>
          <Button variant="outline" size="sm">
            <Phone className="w-4 h-4 mr-1" /> Ring op
          </Button>
          <Button variant="outline" size="sm">
            <CalendarIcon className="w-4 h-4 mr-1" /> Book møde
          </Button>
          <Button variant="secondary" size="sm">
            <UserCheck className="w-4 h-4 mr-1" /> Markér kvalificeret
          </Button>
        </div>

        {/* Activity timeline (compact) */}
        <div className="mt-4 space-y-2">
          <div className="text-xs text-muted-foreground">Aktiviteter</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Email
              svar modtaget
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Møde
              bekræftet
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Tilbud
              afventer
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
