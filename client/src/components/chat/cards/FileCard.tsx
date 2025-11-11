/**
 * FILE CARD - Fil kort
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { File, Download, Share2, Trash2, Image, FileVideo, FileAudio } from "lucide-react";
import { useState } from "react";

export interface FileCardProps {
  file?: {
    id: string;
    name: string;
    type: 'image' | 'video' | 'audio' | 'document' | 'other';
    extension: string;
    size: string;
    uploadedBy: string;
    uploadDate: string;
    thumbnail?: string;
  };
  onPreview?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
}

export function FileCard({ 
  file = {
    id: '1',
    name: 'produktbillede',
    type: 'image',
    extension: '.jpg',
    size: '1.2 MB',
    uploadedBy: 'John Smith',
    uploadDate: 'for 1 dag siden'
  },
  onPreview,
  onDownload,
  onDelete
}: FileCardProps) {
  const getIcon = () => {
    switch (file.type) {
      case 'image': return <Image className="w-5 h-5 text-white" />;
      case 'video': return <FileVideo className="w-5 h-5 text-white" />;
      case 'audio': return <FileAudio className="w-5 h-5 text-white" />;
      default: return <File className="w-5 h-5 text-white" />;
    }
  };

  const getColor = () => {
    switch (file.type) {
      case 'image': return 'bg-rose-500';
      case 'video': return 'bg-purple-600';
      case 'audio': return 'bg-emerald-600';
      default: return 'bg-slate-600';
    }
  };

  return (
    <Card className="border-l-4 border-l-rose-500">
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", getColor())}>
              {getIcon()}
            </div>
            <div>
              <h4 className="font-semibold">{file.name}{file.extension}</h4>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span>{file.size}</span>
                <span>•</span>
                <span>Uploadet af {file.uploadedBy}</span>
              </div>
            </div>
          </div>
          <Badge variant="outline">{file.type}</Badge>
        </div>

        <div className="text-xs text-muted-foreground">
          Uploadet {file.uploadDate}
        </div>

        <div className="flex gap-1 pt-2 border-t">
          <Button size="sm" onClick={onPreview}>
            Vis
          </Button>
          <Button size="sm" variant="outline" onClick={onDownload}>
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
          <Button size="sm" variant="outline" onClick={onDelete}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
