/**
 * Friday AI Test Panel
 *
 * Interactive testing interface for A/B prompt testing
 * Quality scoring, response analysis, optimization
 */

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOpenRouter } from "@/hooks/useOpenRouter";
import { FRIDAY_PROMPTS, createPromptTest } from "@/config/friday-prompts";
import { Play, BarChart3, MessageSquare, Clock, Zap } from "lucide-react";

interface TestResult {
  variation: string;
  response: string;
  quality: {
    danishLanguage: boolean;
    professionalTone: boolean;
    businessContext: boolean;
    responseLength: boolean;
    overallScore: number;
  };
  responseTime: number;
  timestamp: Date;
}

export default function FridayTestPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>("");
  const [results, setResults] = useState<TestResult[]>([]);
  const [selectedVariation, setSelectedVariation] =
    useState<keyof typeof FRIDAY_PROMPTS.testVariations>("minimal");

  const { testPromptVariation, isLoading } = useOpenRouter();

  const runSingleTest = useCallback(
    async (
      variation: keyof typeof FRIDAY_PROMPTS.testVariations,
      testMessage: string
    ) => {
      try {
        setIsRunning(true);
        setCurrentTest(`${variation} - ${testMessage.substring(0, 30)}...`);

        const { response, quality, responseTime } = await testPromptVariation(
          variation,
          testMessage
        );

        const result: TestResult = {
          variation,
          response,
          quality,
          responseTime,
          timestamp: new Date(),
        };

        setResults(prev => [...prev, result]);
      } catch (error) {
        console.error("Test failed:", error);
      } finally {
        setIsRunning(false);
        setCurrentTest("");
      }
    },
    [testPromptVariation]
  );

  const runAllTests = useCallback(async () => {
    setIsRunning(true);
    setResults([]);

    const variations: (keyof typeof FRIDAY_PROMPTS.testVariations)[] = [
      "minimal",
      "persona",
      "taskOriented",
      "business",
    ];
    const testCases = [
      "Hej Friday, præsenter dig selv",
      "Hvad kan du hjælpe mig med i min rengøringsvirksomhed?",
      "Jeg har 3 kundeemails - opsummer dem og foreslå handlinger",
    ];

    for (const variation of variations) {
      for (const testCase of testCases) {
        await runSingleTest(variation, testCase);
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setIsRunning(false);
  }, [runSingleTest]);

  const getBestResult = useCallback(() => {
    if (results.length === 0) return null;
    return results.reduce((best, current) =>
      current.quality.overallScore > best.quality.overallScore ? current : best
    );
  }, [results]);

  const getAverageScore = useCallback(
    (variation: string) => {
      const variationResults = results.filter(r => r.variation === variation);
      if (variationResults.length === 0) return 0;
      const total = variationResults.reduce(
        (sum, r) => sum + r.quality.overallScore,
        0
      );
      return total / variationResults.length;
    },
    [results]
  );

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  const bestResult = getBestResult();

  return (
    <div className="flex flex-col h-full bg-background p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Friday AI Test Suite</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearResults}
            disabled={isRunning}
          >
            Clear
          </Button>
          <Button
            size="sm"
            onClick={runAllTests}
            disabled={isRunning || isLoading}
          >
            {isRunning ? (
              <>
                <Zap className="w-4 h-4 mr-1 animate-pulse" />
                Testing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Run All Tests
              </>
            )}
          </Button>
        </div>
      </div>

      {currentTest && (
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Running: {currentTest}
          </p>
        </div>
      )}

      {/* Quick Test */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Quick Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <select
            value={selectedVariation}
            onChange={e =>
              setSelectedVariation(
                e.target.value as keyof typeof FRIDAY_PROMPTS.testVariations
              )
            }
            className="w-full p-2 border rounded text-sm"
            disabled={isRunning}
          >
            {Object.keys(FRIDAY_PROMPTS.testVariations).map(variation => (
              <option key={variation} value={variation}>
                {variation} (Avg: {getAverageScore(variation).toFixed(1)}/4)
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            {[
              "Hej Friday, præsenter dig selv",
              "Hvad kan du hjælpe med?",
              "Opsummer kundeemails",
            ].map((test, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => runSingleTest(selectedVariation, test)}
                disabled={isRunning || isLoading}
                className="text-xs"
              >
                Test {index + 1}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {bestResult && (
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Best Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{bestResult.variation}</Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {bestResult.responseTime}ms
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageSquare className="w-3 h-3" />
                  {bestResult.response.length} chars
                </div>
              </div>

              <div className="flex gap-1">
                {[
                  { key: "danishLanguage", label: "🇩🇰" },
                  { key: "professionalTone", label: "💼" },
                  { key: "businessContext", label: "🏢" },
                  { key: "responseLength", label: "📏" },
                ].map(({ key, label }) => (
                  <Badge
                    key={key}
                    variant={
                      bestResult.quality[key as keyof typeof bestResult.quality]
                        ? "default"
                        : "outline"
                    }
                    className="text-xs"
                  >
                    {label}
                  </Badge>
                ))}
                <Badge variant="default" className="text-xs">
                  Score: {bestResult.quality.overallScore}/4
                </Badge>
              </div>

              <div className="p-2 bg-muted rounded text-xs">
                "{bestResult.response.substring(0, 150)}
                {bestResult.response.length > 150 ? "..." : ""}"
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Results */}
      <ScrollArea className="flex-1">
        <div className="space-y-3">
          {results.map((result, index) => (
            <Card key={index} className="p-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{result.variation}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {result.responseTime}ms
                    </span>
                  </div>
                  <Badge
                    variant={
                      result.quality.overallScore >= 3 ? "default" : "secondary"
                    }
                  >
                    {result.quality.overallScore}/4
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground">
                  {result.timestamp.toLocaleTimeString()}
                </div>

                <div className="text-sm p-2 bg-muted rounded">
                  "{result.response.substring(0, 200)}
                  {result.response.length > 200 ? "..." : ""}"
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
