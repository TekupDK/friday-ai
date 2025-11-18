/**
 * BILLY INVOICE CARD - Shortwave-inspireret
 * Oprette, opdatere, godkende, sende fakturaer
 */

import { FileText, Plus, X, Send, Check } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export interface InvoiceLineItem {
  id: string;
  description: string;
  amount: number;
}

export interface BillyInvoiceData {
  customer: string;
  date: string;
  lineItems: InvoiceLineItem[];
  total: number;
  status: "draft" | "approved" | "sent";
}

interface BillyInvoiceCardProps {
  data: BillyInvoiceData;
  onCreate?: (invoice: BillyInvoiceData) => void;
  onSend?: (invoice: BillyInvoiceData) => void;
  onCancel?: () => void;
}

export function BillyInvoiceCard({
  data: initial,
  onCreate,
  onSend,
  onCancel,
}: BillyInvoiceCardProps) {
  const [data, setData] = useState(initial);

  const addLineItem = () => {
    setData(prev => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        { id: Math.random().toString(), description: "", amount: 0 },
      ],
    }));
  };

  const updateLineItem = (
    id: string,
    field: "description" | "amount",
    value: any
  ) => {
    setData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      ),
      total: prev.lineItems.reduce(
        (sum, item) =>
          sum +
          (item.id === id && field === "amount"
            ? parseFloat(value) || 0
            : item.amount),
        0
      ),
    }));
  };

  const removeLineItem = (id: string) => {
    setData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter(item => item.id !== id),
      total: prev.lineItems
        .filter(item => item.id !== id)
        .reduce((sum, item) => sum + item.amount, 0),
    }));
  };

  return (
    <Card className="border-l-4 border-l-green-500">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Create Invoice</h4>
              <p className="text-xs text-muted-foreground">Billy.dk faktura</p>
            </div>
          </div>
          <Badge
            className={data.status === "sent" ? "bg-green-500" : "bg-gray-500"}
          >
            {data.status === "draft"
              ? "Kladde"
              : data.status === "approved"
                ? "Godkendt"
                : "Sendt"}
          </Badge>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Customer:</label>
            <Input
              value={data.customer}
              onChange={e => setData({ ...data, customer: e.target.value })}
              className="h-9 mt-1"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Date:</label>
            <Input
              type="date"
              value={data.date}
              onChange={e => setData({ ...data, date: e.target.value })}
              className="h-9 mt-1"
            />
          </div>

          <div className="border-t pt-3">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold">Line Items:</label>
              <Button size="sm" variant="ghost" onClick={addLineItem}>
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>

            <div className="space-y-2">
              {data.lineItems.map(item => (
                <div key={item.id} className="flex gap-2">
                  <Input
                    value={item.description}
                    onChange={e =>
                      updateLineItem(item.id, "description", e.target.value)
                    }
                    placeholder="Beskrivelse"
                    className="h-8 flex-1"
                  />
                  <Input
                    type="number"
                    value={item.amount}
                    onChange={e =>
                      updateLineItem(item.id, "amount", e.target.value)
                    }
                    placeholder="Beløb"
                    className="h-8 w-24"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => removeLineItem(item.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50 border-t-2 border-t-green-500">
            <span className="font-semibold">Total:</span>
            <span className="text-xl font-bold text-green-600">
              {data.total.toLocaleString("da-DK")} kr
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t">
          {data.status === "draft" && (
            <>
              <Button
                onClick={() => onCreate?.(data)}
                className="flex-1 bg-linear-to-r from-green-600 to-emerald-600"
              >
                <Check className="w-4 h-4 mr-2" />
                Create Draft
              </Button>
              <Button onClick={onCancel} variant="outline" className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </>
          )}
          {data.status === "approved" && (
            <Button
              onClick={() => onSend?.(data)}
              className="w-full bg-linear-to-r from-blue-600 to-cyan-600"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Invoice
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
