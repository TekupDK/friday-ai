/**
 * TOOLS PANEL - ChatGPT-style tools: Search, Data Analysis, Browser, Code Interpreter
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Search,
  BarChart3,
  Globe,
  Code,
  Play,
  CheckCircle,
  Loader2,
  FileCode,
  Table,
  Image as ImageIcon,
} from "lucide-react";

export interface ToolExecution {
  id: string;
  tool: "search" | "analyze" | "browse" | "code";
  status: "running" | "completed" | "error";
  input: string;
  output?: any;
  startTime: string;
  endTime?: string;
  steps?: Array<{ label: string; status: "completed" | "active" | "pending" }>;
}

interface ToolsPanelProps {
  executions: ToolExecution[];
  onRunTool?: (tool: ToolExecution["tool"], input: string) => void;
}

export function ToolsPanel({ executions, onRunTool }: ToolsPanelProps) {
  const getToolIcon = (tool: ToolExecution["tool"]) => {
    switch (tool) {
      case "search":
        return Search;
      case "analyze":
        return BarChart3;
      case "browse":
        return Globe;
      case "code":
        return Code;
      default:
        return Play;
    }
  };

  const getToolName = (tool: ToolExecution["tool"]) => {
    switch (tool) {
      case "search":
        return "Web Search";
      case "analyze":
        return "Data Analysis";
      case "browse":
        return "Browser";
      case "code":
        return "Code Interpreter";
      default:
        return "Tool";
    }
  };

  const getStatusIcon = (status: ToolExecution["status"]) => {
    switch (status) {
      case "running":
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case "error":
        return <span className="text-xs text-red-600">Error</span>;
    }
  };

  return (
    <Card className="p-4">
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">AI Tools</h3>
          <TabsList className="h-8">
            <TabsTrigger value="all" className="text-xs">
              All
            </TabsTrigger>
            <TabsTrigger value="search" className="text-xs">
              <Search className="w-3 h-3 mr-1" />
              Search
            </TabsTrigger>
            <TabsTrigger value="analyze" className="text-xs">
              <BarChart3 className="w-3 h-3 mr-1" />
              Analyze
            </TabsTrigger>
            <TabsTrigger value="code" className="text-xs">
              <Code className="w-3 h-3 mr-1" />
              Code
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="space-y-3">
          {executions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                <Play className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Tool executions vil vises her
              </p>
            </div>
          ) : (
            executions.map(exec => {
              const ToolIcon = getToolIcon(exec.tool);

              return (
                <div key={exec.id} className="p-3 rounded-lg border space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <ToolIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {getToolName(exec.tool)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {exec.startTime}
                        </p>
                      </div>
                    </div>
                    {getStatusIcon(exec.status)}
                  </div>

                  {/* Input */}
                  <div className="p-2 rounded bg-slate-50 dark:bg-slate-900">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Input:
                    </p>
                    <p className="text-xs">{exec.input}</p>
                  </div>

                  {/* Steps */}
                  {exec.steps && exec.steps.length > 0 && (
                    <div className="space-y-1">
                      {exec.steps.map((step, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-xs"
                        >
                          {step.status === "completed" && (
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                          )}
                          {step.status === "active" && (
                            <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
                          )}
                          {step.status === "pending" && (
                            <div className="w-3 h-3 rounded-full border-2" />
                          )}
                          <span
                            className={cn(
                              step.status === "active" && "font-medium"
                            )}
                          >
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Output */}
                  {exec.output && exec.status === "completed" && (
                    <div className="pt-2 border-t">
                      {exec.tool === "analyze" && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Table className="w-4 h-4" />
                            <span>Data Analysis Complete</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/20">
                              <p className="font-medium">Rows</p>
                              <p className="text-lg font-bold text-emerald-600">
                                {exec.output.rows || 0}
                              </p>
                            </div>
                            <div className="p-2 rounded bg-blue-50 dark:bg-blue-950/20">
                              <p className="font-medium">Columns</p>
                              <p className="text-lg font-bold text-blue-600">
                                {exec.output.columns || 0}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {exec.tool === "code" && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <FileCode className="w-4 h-4" />
                            <span>Code Executed Successfully</span>
                          </div>
                          <div className="p-2 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs">
                            {exec.output.result || "Success"}
                          </div>
                        </div>
                      )}

                      {exec.tool === "search" && (
                        <div className="text-xs text-muted-foreground">
                          Found {exec.output.count || 0} results
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="search">
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Web search tool aktiveres automatisk når AI skal søge information
            </p>
          </div>
        </TabsContent>

        <TabsContent value="analyze">
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Upload data filer for analyse og visualisering
            </p>
            <Button size="sm" className="mt-4">
              <ImageIcon className="w-4 h-4 mr-2" />
              Upload Data
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="code">
          <div className="text-center py-8">
            <Code className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Code interpreter kører Python og JavaScript kode
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
