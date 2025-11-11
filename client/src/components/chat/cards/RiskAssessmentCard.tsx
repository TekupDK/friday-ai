import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw
} from "lucide-react"

export interface RiskAssessmentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  risks: Array<{
    id: string
    category: 'financial' | 'operational' | 'compliance' | 'reputational' | 'strategic'
    level: 'low' | 'medium' | 'high' | 'critical'
    title: string
    description: string
    impact: string
    probability: number // 0-100
    mitigation: string
    status: 'identified' | 'mitigating' | 'resolved'
    owner?: string
  }>
  overallRiskScore?: number
  onRiskClick?: (risk: any) => void
  onStartMitigation?: (id: string) => void
  onViewDetails?: (id: string) => void
  isLoading?: boolean
}

export function RiskAssessmentCard({
  risks,
  overallRiskScore,
  onRiskClick,
  onStartMitigation,
  onViewDetails,
  isLoading = false,
  className,
  ...props
}: RiskAssessmentCardProps) {
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-700 bg-red-100 dark:bg-red-950/30'
      case 'high': return 'text-orange-700 bg-orange-100 dark:bg-orange-950/30'
      case 'medium': return 'text-yellow-700 bg-yellow-100 dark:bg-yellow-950/30'
      case 'low': return 'text-green-700 bg-green-100 dark:bg-green-950/30'
      default: return 'text-gray-700 bg-gray-100 dark:bg-gray-950/30'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial': return TrendingUp
      case 'operational': return Activity
      case 'compliance': return Shield
      case 'reputational': return AlertTriangle
      case 'strategic': return Target
      default: return AlertTriangle
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'identified': return 'bg-red-500'
      case 'mitigating': return 'bg-yellow-500'
      case 'resolved': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600'
    if (score >= 60) return 'text-orange-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <Card className={cn("w-full", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" />
            Risk Assessment
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Proaktiv risikovurdering og mitigation
          </p>
        </div>
        {overallRiskScore !== undefined && (
          <div className="text-right">
            <div className={cn("text-2xl font-bold", getRiskScoreColor(overallRiskScore))}>
              {overallRiskScore}%
            </div>
            <div className="text-xs text-muted-foreground">Overall Risk Score</div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Vurderer risici...</p>
            </div>
          </div>
        ) : risks.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-muted-foreground">Ingen kritiske risici identificeret</p>
            <p className="text-sm text-muted-foreground mt-1">Alle systemer er sikre</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Risk Summary */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">
                  {risks.filter(r => r.level === 'critical').length}
                </div>
                <div className="text-xs text-muted-foreground">Kritiske</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">
                  {risks.filter(r => r.level === 'high').length}
                </div>
                <div className="text-xs text-muted-foreground">Høje</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">
                  {risks.filter(r => r.level === 'medium').length}
                </div>
                <div className="text-xs text-muted-foreground">Medium</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {risks.filter(r => r.level === 'low').length}
                </div>
                <div className="text-xs text-muted-foreground">Lave</div>
              </div>
            </div>

            {/* Individual Risks */}
            <div className="space-y-3">
              {risks.map((risk) => {
                const CategoryIcon = getCategoryIcon(risk.category)
                return (
                  <div
                    key={risk.id}
                    className="flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md bg-card"
                    onClick={() => onRiskClick?.(risk)}
                  >
                    <div className="flex-shrink-0">
                      <CategoryIcon className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{risk.title}</h4>
                          <Badge className={cn("text-xs", getRiskLevelColor(risk.level))}>
                            {risk.level.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", getStatusColor(risk.status))} />
                          <span className="text-xs text-muted-foreground capitalize">
                            {risk.status === 'identified' ? 'Identificeret' :
                             risk.status === 'mitigating' ? 'Mitigeres' : 'Løst'}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {risk.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-muted-foreground">
                            Impact: {risk.impact}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Probability:</span>
                            <Progress value={risk.probability} className="w-12 h-1" />
                            <span className="text-xs font-medium">{risk.probability}%</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              onViewDetails?.(risk.id)
                            }}
                          >
                            Detaljer
                          </Button>
                          {risk.status === 'identified' && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                onStartMitigation?.(risk.id)
                              }}
                            >
                              Mitiger
                            </Button>
                          )}
                        </div>
                      </div>

                      {risk.mitigation && (
                        <div className="pt-2 border-t border-border/50">
                          <p className="text-xs text-muted-foreground">
                            <strong>Mitigation:</strong> {risk.mitigation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
