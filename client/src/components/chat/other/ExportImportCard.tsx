import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Download,
  Upload,
  FileText,
  Database,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2,
  Save,
} from "lucide-react";

export interface ExportImportCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  exports: Array<{
    id: string;
    name: string;
    type: "data" | "settings" | "backup" | "report";
    format: "json" | "csv" | "pdf" | "xlsx";
    size: string;
    createdAt: string;
    status: "ready" | "processing" | "failed";
  }>;
  imports: Array<{
    id: string;
    name: string;
    type: "data" | "settings" | "backup";
    progress?: number;
    status: "uploading" | "processing" | "completed" | "failed";
    createdAt: string;
  }>;
  onExport?: (type: string, format: string) => void;
  onImport?: (file: File) => void;
  onDownload?: (exportId: string) => void;
  onDelete?: (exportId: string) => void;
  isLoading?: boolean;
}

export function ExportImportCard({
  exports,
  imports,
  onExport,
  onImport,
  onDownload,
  onDelete,
  isLoading = false,
  className,
  ...props
}: ExportImportCardProps) {
  const [selectedExportType, setSelectedExportType] = React.useState("data");
  const [selectedExportFormat, setSelectedExportFormat] =
    React.useState("json");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const exportTypes = [
    {
      id: "data",
      label: "Data",
      icon: Database,
      description: "Leads, kunder, opgaver",
    },
    {
      id: "settings",
      label: "Indstillinger",
      icon: Settings,
      description: "Tema, præferencer",
    },
    {
      id: "backup",
      label: "Backup",
      icon: Save,
      description: "Komplet system backup",
    },
    {
      id: "report",
      label: "Rapport",
      icon: FileText,
      description: "Analytics og rapporter",
    },
  ];

  const exportFormats = [
    { id: "json", label: "JSON", description: "Struktureret data" },
    { id: "csv", label: "CSV", description: "Regneark kompatibel" },
    { id: "xlsx", label: "Excel", description: "Microsoft Excel" },
    { id: "pdf", label: "PDF", description: "Dokument format" },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "processing":
      case "uploading":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ready":
        return "Klar";
      case "processing":
        return "Behandler";
      case "uploading":
        return "Uploader";
      case "completed":
        return "Fuldført";
      case "failed":
        return "Fejlet";
      default:
        return status;
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport?.(file);
    }
  };

  return (
    <Card className={cn("w-full", className)} {...props}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Download className="h-5 w-5 text-green-500" />
          Export & Import
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Eksporter data eller importer indstillinger
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Export Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium text-sm">Eksporter Data</h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Export Type */}
            <div className="space-y-2">
              <label className="text-xs font-medium">Type</label>
              <div className="space-y-1">
                {exportTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedExportType(type.id)}
                      className={cn(
                        "w-full flex items-center gap-2 p-2 rounded border text-left transition-all",
                        selectedExportType === type.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <div>
                        <div className="text-sm font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {type.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Export Format */}
            <div className="space-y-2">
              <label className="text-xs font-medium">Format</label>
              <div className="space-y-1">
                {exportFormats.map(format => (
                  <button
                    key={format.id}
                    onClick={() => setSelectedExportFormat(format.id)}
                    className={cn(
                      "w-full p-2 rounded border text-left transition-all",
                      selectedExportFormat === format.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="text-sm font-medium">{format.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {format.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={() => onExport?.(selectedExportType, selectedExportFormat)}
            disabled={isLoading}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Start Eksport
          </Button>
        </div>

        {/* Import Section */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium text-sm">Importer Data</h4>
          </div>

          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv,.xlsx"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Vælg Fil
            </Button>
            <p className="text-xs text-muted-foreground">
              Understøtter: JSON, CSV, Excel filer
            </p>
          </div>
        </div>

        {/* Recent Exports */}
        {exports.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-medium text-sm">Seneste Eksport</h4>
            <div className="space-y-2">
              {exports.slice(0, 3).map(exportItem => (
                <div
                  key={exportItem.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(exportItem.status)}
                    <div>
                      <div className="text-sm font-medium">
                        {exportItem.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {exportItem.size} • {exportItem.createdAt} •{" "}
                        {exportItem.format.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {exportItem.status === "ready" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDownload?.(exportItem.id)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete?.(exportItem.id)}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Imports */}
        {imports.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-medium text-sm">Aktive Imports</h4>
            <div className="space-y-2">
              {imports.map(importItem => (
                <div
                  key={importItem.id}
                  className="p-3 rounded-lg border bg-card space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(importItem.status)}
                      <span className="text-sm font-medium">
                        {importItem.name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {importItem.type}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {importItem.createdAt}
                    </span>
                  </div>

                  {importItem.progress !== undefined && (
                    <Progress value={importItem.progress} className="h-2" />
                  )}

                  <div className="text-xs text-muted-foreground">
                    Status: {getStatusText(importItem.status)}
                    {importItem.progress !== undefined &&
                      ` (${importItem.progress}%)`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
