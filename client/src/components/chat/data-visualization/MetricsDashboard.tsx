import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Activity,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Zap,
  RefreshCw
} from "lucide-react"

export interface MetricData {
  id: string
  title: string
  value: string | number
  previousValue?: string | number
  change?: number // percentage change
  changeLabel?: string
  icon?: React.ComponentType<{ className?: string }>
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  trend?: 'up' | 'down' | 'neutral'
  description?: string
  format?: 'number' | 'currency' | 'percentage' | 'time'
  metadata?: Record<string, any>
}

export interface ChartData {
  id: string
  label: string
  value: number
  color?: string
}

export interface MetricsDashboardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  metrics: MetricData[]
  layout?: 'grid' | 'masonry' | 'list'
  columns?: 1 | 2 | 3 | 4 | 6
  showTrends?: boolean
  showRefresh?: boolean
  onRefresh?: () => void
  isLoading?: boolean
  compact?: boolean
}

const metricColors = {
  default: 'text-foreground',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  danger: 'text-red-600',
  info: 'text-blue-600'
}

const metricBgColors = {
  default: 'bg-muted/50',
  success: 'bg-green-50 dark:bg-green-950/20',
  warning: 'bg-yellow-50 dark:bg-yellow-950/20',
  danger: 'bg-red-50 dark:bg-red-950/20',
  info: 'bg-blue-50 dark:bg-blue-950/20'
}

const defaultIcons = {
  revenue: DollarSign,
  users: Users,
  activity: Activity,
  target: Target,
  calendar: Calendar,
  chart: BarChart3,
  pie: PieChart,
  zap: Zap
}

function formatValue(value: string | number, format?: string): string {
  if (typeof value === 'string') return value

  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('da-DK', {
        style: 'currency',
        currency: 'DKK',
        minimumFractionDigits: 0
      }).format(value)
    case 'percentage':
      return `${value}%`
    case 'time':
      return `${value}h`
    default:
      return new Intl.NumberFormat('da-DK').format(value)
  }
}

function MetricCard({
  metric,
  showTrends = true,
  compact = false
}: {
  metric: MetricData
  showTrends?: boolean
  compact?: boolean
}) {
  const Icon = metric.icon || defaultIcons.revenue
  const colorClass = metricColors[metric.color || 'default']
  const bgColorClass = metricBgColors[metric.color || 'default']

  const trendIcon = metric.trend === 'up' ? TrendingUp :
                   metric.trend === 'down' ? TrendingDown : null

  const trendColor = metric.change && metric.change > 0 ? 'text-green-600' :
                    metric.change && metric.change < 0 ? 'text-red-600' : 'text-gray-600'

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all hover:shadow-md",
      compact ? "p-4" : "p-6"
    )}>
      <CardHeader className={cn(
        "flex flex-row items-center justify-between space-y-0 pb-2",
        compact && "pb-1"
      )}>
        <CardTitle className={cn(
          "text-sm font-medium text-muted-foreground",
          compact && "text-xs"
        )}>
          {metric.title}
        </CardTitle>
        <div className={cn(
          "rounded-full p-2",
          bgColorClass
        )}>
          <Icon className={cn(
            colorClass,
            compact ? "h-4 w-4" : "h-5 w-5"
          )} />
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-baseline space-x-2">
          <div className={cn(
            "font-bold",
            compact ? "text-2xl" : "text-3xl",
            colorClass
          )}>
            {formatValue(metric.value, metric.format)}
          </div>

          {showTrends && metric.change !== undefined && (
            <div className={cn(
              "flex items-center space-x-1",
              compact ? "text-xs" : "text-sm"
            )}>
              {trendIcon && (
                <trendIcon className={cn("h-3 w-3", trendColor)} />
              )}
              <span className={trendColor}>
                {metric.change > 0 ? '+' : ''}{metric.change}%
              </span>
            </div>
          )}
        </div>

        {metric.description && (
          <p className={cn(
            "text-muted-foreground",
            compact ? "text-xs" : "text-sm"
          )}>
            {metric.description}
          </p>
        )}

        {showTrends && metric.previousValue && (
          <div className={cn(
            "flex items-center justify-between pt-1 border-t border-border/50",
            compact && "pt-0.5"
          )}>
            <span className={cn(
              "text-muted-foreground",
              compact ? "text-xs" : "text-sm"
            )}>
              Forrige: {formatValue(metric.previousValue, metric.format)}
            </span>
            {metric.changeLabel && (
              <Badge variant="outline" className={cn(
                compact && "text-xs px-1.5 py-0.5"
              )}>
                {metric.changeLabel}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function MetricsDashboard({
  title = "Metrics Dashboard",
  subtitle,
  metrics,
  layout = 'grid',
  columns = 4,
  showTrends = true,
  showRefresh = false,
  onRefresh,
  isLoading = false,
  compact = false,
  className,
  ...props
}: MetricsDashboardProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  }

  return (
    <div className={cn("space-y-6", className)} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>

        {showRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn(
              "h-4 w-4 mr-2",
              isLoading && "animate-spin"
            )} />
            Opdater
          </Button>
        )}
      </div>

      {/* Metrics Grid */}
      <div className={cn(
        "grid gap-4",
        gridCols[columns]
      )}>
        {metrics.map((metric) => (
          <MetricCard
            key={metric.id}
            metric={metric}
            showTrends={showTrends}
            compact={compact}
          />
        ))}
      </div>

      {/* Loading State */}
      {isLoading && metrics.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Indlæser metrics...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && metrics.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Ingen metrics tilgængelige</p>
          </div>
        </div>
      )}
    </div>
  )
}
