/**
 * Customer Card V5.1 - Complete Lead Intelligence
 * 
 * Interactive customer card with:
 * - Complete financial history
 * - Service history from Calendar
 * - Lead source tracking
 * - Profit/margin analysis
 * - ChromaDB-powered recommendations
 * - Win probability prediction
 */

import React, { useState } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Calendar as CalendarIcon,
  Receipt,
  TrendingUp,
  DollarSign,
  Target,
  Clock,
  CheckCircle2,
  Star,
  Users,
  Send
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from '@/components/ui/progress';

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

export function CustomerCard({ lead, similarLeads, winProbability, recommendations }: CustomerCardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Status colors
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'won': 'bg-green-500',
      'paid': 'bg-green-600',
      'scheduled': 'bg-blue-500',
      'calendar': 'bg-blue-400',
      'proposal': 'bg-purple-500',
      'quoted': 'bg-purple-400',
      'contacted': 'bg-yellow-500',
      'inbox': 'bg-gray-400',
      'lost': 'bg-red-500',
      'dead': 'bg-gray-600',
    };
    return colors[status] || 'bg-gray-400';
  };
  
  // Win probability color
  const getWinProbabilityColor = (prob: number) => {
    if (prob >= 70) return 'text-green-600';
    if (prob >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Classification badge
  const getClassificationBadge = (prob: number) => {
    if (prob >= 70) return <Badge className="bg-red-500">🔥 HOT LEAD</Badge>;
    if (prob >= 40) return <Badge className="bg-yellow-500">📞 WARM LEAD</Badge>;
    return <Badge className="bg-blue-500">📧 COLD LEAD</Badge>;
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('da-DK', { 
      style: 'currency', 
      currency: 'DKK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('da-DK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <Card className="w-full max-w-4xl shadow-lg">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600" />
              {lead.customerName}
            </CardTitle>
            <div className="flex gap-3 mt-3 flex-wrap">
              {lead.customerEmail && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${lead.customerEmail}`} className="hover:text-blue-600">
                    {lead.customerEmail}
                  </a>
                </div>
              )}
              {lead.customerPhone && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${lead.customerPhone}`} className="hover:text-blue-600">
                    {lead.customerPhone}
                  </a>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Badge className={`${getStatusColor(lead.pipeline.status)} text-white`}>
              {lead.pipeline.status.toUpperCase()}
            </Badge>
            {winProbability !== undefined && getClassificationBadge(winProbability)}
          </div>
        </div>
        
        {/* Key Metrics Bar */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500">Revenue</div>
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(lead.calculated?.financial.invoicedPrice || 0)}
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500">Profit</div>
            <div className="text-lg font-bold text-blue-600">
              {formatCurrency(lead.calculated?.financial.netProfit || 0)}
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500">Margin</div>
            <div className="text-lg font-bold text-purple-600">
              {(lead.calculated?.financial.netMargin || 0).toFixed(1)}%
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500">Data Quality</div>
            <div className="text-lg font-bold text-indigo-600">
              {(lead.calculated?.quality.dataCompleteness || 0).toFixed(0)}%
            </div>
          </div>
        </div>
      </CardHeader>
      
      {/* Content Tabs */}
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="intelligence">AI Insights</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Lead Source */}
            {lead.gmail && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Lead Source
                </h3>
                <div className="space-y-1">
                  <p className="text-sm"><span className="font-medium">Source:</span> {lead.gmail.leadSource}</p>
                  <p className="text-sm"><span className="font-medium">Received:</span> {formatDate(lead.gmail.date)}</p>
                  {lead.gmail.subject && (
                    <p className="text-sm"><span className="font-medium">Subject:</span> {lead.gmail.subject}</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Calendar Event */}
            {lead.calendar && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-sm text-blue-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Calendar Booking
                </h3>
                <div className="space-y-1">
                  <p className="text-sm"><span className="font-medium">Service:</span> {lead.calendar.serviceType || 'N/A'}</p>
                  <p className="text-sm"><span className="font-medium">Date:</span> {formatDate(lead.calendar.startTime)}</p>
                  {lead.calendar.duration && (
                    <p className="text-sm"><span className="font-medium">Duration:</span> {lead.calendar.duration} min</p>
                  )}
                  {lead.calendar.price && (
                    <p className="text-sm"><span className="font-medium">Price:</span> {formatCurrency(lead.calendar.price)}</p>
                  )}
                  {lead.calendar.address && (
                    <p className="text-sm flex items-start gap-1">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      {lead.calendar.address}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Billy Invoice */}
            {lead.billy && (
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-sm text-green-700 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Invoice
                </h3>
                <div className="space-y-1">
                  <p className="text-sm"><span className="font-medium">Invoice #:</span> {lead.billy.invoiceNo || 'N/A'}</p>
                  <p className="text-sm">
                    <span className="font-medium">Status:</span>
                    <Badge className={`ml-2 ${lead.billy.isPaid ? 'bg-green-500' : 'bg-yellow-500'}`}>
                      {lead.billy.isPaid ? 'Paid' : lead.billy.state}
                    </Badge>
                  </p>
                  <p className="text-sm"><span className="font-medium">Amount:</span> {formatCurrency(lead.billy.grossAmount || 0)}</p>
                  {lead.billy.dueDate && (
                    <p className="text-sm"><span className="font-medium">Due:</span> {formatDate(lead.billy.dueDate)}</p>
                  )}
                  {lead.billy.paidDate && (
                    <p className="text-sm"><span className="font-medium">Paid:</span> {formatDate(lead.billy.paidDate)}</p>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-4">
            {lead.calculated?.financial && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                    <div className="text-sm text-green-700 mb-1">Total Revenue</div>
                    <div className="text-2xl font-bold text-green-800">
                      {formatCurrency(lead.calculated.financial.invoicedPrice)}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                    <div className="text-sm text-blue-700 mb-1">Net Profit</div>
                    <div className="text-2xl font-bold text-blue-800">
                      {formatCurrency(lead.calculated.financial.netProfit)}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-600 mb-1">Margin</div>
                    <div className="text-xl font-bold">{lead.calculated.financial.netMargin.toFixed(1)}%</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-600 mb-1">Lead Cost</div>
                    <div className="text-xl font-bold">{formatCurrency(lead.calculated.financial.leadCost)}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-600 mb-1">ROI</div>
                    <div className="text-xl font-bold text-green-600">{lead.calculated.financial.roi.toFixed(0)}%</div>
                  </div>
                </div>
                
                {lead.customer && (
                  <div className="bg-purple-50 rounded-lg p-4 mt-4">
                    <h3 className="font-semibold text-sm text-purple-700 mb-3">Customer Lifetime Value</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-600">Total Value</div>
                        <div className="text-lg font-bold text-purple-700">
                          {formatCurrency(lead.customer.lifetimeValue)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">Total Bookings</div>
                        <div className="text-lg font-bold text-purple-700">
                          {lead.customer.totalBookings}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">Avg Booking</div>
                        <div className="text-lg font-bold text-purple-700">
                          {formatCurrency(lead.customer.avgBookingValue)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">Repeat Rate</div>
                        <div className="text-lg font-bold text-purple-700">
                          {lead.customer.repeatRate.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-3">
            <div className="space-y-2">
              {lead.gmail && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Lead Received</div>
                    <div className="text-xs text-gray-600">{formatDate(lead.gmail.date)}</div>
                    {lead.gmail.snippet && (
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">{lead.gmail.snippet}</div>
                    )}
                  </div>
                </div>
              )}
              
              {lead.calendar && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Calendar Booking</div>
                    <div className="text-xs text-gray-600">{formatDate(lead.calendar.startTime)}</div>
                    <div className="text-xs text-gray-500 mt-1">{lead.calendar.serviceType}</div>
                  </div>
                </div>
              )}
              
              {lead.billy && (
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Invoice Created</div>
                    <div className="text-xs text-gray-600">Invoice #{lead.billy.invoiceNo}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {lead.billy.isPaid ? `Paid ${formatDate(lead.billy.paidDate)}` : `Due ${formatDate(lead.billy.dueDate)}`}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* AI Insights Tab */}
          <TabsContent value="intelligence" className="space-y-4">
            {/* Win Probability */}
            {winProbability !== undefined && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                <h3 className="font-semibold text-sm text-purple-700 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Win Probability
                </h3>
                <div className="flex items-center gap-4">
                  <div className={`text-4xl font-bold ${getWinProbabilityColor(winProbability)}`}>
                    {winProbability.toFixed(0)}%
                  </div>
                  <Progress value={winProbability} className="flex-1" />
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Based on data completeness, lead source quality, and historical patterns
                </p>
              </div>
            )}
            
            {/* Recommendations */}
            {recommendations && recommendations.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-sm text-blue-700 mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Recommended Actions
                </h3>
                <ul className="space-y-2">
                  {recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Similar Customers */}
            {similarLeads && similarLeads.length > 0 && (
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="font-semibold text-sm text-yellow-700 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Similar Customers
                </h3>
                <div className="space-y-2">
                  {similarLeads.map((sim) => (
                    <div key={sim.id} className="flex items-center justify-between text-sm bg-white rounded p-2">
                      <span className="font-medium">{sim.customerName}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{sim.similarity}% similar</Badge>
                        <Badge className={getStatusColor(sim.status)}>{sim.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Data Completeness */}
            {lead.calculated?.quality && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-sm text-gray-700 mb-3">Data Completeness</h3>
                <div className="flex items-center gap-4">
                  <Progress value={lead.calculated.quality.dataCompleteness} className="flex-1" />
                  <span className="text-lg font-bold">
                    {lead.calculated.quality.dataCompleteness.toFixed(0)}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="flex items-center gap-1 text-xs">
                    {lead.gmail ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-gray-400" />}
                    <span>Email</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    {lead.calendar ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-gray-400" />}
                    <span>Calendar</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    {lead.billy ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-gray-400" />}
                    <span>Invoice</span>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
