import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Target,
  TrendingUp,
  Lightbulb,
  Zap,
  ArrowRight,
  Star
} from "lucide-react"

export interface RecommendationEngineCardProps extends React.HTMLAttributes<HTMLDivElement> {
  recommendations: Array<{
    id: string
    type: 'action' | 'improvement' | 'opportunity' | 'alert'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    title: string
    description: string
    impact: string
    effort: 'low' | 'medium' | 'high'
    category: string
    confidence: number
  }>
  onRecommendationClick?: (recommendation: any) => void
  onImplement?: (id: string) => void
  onDismiss?: (id: string) => void
  isLoading?: boolean
}

export function RecommendationEngineCard({
  recommendations,
  onRecommendationClick,
  onImplement,
  onDismiss,
  isLoading = false,
  className,
  ...props
}: RecommendationEngineCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'action': return Zap
      case 'improvement': return TrendingUp
      case 'opportunity': return Target
      case 'alert': return Lightbulb
      default: return Lightbulb
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-700 bg-red-100 dark:bg-red-950/30'
      case 'high': return 'text-orange-700 bg-orange-100 dark:bg-orange-950/30'
      case 'medium': return 'text-yellow-700 bg-yellow-100 dark:bg-yellow-950/30'
      case 'low': return 'text-blue-700 bg-blue-100 dark:bg-blue-950/30'
      default: return 'text-gray-700 bg-gray-100 dark:bg-gray-950/30'
    }
  }

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'high': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getImpactIcon = (impact: string) => {
    const stars = parseInt(impact.replace('stars', '')) || 3
    return Array.from({ length: stars }, (_, i) => (
      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
    ))
  }

  return (
    <Card className={cn("w-full", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            AI Recommendations
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Personlige anbefalinger baseret på dine data
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {recommendations.length} Anbefalinger
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">Genererer anbefalinger...</p>
            </div>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Ingen nye anbefalinger</p>
            <p className="text-sm text-muted-foreground mt-1">Kom tilbage senere for flere indsigter</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec) => {
              const Icon = getTypeIcon(rec.type)
              return (
                <div
                  key={rec.id}
                  className="flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md bg-card"
                  onClick={() => onRecommendationClick?.(rec)}
                >
                  <div className="flex-shrink-0">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge className={cn("text-xs", getPriorityColor(rec.priority))}>
                          {rec.priority === 'urgent' ? 'URGENT' : rec.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {rec.category}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {rec.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">Impact:</span>
                          <div className="flex">
                            {getImpactIcon(rec.impact)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">Effort:</span>
                          <span className={cn("text-xs font-medium", getEffortColor(rec.effort))}>
                            {rec.effort.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {rec.confidence}% confidence
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            onImplement?.(rec.id)
                          }}
                        >
                          Implementér
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDismiss?.(rec.id)
                          }}
                        >
                          Afvis
                        </Button>
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
