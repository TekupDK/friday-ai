/**
 * AI Analytics Dashboard
 *
 * Visual dashboard showing AI doc generation metrics:
 * - Total generated
 * - Success rate
 * - Time/cost savings
 * - Recent generations
 * - Usage trends
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import {
  TrendingUp,
  FileText,
  Clock,
  DollarSign,
  Sparkles,
  Calendar,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { da } from "date-fns/locale";

export function AIAnalyticsDashboard() {
  const { data: metrics, isLoading } = trpc.docs.getAIMetrics.useQuery();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Kunne ikke hente metrics</p>
        </CardContent>
      </Card>
    );
  }

  const savings = {
    timeSavedMinutes: metrics.totalGenerated * 29.5,
    timeSavedHours: (metrics.totalGenerated * 29.5) / 60,
    costSavedDKK: ((metrics.totalGenerated * 29.5) / 60) * 500,
    costOfAI: 0,
    netSavings: ((metrics.totalGenerated * 29.5) / 60) * 500,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          AI Documentation Analytics
        </h2>
        <p className="text-muted-foreground mt-1">
          Oversigt over AI-genererede dokumenter og besparelser
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Genereret"
          value={metrics.totalGenerated}
          icon={FileText}
          description="AI-genererede docs"
          trend="+100%"
        />
        <MetricCard
          title="Success Rate"
          value={`${metrics.successRate}%`}
          icon={CheckCircle2}
          description="Vellykkede generationer"
          trend="Excellent"
          trendColor="text-green-600"
        />
        <MetricCard
          title="Tid Sparet"
          value={`${savings.timeSavedHours.toFixed(1)}t`}
          icon={Clock}
          description={`${savings.timeSavedMinutes.toFixed(0)} minutter total`}
          trend={`vs ${(metrics.totalGenerated * 30) / 60}t manuel`}
        />
        <MetricCard
          title="Omkostninger"
          value="0 kr"
          icon={DollarSign}
          description="OpenRouter FREE model"
          trend="100% gratis!"
          trendColor="text-green-600"
        />
      </div>

      {/* Time Period Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Generering Over Tid
          </CardTitle>
          <CardDescription>
            Antal AI-genererede docs per tidsperiode
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <TimeMetric
              label="I Dag"
              value={metrics.generatedToday}
              total={metrics.totalGenerated}
            />
            <TimeMetric
              label="Denne Uge"
              value={metrics.generatedThisWeek}
              total={metrics.totalGenerated}
            />
            <TimeMetric
              label="Denne Måned"
              value={metrics.generatedThisMonth}
              total={metrics.totalGenerated}
            />
          </div>
        </CardContent>
      </Card>

      {/* Savings Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Økonomiske Besparelser
          </CardTitle>
          <CardDescription>Estimeret værdi af AI automation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">
                  Manuel tid sparet
                </p>
                <p className="text-2xl font-bold">
                  {savings.timeSavedHours.toFixed(1)} timer
                </p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Værd i besparelser
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {savings.costSavedDKK.toLocaleString("da-DK")} kr
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Baseret på 500 kr/time konsulent rate
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
              <div>
                <p className="text-sm text-primary">AI omkostninger</p>
                <p className="text-2xl font-bold text-primary">0 kr</p>
                <p className="text-xs text-muted-foreground mt-1">
                  OpenRouter FREE model (z-ai/glm-4.5-air:free)
                </p>
              </div>
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Leads */}
      {metrics.topLeads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Leads</CardTitle>
            <CardDescription>
              Leads med flest genererede dokumenter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.topLeads.map((lead, index) => (
                <div
                  key={lead.leadName}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono">
                      #{index + 1}
                    </Badge>
                    <span className="font-medium">{lead.leadName}</span>
                  </div>
                  <Badge variant="secondary">{lead.docCount} docs</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Generations */}
      {metrics.recentGenerations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Seneste Generationer
            </CardTitle>
            <CardDescription>
              De {metrics.recentGenerations.length} seneste AI-genererede docs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.recentGenerations.map(doc => (
                <div
                  key={doc.docId}
                  className="flex items-start justify-between p-3 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                  onClick={() => {
                    window.location.href = `/docs?view=${doc.docId}`;
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">
                        {format(doc.createdAt, "dd. MMM yyyy 'kl.' HH:mm", {
                          locale: da,
                        })}
                      </p>
                      {doc.tags.includes("ai-generated") && (
                        <Badge variant="outline" className="text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendColor = "text-muted-foreground",
}: {
  title: string;
  value: string | number;
  icon: any;
  description: string;
  trend?: string;
  trendColor?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {trend && (
          <p className={`text-xs mt-2 font-medium ${trendColor}`}>{trend}</p>
        )}
      </CardContent>
    </Card>
  );
}

function TimeMetric({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary rounded-full h-2 transition-all"
          style={{ width: `${Math.min(parseFloat(percentage), 100)}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{percentage}% af total</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-64" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
