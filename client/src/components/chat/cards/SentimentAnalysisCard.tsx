import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Minus,
  BarChart3,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from "lucide-react"

export interface SentimentAnalysisCardProps extends React.HTMLAttributes<HTMLDivElement> {
  sentiments: Array<{
    id: string
    source: string
    content: string
    sentiment: 'positive' | 'negative' | 'neutral'
    confidence: number
    timestamp: string
    category?: string
  }>
  overallSentiment?: {
    positive: number
    negative: number
    neutral: number
    total: number
  }
  onRefresh?: () => void
  onViewDetails?: (sentiment: any) => void
  isLoading?: boolean
}

export function SentimentAnalysisCard({
  sentiments,
  overallSentiment,
  onRefresh,
  onViewDetails,
  isLoading = false,
  className,
  ...props
}: SentimentAnalysisCardProps) {
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return ThumbsUp
      case 'negative': return ThumbsDown
      case 'neutral': return Minus
      default: return MessageSquare
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50 dark:bg-green-950/20'
      case 'negative': return 'text-red-600 bg-red-50 dark:bg-red-950/20'
      case 'neutral': return 'text-gray-600 bg-gray-50 dark:bg-gray-950/20'
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950/20'
    }
  }

  const getSentimentBadgeColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800'
      case 'negative': return 'bg-red-100 text-red-800'
      case 'neutral': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className={cn("w-full", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            Sentiment Analysis
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            AI-drevet analyse af følelser og meninger
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Sentiment Summary */}
        {overallSentiment && (
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Overall Sentiment</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((overallSentiment.positive / overallSentiment.total) * 100)}%
                </div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <ThumbsUp className="h-3 w-3" />
                  Positive
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {Math.round((overallSentiment.neutral / overallSentiment.total) * 100)}%
                </div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Minus className="h-3 w-3" />
                  Neutral
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {Math.round((overallSentiment.negative / overallSentiment.total) * 100)}%
                </div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <ThumbsDown className="h-3 w-3" />
                  Negative
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Positive</span>
                <span>{overallSentiment.positive}</span>
              </div>
              <Progress
                value={(overallSentiment.positive / overallSentiment.total) * 100}
                className="h-2"
              />
            </div>
          </div>
        )}

        {/* Individual Sentiments */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Recent Sentiments</h4>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Analyserer sentiment...</p>
              </div>
            </div>
          ) : sentiments.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Ingen sentiment data tilgængelig</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sentiments.slice(0, 5).map((sentiment) => {
                const Icon = getSentimentIcon(sentiment.sentiment)
                return (
                  <div
                    key={sentiment.id}
                    className={cn(
                      "flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm",
                      getSentimentColor(sentiment.sentiment)
                    )}
                    onClick={() => onViewDetails?.(sentiment)}
                  >
                    <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{sentiment.source}</span>
                          <Badge className={cn("text-xs", getSentimentBadgeColor(sentiment.sentiment))}>
                            {sentiment.sentiment === 'positive' ? 'Positiv' :
                             sentiment.sentiment === 'negative' ? 'Negativ' : 'Neutral'}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {sentiment.timestamp}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {sentiment.content}
                      </p>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Confidence: {sentiment.confidence}%
                        </span>
                        {sentiment.category && (
                          <Badge variant="outline" className="text-xs">
                            {sentiment.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
