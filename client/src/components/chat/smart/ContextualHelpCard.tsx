import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  HelpCircle,
  Search,
  Book,
  MessageSquare,
  Lightbulb,
  ExternalLink,
  ThumbsUp,
  ThumbsDown
} from "lucide-react"

export interface ContextualHelpCardProps extends React.HTMLAttributes<HTMLDivElement> {
  context: string
  suggestions: Array<{
    id: string
    question: string
    answer: string
    category: string
    confidence: number
    source?: string
    helpful?: boolean
  }>
  onSuggestionClick?: (suggestion: any) => void
  onSearch?: (query: string) => void
  onFeedback?: (suggestionId: string, helpful: boolean) => void
  onAskQuestion?: (question: string) => void
  isLoading?: boolean
  showSearch?: boolean
}

export function ContextualHelpCard({
  context,
  suggestions,
  onSuggestionClick,
  onSearch,
  onFeedback,
  onAskQuestion,
  isLoading = false,
  showSearch = true,
  className,
  ...props
}: ContextualHelpCardProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [customQuestion, setCustomQuestion] = React.useState("")

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearch?.(query)
  }

  const handleAskQuestion = () => {
    if (customQuestion.trim()) {
      onAskQuestion?.(customQuestion.trim())
      setCustomQuestion("")
    }
  }

  return (
    <Card className={cn("w-full", className)} {...props}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-blue-500" />
          Contextual Help
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          AI-drevet hjælp baseret på din nuværende kontekst: <strong>{context}</strong>
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        {showSearch && (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Søg i hjælp eller stil et spørgsmål..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => handleSearch(searchQuery)}
              disabled={!searchQuery.trim() || isLoading}
              className="w-full"
            >
              Søg
            </Button>
          </div>
        )}

        {/* Suggested Questions */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            Foreslåede spørgsmål
          </h4>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground">Finder relevante svar...</p>
              </div>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-6">
              <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Ingen forslag tilgængelige</p>
            </div>
          ) : (
            <div className="space-y-2">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm hover:border-primary/50 bg-card"
                  onClick={() => onSuggestionClick?.(suggestion)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium text-sm leading-tight">
                      {suggestion.question}
                    </h5>
                    <div className="flex items-center gap-2 ml-2">
                      <Badge variant="outline" className="text-xs">
                        {suggestion.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {suggestion.confidence}%
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {suggestion.answer}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {suggestion.source && (
                        <Badge variant="secondary" className="text-xs">
                          {suggestion.source}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        Var dette nyttigt?
                      </span>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          onFeedback?.(suggestion.id, true)
                        }}
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          onFeedback?.(suggestion.id, false)
                        }}
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ask Custom Question */}
        <div className="space-y-2 pt-4 border-t">
          <h4 className="font-medium text-sm">Stil dit eget spørgsmål</h4>
          <div className="flex gap-2">
            <Input
              placeholder="Hvad kan jeg hjælpe dig med?"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
              className="flex-1"
            />
            <Button
              onClick={handleAskQuestion}
              disabled={!customQuestion.trim() || isLoading}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Help Resources */}
        <div className="pt-4 border-t">
          <h4 className="font-medium text-sm mb-2">Yderligere ressourcer</h4>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              <Book className="h-3 w-3 mr-1" />
              Dokumentation
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <MessageSquare className="h-3 w-3 mr-1" />
              Support Chat
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <ExternalLink className="h-3 w-3 mr-1" />
              Video Guides
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
