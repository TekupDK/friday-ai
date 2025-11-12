/**
 * DOCUMENT CARD - Dokument kort
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FileText, Download, Share2, Eye, Edit } from "lucide-react";
import { useState } from "react";

export interface DocumentCardProps {
  document?: {
    id: string;
    name: string;
    type: string;
    size: string;
    lastModified: string;
    owner: string;
    shared: boolean;
    status: "draft" | "review" | "approved";
  };
  onView?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

export function DocumentCard({
  document = {
    id: "1",
    name: "Kontrakt ABC Corporation.pdf",
    type: "PDF",
    size: "2.4 MB",
    lastModified: "for 2 timer siden",
    owner: "John Smith",
    shared: true,
    status: "approved",
  },
  onView,
  onDownload,
  onShare,
}: DocumentCardProps) {
  const getStatusColor = () => {
    switch (document.status) {
      case "approved":
        return "bg-green-500";
      case "review":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="border-l-4 border-l-indigo-500">
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">{document.name}</h4>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span>{document.type}</span>
                <span>•</span>
                <span>{document.size}</span>
              </div>
            </div>
          </div>
          <Badge className={getStatusColor()}>
            {document.status === "approved"
              ? "Godkendt"
              : document.status === "review"
                ? "Til gennemsyn"
                : "Kladde"}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Ejer: {document.owner}</span>
          <span>Ændret: {document.lastModified}</span>
          {document.shared && <Badge variant="outline">Delt</Badge>}
        </div>

        <div className="flex gap-1 pt-2 border-t">
          <Button size="sm" variant="ghost" onClick={onView}>
            <Eye className="w-3 h-3 mr-1" />
            Vis
          </Button>
          <Button size="sm" variant="ghost" onClick={onDownload}>
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
          <Button size="sm" variant="ghost" onClick={onShare}>
            <Share2 className="w-3 h-3 mr-1" />
            Del
          </Button>
        </div>
      </div>
    </Card>
  );
}
