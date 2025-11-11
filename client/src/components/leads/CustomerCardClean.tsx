/**
 * Customer Card V5.1 - Clean Design 
 * Matches Friday AI design system: simple badges, muted backgrounds, clean layout
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar as CalendarIcon,
  Receipt,
  TrendingUp,
  DollarSign,
  Target,
  Clock,
  CheckCircle2,
  Star,
  Users,
  Send,
  Building
} from "lucide-react";

interface CustomerCardProps {
  lead: {
    id: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    pipeline: {
      status: string;
      stage: string;
    };
    gmail?: {
      leadSource?: string;
      date?: string;
      subject?: string;
      snippet?: string;
      body?: string;
      threadId?: string;
    };
    calendar?: {
      eventTitle?: string;
      startTime?: string;
      endTime?: string;
      duration?: number;
      serviceType?: string;
      price?: number;
      address?: string;
    };
    billy?: {
      invoiceNo?: string;
      state?: string;
      isPaid?: boolean;
      grossAmount?: number;
      dueDate?: string;
      paidDate?: string;
    };
    calculated?: {
      financial: {
        invoicedPrice: number;
        netProfit: number;
        netMargin: number;
        leadCost: number;
        roi: number;
      };
      property: {
        serviceType?: string;
        propertySize?: number;
      };
      quality: {
        dataCompleteness: number;
      };
    };
    customer?: {
      lifetimeValue: number;
      totalBookings: number;
      avgBookingValue: number;
      repeatRate: number;
    };
  };
  similarLeads?: Array<{
    id: string;
    customerName: string;
    similarity: number;
    status: string;
  }>;
  winProbability?: number;
  recommendations?: string[];
}

// Simple status colors matching your design system
const statusColors: Record<string, string> = {
  new: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  contacted: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  qualified: 'bg-green-500/10 text-green-700 dark:text-green-400',
  won: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  lost: 'bg-red-500/10 text-red-700 dark:text-red-400',
  calendar: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  paid: 'bg-green-500/10 text-green-700 dark:text-green-400',
};

const priorityColors: Record<string, string> = {
  hot: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
  warm: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
  cold: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
};

export function CustomerCard({ lead, similarLeads, winProbability, recommendations }: CustomerCardProps) {
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  
  const initials = lead.customerName.split(' ').map(n => n[0]).join('').toUpperCase();
  const quality = lead.calculated?.quality.dataCompleteness || 0;
  
  // Determine priority based on win probability
  const priority = winProbability && winProbability >= 70 ? 'hot' : 
                   winProbability && winProbability >= 40 ? 'warm' : 'cold';

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('da-DK', { 
      style: 'currency', 
      currency: 'DKK',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('da-DK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{lead.customerName}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                {lead.customerEmail && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {lead.customerEmail}
                  </span>
                )}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={cn(statusColors[lead.pipeline.status] || 'bg-muted')}>
              {lead.pipeline.stage}
            </Badge>
            {winProbability && (
              <Badge className={cn(priorityColors[priority])} variant="outline">
                {priority === 'hot' && '🔥'}
                {priority === 'warm' && '📞'}
                {priority === 'cold' && '📧'}
                {Math.round(winProbability)}%
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Contact row */}
        <div className="grid sm:grid-cols-3 gap-3 text-sm mb-4">
          {lead.customerPhone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              {lead.customerPhone}
            </div>
          )}
          {lead.gmail?.leadSource && (
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              {lead.gmail.leadSource}
            </div>
          )}
          {lead.calendar?.address && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              {lead.calendar.address}
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <div className="text-xs text-muted-foreground">Revenue</div>
            <div className="text-lg font-bold flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {formatCurrency(lead.calculated?.financial.invoicedPrice)}
            </div>
          </div>
          <div className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <div className="text-xs text-muted-foreground">Profit</div>
            <div className="text-lg font-bold">
              {formatCurrency(lead.calculated?.financial.netProfit)}
            </div>
          </div>
          <div className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <div className="text-xs text-muted-foreground">Margin</div>
            <div className="text-lg font-bold">
              {lead.calculated?.financial.netMargin.toFixed(1)}%
            </div>
          </div>
          <div className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <div className="text-xs text-muted-foreground">Data Quality</div>
            <div className="text-lg font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              {Math.round(quality)}%
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="ai">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Gmail Lead Source - Clickable */}
            {lead.gmail && (
              <div 
                onClick={() => setEmailDialogOpen(true)}
                className="p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors border border-transparent hover:border-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Email Lead</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEmailDialogOpen(true);
                    }}
                  >
                    Læs tråd →
                  </Button>
                </div>
                <div className="space-y-1 text-sm">
                  <div><strong>Fra:</strong> {lead.gmail.leadSource}</div>
                  <div><strong>Dato:</strong> {formatDate(lead.gmail.date)}</div>
                  {lead.gmail.subject && <div><strong>Emne:</strong> {lead.gmail.subject}</div>}
                  {lead.gmail.snippet && (
                    <div className="text-xs text-muted-foreground mt-2 line-clamp-2">{lead.gmail.snippet}</div>
                  )}
                </div>
              </div>
            )}

            {/* Calendar Booking */}
            {lead.calendar && (
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Calendar Booking</span>
                </div>
                <div className="space-y-1 text-sm">
                  {lead.calendar.eventTitle && <div><strong>Titel:</strong> {lead.calendar.eventTitle}</div>}
                  {lead.calendar.startTime && (
                    <div><strong>Tid:</strong> {formatDate(lead.calendar.startTime)}</div>
                  )}
                  {lead.calendar.serviceType && <div><strong>Service:</strong> {lead.calendar.serviceType}</div>}
                  {lead.calendar.price && (
                    <div><strong>Pris:</strong> {formatCurrency(lead.calendar.price)}</div>
                  )}
                </div>
              </div>
            )}

            {/* Billy Invoice */}
            {lead.billy && (
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Receipt className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Invoice</span>
                  {lead.billy.isPaid && (
                    <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 ml-auto">
                      Paid
                    </Badge>
                  )}
                </div>
                <div className="space-y-1 text-sm">
                  <div><strong>Nr:</strong> {lead.billy.invoiceNo || '-'}</div>
                  <div><strong>Amount:</strong> {formatCurrency(lead.billy.grossAmount)}</div>
                  {lead.billy.paidDate && (
                    <div><strong>Betalt:</strong> {formatDate(lead.billy.paidDate)}</div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="financial" className="space-y-3 mt-4">
            <div className="grid gap-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <span className="text-sm text-muted-foreground">Total Revenue</span>
                <span className="font-semibold">{formatCurrency(lead.calculated?.financial.invoicedPrice)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <span className="text-sm text-muted-foreground">Net Profit</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(lead.calculated?.financial.netProfit)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <span className="text-sm text-muted-foreground">Profit Margin</span>
                <span className="font-semibold">{lead.calculated?.financial.netMargin.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <span className="text-sm text-muted-foreground">Lead Cost</span>
                <span className="font-semibold">{formatCurrency(lead.calculated?.financial.leadCost)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <span className="text-sm text-muted-foreground">ROI</span>
                <span className="font-semibold">{lead.calculated?.financial.roi.toFixed(0)}%</span>
              </div>
            </div>

            {lead.customer && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="text-sm font-medium">Customer Lifetime Value</div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">LTV</span>
                      <span className="font-medium">{formatCurrency(lead.customer.lifetimeValue)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Bookings</span>
                      <span className="font-medium">{lead.customer.totalBookings}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Avg Booking</span>
                      <span className="font-medium">{formatCurrency(lead.customer.avgBookingValue)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Repeat Rate</span>
                      <span className="font-medium">{lead.customer.repeatRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-3 mt-4">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Timeline</div>
              <div className="space-y-1">
                {lead.gmail?.date && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <Mail className="w-3 h-3" />
                    Email received - {formatDate(lead.gmail.date)}
                  </div>
                )}
                {lead.calendar?.startTime && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <CalendarIcon className="w-3 h-3" />
                    Booking confirmed - {formatDate(lead.calendar.startTime)}
                  </div>
                )}
                {lead.billy?.paidDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <Receipt className="w-3 h-3" />
                    Invoice paid - {formatDate(lead.billy.paidDate)}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4 mt-4">
            {/* Win Probability */}
            {winProbability !== undefined && (
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Win Probability</span>
                  </div>
                  <span className="text-2xl font-bold">{Math.round(winProbability)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={cn(
                      "h-2 rounded-full transition-all",
                      winProbability >= 70 ? "bg-green-500" :
                      winProbability >= 40 ? "bg-orange-500" : "bg-blue-500"
                    )}
                    style={{ width: `${winProbability}%` }}
                  />
                </div>
              </div>
            )}

            {/* Recommendations */}
            {recommendations && recommendations.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Recommendations</div>
                <div className="space-y-2">
                  {recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm p-2 rounded bg-muted/30">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Similar Customers */}
            {similarLeads && similarLeads.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Similar Customers</div>
                <div className="space-y-2">
                  {similarLeads.map((similar) => (
                    <div key={similar.id} className="flex items-center justify-between p-2 rounded border hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {similar.customerName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{similar.customerName}</div>
                          <div className="text-xs text-muted-foreground">
                            {Math.round(similar.similarity)}% match
                          </div>
                        </div>
                      </div>
                      <Badge className={cn(statusColors[similar.status] || 'bg-muted')} variant="outline">
                        {similar.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Separator className="my-4" />

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm">
            <Mail className="w-4 h-4 mr-1" />
            Send email
          </Button>
          <Button variant="outline" size="sm">
            <Phone className="w-4 h-4 mr-1" />
            Ring op
          </Button>
          <Button variant="outline" size="sm">
            <CalendarIcon className="w-4 h-4 mr-1" />
            Book møde
          </Button>
          <Button variant="secondary" size="sm">
            <Send className="w-4 h-4 mr-1" />
            Send tilbud
          </Button>
        </div>
      </CardContent>

      {/* Email Thread Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Tråd
            </DialogTitle>
            <DialogDescription>
              {lead.gmail?.subject || 'Email korrespondance'}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4">
              {/* Email Header */}
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="font-semibold">{lead.gmail?.subject}</div>
                    <div className="text-sm text-muted-foreground">
                      Fra: {lead.gmail?.leadSource}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Til: {lead.customerEmail}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(lead.gmail?.date)}
                    </div>
                  </div>
                  <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400">
                    Inbound Lead
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Email Body */}
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Besked</div>
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="text-sm whitespace-pre-wrap">
                      {lead.gmail?.body || lead.gmail?.snippet || 'Ingen indhold tilgængeligt'}
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                {lead.gmail?.threadId && (
                  <div className="text-xs text-muted-foreground">
                    Thread ID: {lead.gmail.threadId}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 pt-4 border-t">
                <Button size="sm" variant="default">
                  <Mail className="w-4 h-4 mr-1" />
                  Svar
                </Button>
                <Button size="sm" variant="outline">
                  Åbn i Gmail
                </Button>
                <Button size="sm" variant="secondary">
                  <Send className="w-4 h-4 mr-1" />
                  Send tilbud
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
