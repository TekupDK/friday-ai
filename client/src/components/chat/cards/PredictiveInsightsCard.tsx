import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Shield,
  Target,
  BarChart3,
  Users,
  DollarSign
} from "lucide-react"

export interface PredictiveInsightsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  insights: Array<{
    id: string
    type: 'opportunity' | 'risk' | 'trend' | 'action'
    title: string
    description: string
    confidence: number // 0-100
    impact: 'low' | 'medium' | 'high'
    category: string
    data?: any
  }>
  onInsightClick?: (insight: any) => void
  onGenerateReport?: () => void
  isLoading?: boolean
}

export function PredictiveInsightsCard({
  insights,
  onInsightClick,
  onGenerateReport,
  isLoading = false,
  className,
  ...props
}: PredictiveInsightsCardProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return TrendingUp
      case 'risk': return AlertTriangle
      case 'trend': return BarChart3
      case 'action': return Zap
      default: return CheckCircle
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'text-green-600'
      case 'risk': return 'text-red-600'
      case 'trend': return 'text-blue-600'
      case 'action': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  const getBgColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'bg-green-50 dark:bg-green-950/20'
      case 'risk': return 'bg-red-50 dark:bg-red-950/20'
      case 'trend': return 'bg-blue-50 dark:bg-blue-950/20'
      case 'action': return 'bg-orange-50 dark:bg-orange-950/20'
      default: return 'bg-gray-50 dark:bg-gray-950/20'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <Card className={cn("w-full", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold">Predictive Insights</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            AI-drevne indsigter og anbefalinger
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onGenerateReport}
          disabled={isLoading}
        >
          Generer Rapport
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">Analyserer data...</p>
            </div>
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Ingen nye indsigter på nuværende tidspunkt</p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight) => {
              const Icon = getIcon(insight.type)
              return (
                <div
                  key={insight.id}
                  className={cn(
                    "flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                    getBgColor(insight.type)
                  )}
                  onClick={() => onInsightClick?.(insight)}
                >
                  <div className={cn(
                    "rounded-full p-2",
                    getBgColor(insight.type)
                  )}>
                    <Icon className={cn("h-4 w-4", getColor(insight.type))} />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="outline"
                          className={cn("text-xs", getImpactColor(insight.impact))}
                        >
                          {insight.impact.toUpperCase()}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {insight.category}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {insight.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">Confidence:</span>
                        <Progress value={insight.confidence} className="w-16 h-1" />
                        <span className="text-xs font-medium">{insight.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
