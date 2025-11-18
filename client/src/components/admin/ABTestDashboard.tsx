/**
 * A/B Test Dashboard
 * Real-time monitoring and analysis of A/B tests
 */

import {
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";

export default function ABTestDashboard() {
  // Fetch active tests
  const { data: activeTests, isLoading: testsLoading } = (
    trpc as any
  ).abTestAnalytics.getActiveTests.useQuery();

  // Fetch test results for chat flow migration
  const { data: chatResults, isLoading: resultsLoading } = (
    trpc as any
  ).abTestAnalytics.getTestResults.useQuery(
    { testName: "chat_flow_migration" },
    { enabled: true, refetchInterval: 30000 } // Refresh every 30 seconds
  );

  if (testsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          A/B Test Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Monitor and analyze ongoing experiments
        </p>
      </div>

      {/* Active Tests Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTests?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently running experiments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Samples</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                (chatResults?.controlSampleSize || 0) +
                (chatResults?.variantSampleSize || 0)
              ).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Control: {chatResults?.controlSampleSize || 0} | Variant:{" "}
              {chatResults?.variantSampleSize || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Performance Impact
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chatResults?.improvementPercent
                ? `${chatResults.improvementPercent > 0 ? "+" : ""}${chatResults.improvementPercent.toFixed(1)}%`
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              Response time improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Test Details */}
      <Tabs defaultValue="chat_flow" className="w-full">
        <TabsList>
          <TabsTrigger value="chat_flow">Chat Flow Migration</TabsTrigger>
          <TabsTrigger value="streaming" disabled>
            Streaming (Coming Soon)
          </TabsTrigger>
          <TabsTrigger value="routing" disabled>
            Model Routing (Coming Soon)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat_flow" className="space-y-4">
          {resultsLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </CardContent>
            </Card>
          ) : chatResults ? (
            <>
              {/* Statistical Significance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Statistical Analysis
                  </CardTitle>
                  <CardDescription>
                    Confidence level and recommendation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Confidence Level */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Confidence Level
                      </span>
                      <Badge
                        variant={
                          chatResults.statisticalSignificance >= 0.95
                            ? "default"
                            : "secondary"
                        }
                      >
                        {(chatResults.statisticalSignificance * 100).toFixed(1)}
                        %
                      </Badge>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${chatResults.statisticalSignificance >= 0.95 ? "bg-green-500" : "bg-yellow-500"}`}
                        style={{
                          width: `${chatResults.statisticalSignificance * 100}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {chatResults.statisticalSignificance >= 0.95
                        ? "✓ Sufficient confidence to make decision"
                        : `Need ${((0.95 - chatResults.statisticalSignificance) * 100).toFixed(1)}% more confidence`}
                    </p>
                  </div>

                  {/* Recommendation */}
                  <div className="flex items-center gap-3 p-4 rounded-lg border">
                    {chatResults.recommendation === "deploy_variant" ? (
                      <>
                        <CheckCircle className="h-6 w-6 text-green-500" />
                        <div>
                          <p className="font-semibold text-green-700 dark:text-green-400">
                            Deploy Variant
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Variant shows significant improvement. Ready to
                            deploy.
                          </p>
                        </div>
                      </>
                    ) : chatResults.recommendation === "keep_control" ? (
                      <>
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                        <div>
                          <p className="font-semibold text-red-700 dark:text-red-400">
                            Keep Control
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Variant shows degradation. Keep current version.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Activity className="h-6 w-6 text-yellow-500" />
                        <div>
                          <p className="font-semibold text-yellow-700 dark:text-yellow-400">
                            Continue Testing
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Need more data to make a confident decision.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Metrics Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Control Group */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Control Group</CardTitle>
                    <CardDescription>Current implementation</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">
                          Avg Response Time
                        </span>
                        <span className="font-medium">
                          {chatResults.controlAvgResponseTime?.toFixed(0) || 0}
                          ms
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">
                          Error Rate
                        </span>
                        <span className="font-medium">
                          {((chatResults.controlErrorRate || 0) * 100).toFixed(
                            2
                          )}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Sample Size
                        </span>
                        <span className="font-medium">
                          {chatResults.controlSampleSize?.toLocaleString() || 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Variant Group */}
                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Variant Group
                      <Badge>New</Badge>
                    </CardTitle>
                    <CardDescription>New implementation</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">
                          Avg Response Time
                        </span>
                        <span className="font-medium text-primary">
                          {chatResults.variantAvgResponseTime?.toFixed(0) || 0}
                          ms
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">
                          Error Rate
                        </span>
                        <span className="font-medium">
                          {((chatResults.variantErrorRate || 0) * 100).toFixed(
                            2
                          )}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Sample Size
                        </span>
                        <span className="font-medium">
                          {chatResults.variantSampleSize?.toLocaleString() || 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold">No Test Data Available</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start collecting metrics to see results here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
