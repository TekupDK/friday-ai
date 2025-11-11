import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Send, Receipt, Clock, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface QuoteRecommendation {
  basis: "actual_time" | "estimated_time" | "m2_rule" | "default";
  serviceType: string;
  isFastFirst: boolean;
  hours: number;
  hourlyRate: number;
  price: number;
  details?: {
    coeff?: number;
    m2?: number;
    baseHours?: number;
    windowsExtra?: number; // percent
    notes?: string[];
  };
}

export interface CustomerCardV5Data {
  profileKey: string;
  name: string;
  primaryEmail?: string;
  primaryPhone?: string;
  addresses: string[];
  serviceTypes: string[];
  leadSources: Record<string, number>;
  gmailThreads: string[];
  calendarEvents: number;
  quoteRecommendation: QuoteRecommendation;
}

function serviceTypeName(code?: string) {
  switch (code) {
    case "REN-001": return "Privatrengøring";
    case "REN-002": return "Hovedrengøring";
    case "REN-003": return "Flytterengøring";
    case "REN-004": return "Erhvervsrengøring";
    case "REN-005": return "Fast rengøring";
    default: return "Rengøring";
  }
}

function basisLabel(basis: QuoteRecommendation["basis"]) {
  switch (basis) {
    case "actual_time": return "Faktisk tid";
    case "estimated_time": return "Estimeret tid";
    case "m2_rule": return "m²-regel";
    default: return "Standard";
  }
}

export function CustomerCardV5({ data }: { data: CustomerCardV5Data }) {
  const { name, primaryEmail, primaryPhone, addresses, serviceTypes, leadSources, gmailThreads, calendarEvents, quoteRecommendation } = data;
  const priceStr = new Intl.NumberFormat("da-DK", { style: "currency", currency: "DKK", maximumFractionDigits: 0 }).format(quoteRecommendation.price);

  const handleSendOffer = () => {
    if (!primaryEmail) return;
    const svc = serviceTypeName(quoteRecommendation.serviceType);
    const subject = encodeURIComponent(`Tilbud – ${svc}`);
    const lines = [
      `Hej ${name.split(' ')[0] || ''},`,
      '',
      `Tak for jeres henvendelse. Her er et estimat for ${svc}:`,
      `• Grundlag: ${basisLabel(quoteRecommendation.basis)}${quoteRecommendation.isFastFirst ? ' (første gang)' : ''}`,
      `• Estimeret tid: ${quoteRecommendation.hours.toFixed(2)} timer`,
      `• Timepris: ${quoteRecommendation.hourlyRate} kr/t`,
      `• Pris (estimat): ${priceStr}`,
      ...(quoteRecommendation.details?.notes || []).map(n => `• ${n}`),
      '',
      'Skriv endelig hvis der er spørgsmål eller ændringer. \nVh Rendetalje',
    ];
    const body = encodeURIComponent(lines.join('\n'));
    window.location.href = `mailto:${primaryEmail}?subject=${subject}&body=${body}`;
  };

  // Edit Dialog state
  const [open, setOpen] = useState(false);
  const [formServiceType, setFormServiceType] = useState<string>(quoteRecommendation.serviceType);
  const [formIsFastFirst, setFormIsFastFirst] = useState<boolean>(quoteRecommendation.isFastFirst);
  const [formHours, setFormHours] = useState<number>(quoteRecommendation.hours);
  const [formHourlyRate, setFormHourlyRate] = useState<number>(quoteRecommendation.hourlyRate);
  const [formM2, setFormM2] = useState<number | undefined>(quoteRecommendation.details?.m2);
  const [formWindows, setFormWindows] = useState<boolean>((quoteRecommendation.details?.windowsExtra ?? 0) > 0);
  const [formDiscount, setFormDiscount] = useState<number>(0);

  const adjustedHours = Math.max(0, formHours * (formWindows ? 1.2 : 1));
  const previewPrice = Math.max(0, Math.round(adjustedHours * formHourlyRate - formDiscount));
  const previewPriceStr = new Intl.NumberFormat("da-DK", { style: "currency", currency: "DKK", maximumFractionDigits: 0 }).format(previewPrice);

  const handleApplyAndSend = () => {
    if (!primaryEmail) return;
    const svc = serviceTypeName(formServiceType);
    const subject = encodeURIComponent(`Tilbud – ${svc}`);
    const lines = [
      `Hej ${name.split(' ')[0] || ''},`,
      '',
      `Tak for jeres henvendelse. Her er et opdateret estimat for ${svc}:`,
      `• Grundlag: ${basisLabel(quoteRecommendation.basis)}${formIsFastFirst ? ' (første gang)' : ''}`,
      `• Estimeret tid: ${adjustedHours.toFixed(2)} timer${formWindows ? ' (inkl. +20% for vinduer)' : ''}`,
      `• Timepris: ${formHourlyRate} kr/t`,
      ...(formM2 != null ? [`• Størrelse: ${formM2} m²`] : []),
      ...(formDiscount > 0 ? [`• Rabat: ${formDiscount} kr`] : []),
      `• Pris (estimat): ${previewPriceStr}`,
      '',
      'Skriv endelig hvis der er spørgsmål eller ændringer. \nVh Rendetalje',
    ];
    const body = encodeURIComponent(lines.join('\n'));
    window.location.href = `mailto:${primaryEmail}?subject=${subject}&body=${body}`;
    setOpen(false);
  };

  return (
    <Card className="border rounded-xl shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl">{name}</CardTitle>
            <CardDescription>Customer Card V5 • Quote & Lead Sources</CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            {serviceTypes.map((s) => (
              <Badge key={s} variant="secondary">{serviceTypeName(s)}</Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{primaryEmail || "-"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{primaryPhone || "-"}</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                {addresses.length > 0 ? addresses.map((a, i) => (
                  <div key={i}>{a}</div>
                )) : <div>-</div>}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Lead Kilder</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(leadSources).map(([k, v]) => (
                <Badge key={k} variant="outline">{k}: {v}</Badge>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">Gmail tråde: {gmailThreads.length} • Kalender events: {calendarEvents}</div>
          </div>
          <div className="space-y-2 p-3 rounded-lg border bg-muted/30">
            <div className="text-sm font-medium flex items-center gap-2"><Receipt className="h-4 w-4" /> Quote Recommendation</div>
            <div className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground flex items-center gap-1">
                Grundlag
                <Popover>
                  <PopoverTrigger asChild>
                    <button aria-label="info" className="text-muted-foreground/70 hover:text-foreground">
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 text-xs">
                    {quoteRecommendation.details?.notes?.length ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {quoteRecommendation.details.notes.map((n, i) => (<li key={i}>{n}</li>))}
                      </ul>
                    ) : (
                      <div>Estimat beregnes efter: Faktisk tid → Estimeret tid → m²‑regel → Standard.</div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
              <div className="font-medium">{basisLabel(quoteRecommendation.basis)}{quoteRecommendation.isFastFirst ? " • Første gang" : ""}</div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground">Service</div>
              <div className="font-medium">{serviceTypeName(quoteRecommendation.serviceType)}{quoteRecommendation.isFastFirst ? " • Første gang" : ""}</div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground flex items-center gap-1"><Clock className="h-4 w-4" /> Timer</div>
              <div className="font-medium">{quoteRecommendation.hours.toFixed(2)} t</div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground">Timepris</div>
              <div className="font-medium">{quoteRecommendation.hourlyRate} kr/t</div>
            </div>
            <Separator className="my-2" />
            <div className="flex items-center justify-between text-base">
              <div className="font-medium">Pris (estimat)</div>
              <div className="font-semibold">{priceStr}</div>
            </div>
            {quoteRecommendation.details?.notes?.length ? (
              <ul className="mt-2 list-disc pl-5 text-xs text-muted-foreground space-y-1">
                {quoteRecommendation.details.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center gap-2">
        <Button size="sm" onClick={handleSendOffer} disabled={!primaryEmail}>
          <Send className="h-4 w-4 mr-1" /> Send tilbud
        </Button>
        <Button size="sm" variant="outline">Åbn Gmail</Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="secondary">Se detaljer / Rediger</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>Rediger estimat</DialogTitle>
              <DialogDescription>
                Tilpas service, timer, timepris, m², vinduer og rabat. Pris opdateres live.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="space-y-1.5">
                <Label>Service</Label>
                <Select value={formServiceType} onValueChange={setFormServiceType}>
                  <SelectTrigger><SelectValue placeholder="Vælg service" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REN-001">Privatrengøring</SelectItem>
                    <SelectItem value="REN-002">Hovedrengøring</SelectItem>
                    <SelectItem value="REN-003">Flytterengøring</SelectItem>
                    <SelectItem value="REN-004">Erhvervsrengøring</SelectItem>
                    <SelectItem value="REN-005">Fast rengøring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Første gang (fast)</Label>
                <div className="flex items-center gap-2 py-2">
                  <Switch checked={formIsFastFirst} onCheckedChange={setFormIsFastFirst} disabled={formServiceType !== 'REN-005'} />
                  <span className="text-xs text-muted-foreground">Kun for fast rengøring</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Timer</Label>
                <Input type="number" step="0.1" value={formHours} onChange={e => setFormHours(parseFloat(e.target.value || '0'))} />
              </div>
              <div className="space-y-1.5">
                <Label>Timepris (kr/t)</Label>
                <Input type="number" step="1" value={formHourlyRate} onChange={e => setFormHourlyRate(parseFloat(e.target.value || '0'))} />
              </div>
              <div className="space-y-1.5">
                <Label>Størrelse (m²)</Label>
                <Input type="number" step="1" value={formM2 ?? ''} placeholder="fx 120" onChange={e => setFormM2(e.target.value ? parseFloat(e.target.value) : undefined)} />
              </div>
              <div className="space-y-1.5">
                <Label>Vinduespudsning</Label>
                <div className="py-2"><Switch checked={formWindows} onCheckedChange={setFormWindows} /></div>
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Rabat (kr)</Label>
                <Input type="number" step="1" value={formDiscount} onChange={e => setFormDiscount(parseFloat(e.target.value || '0'))} />
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div className="text-sm text-muted-foreground">Pris (estimat)</div>
              <div className="text-base font-semibold">{previewPriceStr}</div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Luk</Button>
              <Button onClick={handleApplyAndSend} disabled={!primaryEmail}><Send className="h-4 w-4 mr-1" /> Anvend & Send</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
