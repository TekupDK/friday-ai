/**
 * Invoice Cards - Minimal white cards som i Figma
 * Kompakte cards med emoji icons og status
 */

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface InvoiceCardData {
  id: string;
  company: string;
  amount: number;
  currency: string;
  dueInDays: number;
  status: 'paid' | 'pending' | 'overdue';
}

interface InvoiceCardsProps {
  invoices: InvoiceCardData[];
}

function InvoiceCard({ invoice }: { invoice: InvoiceCardData }) {
  const isOverdue = invoice.status === 'overdue';
  const isPaid = invoice.status === 'paid';

  return (
    <Card className={cn(
      "hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2",
      isOverdue && "border-red-200 dark:border-red-900/50"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Emoji icon */}
          <div className="text-2xl shrink-0">
            {isPaid ? '✅' : isOverdue ? '📄' : '📄'}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">{invoice.id}</p>
            <p className="font-semibold text-sm mb-2">{invoice.company}</p>
            <p className="text-lg font-bold mb-2">
              {invoice.amount.toLocaleString('da-DK')} {invoice.currency}
            </p>
            
            {/* Status */}
            <div className={cn(
              "flex items-center gap-1.5 text-xs",
              isOverdue ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
            )}>
              <span>{isOverdue ? '⏰' : isPaid ? '✅' : '⏰'}</span>
              <span>
                {isPaid ? 'Betalt' : 
                 isOverdue ? 'Overdue' : 
                 `${invoice.dueInDays} dage`}
              </span>
            </div>
          </div>

          {/* Warning badge for overdue */}
          {isOverdue && (
            <div className="shrink-0">
              <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span className="text-xs">⚠️</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function InvoiceCards({ invoices }: InvoiceCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {invoices.map((invoice, idx) => (
        <div 
          key={invoice.id}
          style={{ animationDelay: `${idx * 100}ms` }}
        >
          <InvoiceCard invoice={invoice} />
        </div>
      ))}
    </div>
  );
}
