import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { 
  User, Phone, Mail, MapPin, Calendar, DollarSign, 
  TrendingUp, Clock, Building, FileText, CheckCircle2, Star
} from "lucide-react";

/**
 * DESIGN 9: Lead Management CRM View
 * - Email center fungerer som mini-CRM
 * - Customer cards med all contact info
 * - Lead scoring og value estimation
 * - Communication history
 * - Quick contact actions
 */

interface LeadEmail {
  id: string;
  leadName: string;
  company?: string;
  email: string;
  phone?: string;
  address?: string;
  source: string;
  firstContact: string;
  lastContact: string;
  leadScore: number;
  estimatedValue: number;
  status: 'new' | 'contacted' | 'quoted' | 'won' | 'lost';
  serviceType: string;
  emailCount: number;
  nextAction?: string;
  notes?: string;
}

const leads: LeadEmail[] = [
  {
    id: '1',
    leadName: 'Matilde Skinneholm',
    company: 'Tech Corp ApS',
    email: 'matilde@techcorp.dk',
    phone: '+45 12 34 56 78',
    address: 'Nørrebrogade 123, 2200 København',
    source: 'Rengøring.nu',
    firstContact: '2024-11-10',
    lastContact: '22:08',
    leadScore: 95,
    estimatedValue: 40000,
    status: 'new',
    serviceType: 'Fast Rengøring',
    emailCount: 1,
    nextAction: 'Send tilbud indenfor 24 timer',
    notes: '250 m² kontor, ønsker ugentlig service'
  },
  {
    id: '2',
    leadName: 'Lars Nielsen',
    company: 'Nielsen & Co',
    email: 'lars@nielsen.dk',
    phone: '+45 98 76 54 32',
    source: 'Direct',
    firstContact: '2024-11-05',
    lastContact: 'Igår',
    leadScore: 78,
    estimatedValue: 25000,
    status: 'quoted',
    serviceType: 'Flytterengøring',
    emailCount: 4,
    nextAction: 'Follow-up på tilbud',
    notes: '3-værelses lejlighed'
  },
  {
    id: '3',
    leadName: 'Maria Hansen',
    email: 'maria@example.dk',
    phone: '+45 23 45 67 89',
    source: 'Website',
    firstContact: '2024-11-01',
    lastContact: '3 dage siden',
    leadScore: 88,
    estimatedValue: 15000,
    status: 'won',
    serviceType: 'Hovedrengøring',
    emailCount: 6,
    notes: 'Job completed, send faktura'
  }
];

const statusConfig = {
  new: { label: 'New Lead', color: 'bg-blue-500', icon: Star },
  contacted: { label: 'Contacted', color: 'bg-yellow-500', icon: Mail },
  quoted: { label: 'Quoted', color: 'bg-purple-500', icon: FileText },
  won: { label: 'Won', color: 'bg-green-500', icon: CheckCircle2 },
  lost: { label: 'Lost', color: 'bg-gray-400', icon: Clock }
};

export function EmailCenterLeadCRM() {
  const [selectedLead, setSelectedLead] = useState<LeadEmail | null>(leads[0]);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex h-[700px]">
          {/* Lead List */}
          <div className="w-[380px] border-r flex flex-col">
            <div className="border-b p-4 bg-gradient-to-r from-blue-50 to-purple-50">
              <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Lead Management
              </h3>
              <p className="text-xs text-muted-foreground">
                {leads.length} active leads • {leads.filter(l => l.status === 'new').length} nye
              </p>
            </div>

            {/* Filters */}
            <div className="border-b p-3 space-y-2">
              <div className="flex gap-2">
                <Button size="sm" variant="default" className="flex-1">All ({leads.length})</Button>
                <Button size="sm" variant="outline" className="flex-1">New (1)</Button>
                <Button size="sm" variant="outline" className="flex-1">Hot (2)</Button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              {leads.map((lead, idx) => {
                const StatusIcon = statusConfig[lead.status].icon;
                const isSelected = selectedLead?.id === lead.id;

                return (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={cn(
                      "p-4 border-b cursor-pointer transition-all",
                      isSelected && "bg-accent/50 border-l-4 border-l-primary",
                      "hover:bg-accent/30"
                    )}
                    style={{ animation: `fadeIn 0.3s ease-out ${idx * 0.05}s both` }}
                  >
                    {/* Lead Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="font-semibold text-sm">
                          {lead.leadName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm mb-0.5">{lead.leadName}</div>
                        {lead.company && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {lead.company}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{lead.source}</Badge>
                          <div className={cn("px-2 py-0.5 rounded text-xs text-white font-medium", statusConfig[lead.status].color)}>
                            {statusConfig[lead.status].label}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lead Score */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted-foreground">Score:</span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full",
                            lead.leadScore >= 90 ? "bg-green-500" : 
                            lead.leadScore >= 75 ? "bg-blue-500" : "bg-yellow-500"
                          )}
                          style={{ width: `${lead.leadScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold">{lead.leadScore}</span>
                    </div>

                    {/* Value & Service */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        {lead.estimatedValue.toLocaleString('da-DK')} kr
                      </div>
                      <div className="text-muted-foreground">
                        {lead.emailCount} emails
                      </div>
                    </div>
                  </div>
                );
              })}
            </ScrollArea>
          </div>

          {/* Lead Details & CRM */}
          <div className="flex-1 flex flex-col">
            {selectedLead ? (
              <>
                {/* Lead Profile Header */}
                <div className="border-b p-6 bg-gradient-to-br from-muted/30 to-background">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-xl font-bold">
                        {selectedLead.leadName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-1">{selectedLead.leadName}</h2>
                      {selectedLead.company && (
                        <div className="text-muted-foreground flex items-center gap-2 mb-2">
                          <Building className="h-4 w-4" />
                          {selectedLead.company}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{selectedLead.source}</Badge>
                        <Badge className={statusConfig[selectedLead.status].color}>
                          {statusConfig[selectedLead.status].label}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {selectedLead.estimatedValue.toLocaleString('da-DK')} kr
                      </div>
                      <div className="text-xs text-muted-foreground">Estimated Value</div>
                    </div>
                  </div>

                  {/* Quick Contact Actions */}
                  <div className="flex gap-2">
                    <Button size="sm" className="gap-2">
                      <Mail className="h-3.5 w-3.5" />
                      Send Email
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Phone className="h-3.5 w-3.5" />
                      Ring
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      Book Møde
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2">
                      <FileText className="h-3.5 w-3.5" />
                      Send Tilbud
                    </Button>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-6">
                  {/* Contact Information */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Kontakt Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${selectedLead.email}`} className="text-blue-600 hover:underline">
                          {selectedLead.email}
                        </a>
                      </div>
                      {selectedLead.phone && (
                        <div className="flex items-center gap-3 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a href={`tel:${selectedLead.phone}`} className="text-blue-600 hover:underline">
                            {selectedLead.phone}
                          </a>
                        </div>
                      )}
                      {selectedLead.address && (
                        <div className="flex items-center gap-3 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedLead.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Lead Details */}
                  <div className="my-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Lead Detaljer
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg border bg-muted/30">
                        <div className="text-xs text-muted-foreground mb-1">Service Type</div>
                        <div className="font-semibold">{selectedLead.serviceType}</div>
                      </div>
                      <div className="p-3 rounded-lg border bg-muted/30">
                        <div className="text-xs text-muted-foreground mb-1">Lead Score</div>
                        <div className="font-semibold text-green-600">{selectedLead.leadScore}/100</div>
                      </div>
                      <div className="p-3 rounded-lg border bg-muted/30">
                        <div className="text-xs text-muted-foreground mb-1">First Contact</div>
                        <div className="font-semibold">{selectedLead.firstContact}</div>
                      </div>
                      <div className="p-3 rounded-lg border bg-muted/30">
                        <div className="text-xs text-muted-foreground mb-1">Last Contact</div>
                        <div className="font-semibold">{selectedLead.lastContact}</div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Next Action */}
                  {selectedLead.nextAction && (
                    <div className="my-6 p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
                          <Clock className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Next Action</h4>
                          <p className="text-sm text-muted-foreground">{selectedLead.nextAction}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedLead.notes && (
                    <div className="my-6">
                      <h3 className="font-semibold mb-3">Noter</h3>
                      <div className="p-4 rounded-lg border bg-muted/30">
                        <p className="text-sm">{selectedLead.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Communication History */}
                  <div className="my-6">
                    <h3 className="font-semibold mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Historie
                      </span>
                      <Badge variant="outline">{selectedLead.emailCount} emails</Badge>
                    </h3>
                    <div className="space-y-2">
                      <div className="p-3 rounded-lg border hover:bg-accent/30 cursor-pointer transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">Tilbudsanmodning modtaget</span>
                          <span className="text-xs text-muted-foreground">{selectedLead.lastContact}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          Hej – vi vil gerne have et tilbud på rengøring...
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a lead to view CRM details
              </div>
            )}
          </div>
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.98); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </CardContent>
    </Card>
  );
}
