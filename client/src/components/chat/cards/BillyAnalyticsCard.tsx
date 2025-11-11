/**
 * BILLY ANALYTICS CARD - Revenue analytics og dashboard
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, Users, FileText, Calendar, BarChart3 } from "lucide-react";
import { useState } from "react";

export interface AnalyticsData {
  period: 'month' | 'quarter' | 'year';
  revenue: {
    current: number;
    previous: number;
    growth: number;
  };
  invoices: {
    sent: number;
    paid: number;
    overdue: number;
  };
  customers: {
    total: number;
    new: number;
    active: number;
  };
  topProducts?: Array<{
    sku: string;
    name: string;
    revenue: number;
    quantity: number;
  }>;
}

interface BillyAnalyticsCardProps {
  data?: AnalyticsData;
  onExport?: (format: 'pdf' | 'excel') => void;
  onRefresh?: () => void;
  onPeriodChange?: (period: AnalyticsData['period']) => void;
}

export function BillyAnalyticsCard({ 
  data,
  onExport,
  onRefresh,
  onPeriodChange 
}: BillyAnalyticsCardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsData['period']>('month');

  // Default analytics data
  const defaultData: AnalyticsData = {
    period: selectedPeriod,
    revenue: {
      current: 125000,
      previous: 98000,
      growth: 27.6
    },
    invoices: {
      sent: 45,
      paid: 38,
      overdue: 7
    },
    customers: {
      total: 127,
      new: 12,
      active: 89
    },
    topProducts: [
      { sku: 'REN-001', name: 'Standard Rengøring', revenue: 45000, quantity: 90 },
      { sku: 'REN-002', name: 'Hovedrengøring', revenue: 37500, quantity: 50 },
      { sku: 'REN-005', name: 'Serviceaftale', revenue: 30000, quantity: 12 }
    ]
  };

  const analyticsData = data || defaultData;

  const handlePeriodChange = (period: AnalyticsData['period']) => {
    setSelectedPeriod(period);
    onPeriodChange?.(period);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('da-DK') + ' kr';
  };

  const getPeriodLabel = (period: AnalyticsData['period']) => {
    switch (period) {
      case 'month': return 'Denne måned';
      case 'quarter': return 'Dette kvartal';
      case 'year': return 'Dette år';
      default: return period;
    }
  };

  return (
    <Card className="border-l-4 border-l-emerald-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Revenue Analytics</h4>
              <p className="text-xs text-muted-foreground">Billy.dk dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={onRefresh}>
              <Calendar className="w-3 h-3 mr-1" />
              Opdater
            </Button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex gap-1 p-1 rounded-lg bg-muted">
          {(['month', 'quarter', 'year'] as const).map((period) => (
            <button
              key={period}
              onClick={() => handlePeriodChange(period)}
              className={cn(
                "flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors",
                selectedPeriod === period
                  ? "bg-background shadow-sm"
                  : "hover:bg-background/50"
              )}
            >
              {getPeriodLabel(period)}
            </button>
          ))}
        </div>

        {/* Revenue Overview */}
        <div className="space-y-2">
          <h5 className="text-sm font-semibold flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Omsætning
          </h5>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
              <p className="text-xs text-emerald-600 dark:text-emerald-400">Nuværende</p>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                {formatCurrency(analyticsData.revenue.current)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400">Forrige</p>
              <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
                {formatCurrency(analyticsData.revenue.previous)}
              </p>
            </div>
            <div className={cn(
              "p-3 rounded-lg border",
              analyticsData.revenue.growth > 0
                ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
            )}>
              <p className="text-xs">Vækst</p>
              <div className="flex items-center gap-1">
                {analyticsData.revenue.growth > 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-600" />
                )}
                <p className="text-lg font-bold">
                  {Math.abs(analyticsData.revenue.growth)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Stats */}
        <div className="space-y-2">
          <h5 className="text-sm font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Fakturaer
          </h5>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-center">
              <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                {analyticsData.invoices.sent}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">Sendt</p>
            </div>
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20 text-center">
              <p className="text-lg font-bold text-green-700 dark:text-green-300">
                {analyticsData.invoices.paid}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">Betalt</p>
            </div>
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20 text-center">
              <p className="text-lg font-bold text-red-700 dark:text-red-300">
                {analyticsData.invoices.overdue}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">Forfalden</p>
            </div>
          </div>
        </div>

        {/* Customer Stats */}
        <div className="space-y-2">
          <h5 className="text-sm font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            Kunder
          </h5>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-center">
              <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                {analyticsData.customers.total}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400">Total</p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-center">
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                {analyticsData.customers.new}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">Nye</p>
            </div>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-center">
              <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                {analyticsData.customers.active}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">Aktive</p>
            </div>
          </div>
        </div>

        {/* Top Products */}
        {analyticsData.topProducts && (
          <div className="space-y-2">
            <h5 className="text-sm font-semibold">Top Produkter</h5>
            <div className="space-y-1">
              {analyticsData.topProducts.map((product, idx) => (
                <div key={product.sku} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">#{idx + 1}</span>
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatCurrency(product.revenue)}</p>
                    <p className="text-xs text-muted-foreground">{product.quantity} stk</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button onClick={() => onExport?.('pdf')} variant="outline" className="flex-1">
            <FileText className="w-4 h-4 mr-2" />
            Eksport PDF
          </Button>
          <Button onClick={() => onExport?.('excel')} variant="outline" className="flex-1">
            <BarChart3 className="w-4 h-4 mr-2" />
            Eksport Excel
          </Button>
        </div>
      </div>
    </Card>
  );
}
