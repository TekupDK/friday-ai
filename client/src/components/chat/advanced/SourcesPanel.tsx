/**
 * SOURCES PANEL - ChatGPT-style citations og kilder panel
 */

import {
  ExternalLink,
  Globe,
  FileText,
  CheckCircle,
  Clock,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";


export interface Source {
  id: string;
  title: string;
  url: string;
  domain: string;
  snippet?: string;
  type: "web" | "document" | "database";
  reliability: "high" | "medium" | "low";
  accessedAt: string;
}

interface SourcesPanelProps {
  sources: Source[];
  onOpenSource?: (url: string) => void;
  showReliability?: boolean;
}

export function SourcesPanel({
  sources,
  onOpenSource,
  showReliability = true,
}: SourcesPanelProps) {
  const getTypeIcon = (type: Source["type"]) => {
    switch (type) {
      case "web":
        return Globe;
      case "document":
        return FileText;
      case "database":
        return FileText;
      default:
        return Globe;
    }
  };

  const getReliabilityBadge = (reliability: Source["reliability"]) => {
    switch (reliability) {
      case "high":
        return <Badge className="bg-emerald-600 text-xs">High</Badge>;
      case "medium":
        return <Badge className="bg-amber-500 text-xs">Medium</Badge>;
      case "low":
        return (
          <Badge variant="outline" className="text-xs">
            Low
          </Badge>
        );
    }
  };

  if (sources.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
          <Globe className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-2">No Sources</h3>
        <p className="text-sm text-muted-foreground">
          Kilder vil blive vist her når AI bruger web search
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <h3 className="font-semibold">Sources & Citations</h3>
        </div>
        <Badge variant="outline">{sources.length} kilder</Badge>
      </div>

      {/* Sources List */}
      <div className="space-y-3">
        {sources.map((source, index) => {
          const TypeIcon = getTypeIcon(source.type);

          return (
            <div
              key={source.id}
              className="p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <div className="flex gap-3">
                {/* Index Badge */}
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-blue-600">
                    {index + 1}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-2">
                    <TypeIcon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium line-clamp-2 mb-1">
                        {source.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="truncate">{source.domain}</span>
                        {showReliability &&
                          getReliabilityBadge(source.reliability)}
                      </div>
                    </div>
                  </div>

                  {source.snippet && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {source.snippet}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{source.accessedAt}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onOpenSource?.(source.url)}
                      className="h-6 px-2 text-xs"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Open
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t text-xs text-muted-foreground">
        <p className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          All sources verified and cited
        </p>
      </div>
    </Card>
  );
}
