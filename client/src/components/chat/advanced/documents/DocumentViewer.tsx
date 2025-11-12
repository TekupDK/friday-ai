import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Image,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Printer,
  Share2,
  Copy,
  Eye,
  EyeOff,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  File,
  FileImage,
  FileVideo,
  FileAudio,
  Archive,
} from "lucide-react";

export interface DocumentViewerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  document?: {
    id: string;
    title: string;
    type:
      | "pdf"
      | "image"
      | "text"
      | "spreadsheet"
      | "presentation"
      | "video"
      | "audio"
      | "archive"
      | "unknown";
    url: string;
    size?: string;
    lastModified?: Date;
    pages?: number;
    thumbnail?: string;
    metadata?: Record<string, any>;
  };
  content?: string;
  isLoading?: boolean;
  error?: string;
  onDownload?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onRotate?: () => void;
  onSearch?: (query: string) => void;
  onPageChange?: (page: number) => void;
  currentPage?: number;
  totalPages?: number;
  zoom?: number;
  className?: string;
}

const documentTypeIcons = {
  pdf: FileText,
  image: FileImage,
  text: FileText,
  spreadsheet: File,
  presentation: File,
  video: FileVideo,
  audio: FileAudio,
  archive: Archive,
  unknown: File,
};

const documentTypeColors = {
  pdf: "text-red-500",
  image: "text-blue-500",
  text: "text-gray-500",
  spreadsheet: "text-green-500",
  presentation: "text-orange-500",
  video: "text-purple-500",
  audio: "text-pink-500",
  archive: "text-yellow-500",
  unknown: "text-gray-500",
};

export function DocumentViewer({
  document,
  content,
  isLoading = false,
  error,
  onDownload,
  onPrint,
  onShare,
  onZoomIn,
  onZoomOut,
  onRotate,
  onSearch,
  onPageChange,
  currentPage = 1,
  totalPages = 1,
  zoom = 100,
  className,
  ...props
}: DocumentViewerProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showToolbar, setShowToolbar] = React.useState(true);
  const [rotation, setRotation] = React.useState(0);

  const handleRotate = () => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    onRotate?.();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange?.(page);
    }
  };

  const TypeIcon = document?.type ? documentTypeIcons[document.type] : File;
  const typeColor = document?.type
    ? documentTypeColors[document.type]
    : "text-gray-500";

  if (error) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center h-96 border border-destructive/20 rounded-lg bg-destructive/5",
          className
        )}
        {...props}
      >
        <FileText className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold text-destructive mb-2">
          Fejl ved indlæsning
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          {error}
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Prøv igen
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center h-96 border border-border rounded-lg",
          className
        )}
        {...props}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Indlæser dokument...</p>
        </div>
      </div>
    );
  }

  if (!document && !content) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center h-96 border border-border rounded-lg bg-muted/10",
          className
        )}
        {...props}
      >
        <FileText className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
          Intet dokument valgt
        </h3>
        <p className="text-sm text-muted-foreground text-center">
          Vælg et dokument for at se indholdet
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full border border-border rounded-lg bg-background",
        className
      )}
      {...props}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <TypeIcon className={cn("w-6 h-6", typeColor)} />
          <div>
            <h3 className="font-semibold text-sm truncate max-w-xs">
              {document?.title || "Uden titel"}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {document?.size && <span>{document.size}</span>}
              {document?.lastModified && (
                <>
                  <span>•</span>
                  <span>
                    {document.lastModified.toLocaleDateString("da-DK")}
                  </span>
                </>
              )}
              {document?.pages && document.pages > 1 && (
                <>
                  <span>•</span>
                  <span>{document.pages} sider</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowToolbar(!showToolbar)}
          >
            {showToolbar ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>

          <Button variant="ghost" size="sm" onClick={onDownload}>
            <Download className="w-4 h-4" />
          </Button>

          <Button variant="ghost" size="sm" onClick={onShare}>
            <Share2 className="w-4 h-4" />
          </Button>

          <Button variant="ghost" size="sm" onClick={onPrint}>
            <Printer className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-between p-3 border-b border-border bg-background">
          <div className="flex items-center gap-2">
            {/* Navigation */}
            {totalPages > 1 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <span className="text-sm px-2">
                  {currentPage} af {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}

            <Separator orientation="vertical" className="h-6" />

            {/* Zoom */}
            <Button variant="outline" size="sm" onClick={onZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>

            <span className="text-sm px-2 min-w-[60px] text-center">
              {zoom}%
            </span>

            <Button variant="outline" size="sm" onClick={onZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={handleRotate}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Søg i dokument..."
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                className="pl-9 pr-3 py-1 text-sm border border-border rounded-md w-48 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {document?.type === "image" && document.url ? (
          <div className="h-full flex items-center justify-center bg-muted/10">
            <img
              src={document.url}
              alt={document.title}
              className="max-w-full max-h-full object-contain"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transition: "transform 0.2s ease-in-out",
              }}
            />
          </div>
        ) : document?.type === "pdf" ? (
          <div className="h-full flex items-center justify-center bg-muted/10">
            <div className="text-center">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">PDF Viewer</h3>
              <p className="text-sm text-muted-foreground mb-4">
                PDF visning kræver integration med en PDF viewer komponent
              </p>
              <Button onClick={onDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        ) : content ? (
          <ScrollArea className="h-full">
            <div
              className="p-6 prose prose-sm max-w-none"
              style={{
                fontSize: `${zoom / 100}rem`,
                transform: `rotate(${rotation}deg)`,
                transformOrigin: "center",
                transition: "transform 0.2s ease-in-out",
              }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </ScrollArea>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <TypeIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Dokument type ikke understøttet
              </h3>
              <p className="text-sm text-muted-foreground">
                Dette dokument type kan ikke vises direkte
              </p>
              <Button className="mt-4" onClick={onDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {document?.metadata && Object.keys(document.metadata).length > 0 && (
        <div className="p-3 border-t border-border bg-muted/30">
          <div className="flex flex-wrap gap-2">
            {Object.entries(document.metadata).map(([key, value]) => (
              <Badge key={key} variant="outline" className="text-xs">
                {key}: {String(value)}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
