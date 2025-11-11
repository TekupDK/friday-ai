/**
 * INVOICE CARD - Faktura kort
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FileText, Download, Send, Eye, CheckCircle } from "lucide-react";
import { useState } from "react";

export interface InvoiceCardProps {
  invoice?: {
    id: string;
    number: string;
    customer: string;
    amount: string;
    currency: string;
    status: 'draft' | 'sent' | 'paid' | 'overdue';
    dueDate: string;
    items: number;
  };
  onView?: () => void;
  onSend?: () => void;
  onDownload?: () => void;
}

export function InvoiceCard({ 
  invoice = {
    id: '1',
    number: 'INV-2024-001',
    customer: 'ABC Corporation',
    amount: '12,450',
    currency: 'DKK',
    status: 'sent',
    dueDate: 'Om 7 dage',
    items: 3
  },
  onView,
  onSend,
  onDownload
}: InvoiceCardProps) {
  const getStatusBadge = () => {
    switch (invoice.status) {
      case 'paid': return <Badge className="bg-green-500">Betalt</Badge>;
      case 'sent': return <Badge className="bg-blue-500">Sendt</Badge>;
      case 'overdue': return <Badge className="bg-red-500">Forfalden</Badge>;
      default: return <Badge variant="secondary">Kladde</Badge>;
    }
  };

  return (
    <Card className="border-l-4 border-l-emerald-500">
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">{invoice.number}</h4>
              <p className="text-xs text-muted-foreground">{invoice.customer}</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div>
            <p className="text-2xl font-bold">{invoice.amount} {invoice.currency}</p>
            <p className="text-xs text-muted-foreground">{invoice.items} linjer</p>
          </div>
          {invoice.status === 'paid' && (
            <CheckCircle className="w-8 h-8 text-green-500" />
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          Forfalder: {invoice.dueDate}
        </div>

        <div className="flex gap-1 pt-2 border-t">
          <Button size="sm" onClick={onView}>
            <Eye className="w-3 h-3 mr-1" />
            Vis
          </Button>
          {invoice.status === 'draft' && (
            <Button size="sm" variant="outline" onClick={onSend}>
              <Send className="w-3 h-3 mr-1" />
              Send
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={onDownload}>
            <Download className="w-3 h-3 mr-1" />
            PDF
          </Button>
        </div>
      </div>
    </Card>
  );
}
