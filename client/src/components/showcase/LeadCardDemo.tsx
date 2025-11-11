import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Clock,
  DollarSign,
  User,
  Building,
  Tag
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  location: string;
  service: string;
  source: string;
  priority: 'low' | 'medium' | 'high';
  status: 'new' | 'contacted' | 'qualified' | 'converted';
  estimatedValue?: number;
  createdAt: string;
  notes?: string;
}

const demoLeads: Lead[] = [
  {
    id: '1',
    name: 'Hans Jensen',
    company: 'Jensen & Co ApS',
    email: 'hans@jensen.dk',
    phone: '+45 12 34 56 78',
    location: 'København K',
    service: 'Vinduespudsning',
    source: 'rengoring.nu',
    priority: 'high',
    status: 'new',
    estimatedValue: 12500,
    createdAt: '2024-11-09 14:30',
    notes: 'Har 3 etagers kontor, skal rengøres hver måned'
  },
  {
    id: '2',
    name: 'Maria Nielsen',
    email: 'maria.n@email.dk',
    phone: '+45 98 76 54 32',
    location: 'Aarhus C',
    service: 'Flytning assistance',
    source: 'Website',
    priority: 'medium',
    status: 'contacted',
    estimatedValue: 8900,
    createdAt: '2024-11-08 10:15',
    notes: '2-værelses lejlighed, flytter til Odense'
  },
  {
    id: '3',
    name: 'Peter Andersen',
    company: 'Teknik Huset',
    email: 'peter@teknikhuset.dk',
    phone: '+45 23 45 67 89',
    location: 'Odense',
    service: 'Kontor rengøring',
    source: 'Google Ads',
    priority: 'high',
    status: 'qualified',
    estimatedValue: 25000,
    createdAt: '2024-11-07 16:45',
    notes: 'Stor kontor kompleks, søger langtidskontrakt'
  }
];

const priorityStyles = {
  low: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  medium: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
  high: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
};

const statusStyles = {
  new: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  contacted: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  qualified: 'bg-green-500/10 text-green-700 dark:text-green-400',
  converted: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
};

const statusText = {
  new: 'Ny',
  contacted: 'Kontaktet',
  qualified: 'Kvalificeret',
  converted: 'Konverteret'
};

export function LeadCardDemo() {
  return (
    <div className="grid gap-4">
      {demoLeads.map((lead) => (
        <Card key={lead.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{lead.name}</h3>
                  <Badge className={priorityStyles[lead.priority]} variant="outline">
                    {lead.priority === 'high' && '🔥'}
                    {lead.priority === 'medium' && '⚡'}
                    {lead.priority === 'low' && '📋'}
                    {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
                  </Badge>
                </div>
                
                {lead.company && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    {lead.company}
                  </p>
                )}
              </div>
              
              <Badge className={statusStyles[lead.status]}>
                {statusText[lead.status]}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <a href={`mailto:${lead.email}`} className="hover:underline truncate">
                  {lead.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <a href={`tel:${lead.phone}`} className="hover:underline">
                  {lead.phone}
                </a>
              </div>
            </div>

            {/* Service & Location */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <span>{lead.service}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{lead.location}</span>
              </div>
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {lead.source}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {lead.createdAt}
              </div>
              {lead.estimatedValue && (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                  <DollarSign className="w-3 h-3" />
                  {lead.estimatedValue.toLocaleString('da-DK')} kr.
                </div>
              )}
            </div>

            {/* Notes */}
            {lead.notes && (
              <div className="bg-muted/50 p-3 rounded-md">
                <p className="text-xs text-muted-foreground">{lead.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button size="sm" className="flex-1">
                <Mail className="w-4 h-4 mr-1" />
                Send email
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <Calendar className="w-4 h-4 mr-1" />
                Book møde
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
