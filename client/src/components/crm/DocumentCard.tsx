/**
 * DocumentCard Component
 *
 * Card component for displaying customer documents
 */

import { Download, File, FileText, Image, Trash2, Tag } from "lucide-react";
import React from "react";

import { AppleButton, AppleCard } from "./apple-ui";

import { cn } from "@/lib/utils";

export interface DocumentData {
  id: number;
  userId: number;
  customerProfileId: number;
  filename: string;
  storageUrl: string;
  filesize: number | null;
  mimeType: string | null;
  category: string | null;
  description: string | null;
  tags: string[] | null;
  version: number | null;
  uploadedAt: string;
}

interface DocumentCardProps {
  document: DocumentData;
  onDelete?: (id: number) => void;
  onDownload?: (document: DocumentData) => void;
}

// File type icons
const getFileIcon = (mimeType: string | null) => {
  if (!mimeType) return File;
  if (mimeType.startsWith("image/")) return Image;
  if (mimeType.includes("pdf")) return FileText;
  return File;
};

// Format file size
const formatFileSize = (bytes: number | null) => {
  if (!bytes) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Format date
const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString("da-DK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

export function DocumentCard({
  document,
  onDelete,
  onDownload,
}: DocumentCardProps) {
  const FileIcon = getFileIcon(document.mimeType);

  return (
    <AppleCard variant="elevated" padding="md" hoverable>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-muted/50 rounded-lg">
            <FileIcon className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate">
              {document.filename}
            </h4>
            {document.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {document.description}
              </p>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {document.filesize !== null && (
            <span>{formatFileSize(document.filesize)}</span>
          )}
          {document.category && (
            <span className="capitalize">{document.category}</span>
          )}
          <span>{formatDate(document.uploadedAt)}</span>
        </div>

        {/* Tags */}
        {document.tags && document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {document.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          {onDownload && (
            <AppleButton
              variant="tertiary"
              size="sm"
              onClick={() => onDownload(document)}
              leftIcon={<Download className="w-3 h-3" />}
              className="flex-1"
            >
              Download
            </AppleButton>
          )}
          {onDelete && (
            <AppleButton
              variant="tertiary"
              size="sm"
              onClick={() => onDelete(document.id)}
              leftIcon={<Trash2 className="w-3 h-3" />}
            >
              Delete
            </AppleButton>
          )}
        </div>
      </div>
    </AppleCard>
  );
}
