/**
 * ATTACHMENT PREVIEW - File upload og preview
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Paperclip,
  Upload,
  X,
  File,
  Image,
  FileText,
  Download,
  Eye,
  Trash2,
} from "lucide-react";
import { useState, useRef } from "react";

export interface AttachmentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  preview?: string;
  uploadProgress?: number;
  status: "pending" | "uploading" | "completed" | "error";
}

interface AttachmentPreviewProps {
  files?: AttachmentFile[];
  onUpload?: (files: File[]) => void;
  onRemove?: (fileId: string) => void;
  onDownload?: (fileId: string) => void;
  onPreview?: (fileId: string) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
}

export function AttachmentPreview({
  files = [],
  onUpload,
  onRemove,
  onDownload,
  onPreview,
  maxFiles = 5,
  maxSize = 10,
}: AttachmentPreviewProps) {
  const [attachments, setAttachments] = useState<AttachmentFile[]>(files);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (fileList: FileList) => {
    const newFiles = Array.from(fileList);

    // Check max files limit
    if (attachments.length + newFiles.length > maxFiles) {
      alert(`Maksimalt ${maxFiles} filer tilladt`);
      return;
    }

    const processedFiles: AttachmentFile[] = [];

    for (const file of newFiles) {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        alert(
          `Filen ${file.name} er for stor. Maksimal størrelse er ${maxSize}MB`
        );
        continue;
      }

      const attachment: AttachmentFile = {
        id: Math.random().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        status: "pending",
      };

      // Generate preview for images
      if (file.type.startsWith("image/")) {
        attachment.preview = URL.createObjectURL(file);
      }

      processedFiles.push(attachment);
    }

    const updatedAttachments = [...attachments, ...processedFiles];
    setAttachments(updatedAttachments);

    // Simulate upload
    processedFiles.forEach((attachment, index) => {
      setTimeout(() => {
        setAttachments(prev =>
          prev.map(a =>
            a.id === attachment.id
              ? { ...a, status: "uploading" as const, uploadProgress: 0 }
              : a
          )
        );

        // Simulate progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 30;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setAttachments(prev =>
              prev.map(a =>
                a.id === attachment.id
                  ? { ...a, status: "completed" as const, uploadProgress: 100 }
                  : a
              )
            );
          } else {
            setAttachments(prev =>
              prev.map(a =>
                a.id === attachment.id ? { ...a, uploadProgress: progress } : a
              )
            );
          }
        }, 200);
      }, index * 100);
    });

    onUpload?.(newFiles);
  };

  const removeFile = (fileId: string) => {
    setAttachments(prev => prev.filter(a => a.id !== fileId));
    onRemove?.(fileId);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return Image;
    if (
      type.includes("pdf") ||
      type.includes("document") ||
      type.includes("text")
    )
      return FileText;
    return File;
  };

  const getFileColor = (type: string) => {
    if (type.startsWith("image/")) return "bg-green-500";
    if (type.includes("pdf")) return "bg-red-500";
    if (type.includes("document") || type.includes("text"))
      return "bg-blue-500";
    if (type.includes("spreadsheet")) return "bg-emerald-500";
    if (type.includes("presentation")) return "bg-orange-500";
    return "bg-gray-500";
  };

  const getStatusColor = (status: AttachmentFile["status"]) => {
    switch (status) {
      case "pending":
        return "text-gray-500";
      case "uploading":
        return "text-blue-500";
      case "completed":
        return "text-green-500";
      case "error":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusLabel = (status: AttachmentFile["status"]) => {
    switch (status) {
      case "pending":
        return "Afventer";
      case "uploading":
        return "Uploader";
      case "completed":
        return "Fuldført";
      case "error":
        return "Fejl";
      default:
        return status;
    }
  };

  return (
    <Card className="border-l-4 border-l-orange-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-md">
              <Paperclip className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Attachment Preview</h4>
              <p className="text-xs text-muted-foreground">
                File upload og preview
              </p>
            </div>
          </div>
          <Badge className="bg-orange-500">
            {attachments.length}/{maxFiles} filer
          </Badge>
        </div>

        {/* Upload Area */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
            dragActive
              ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {dragActive ? "Slip filer her" : "Træk og slip filer her"}
          </p>
          <p className="text-xs text-gray-500 mb-3">eller</p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="sm"
          >
            <Paperclip className="w-4 h-4 mr-2" />
            Vælg filer
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
          <p className="text-xs text-gray-500 mt-3">
            Maks {maxFiles} filer • Maks {maxSize}MB pr. fil
          </p>
        </div>

        {/* Files List */}
        {attachments.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h5 className="text-sm font-semibold">Uploadede filer:</h5>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setAttachments([])}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Ryd alle
              </Button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {attachments.map(file => {
                const Icon = getFileIcon(file.type);
                return (
                  <div
                    key={file.id}
                    className="p-3 rounded-lg bg-background border border-border"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center text-white",
                          getFileColor(file.type)
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                getStatusColor(file.status)
                              )}
                            >
                              {getStatusLabel(file.status)}
                            </Badge>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removeFile(file.id)}
                              className="h-6 w-6"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Upload Progress */}
                        {file.status === "uploading" &&
                          file.uploadProgress !== undefined && (
                            <div className="mt-2">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-muted-foreground">
                                  Uploader...
                                </span>
                                <span className="text-xs font-medium">
                                  {Math.round(file.uploadProgress)}%
                                </span>
                              </div>
                              <Progress
                                value={file.uploadProgress}
                                className="h-1"
                              />
                            </div>
                          )}

                        {/* Preview for images */}
                        {file.preview && file.status === "completed" && (
                          <div className="mt-2">
                            <img
                              src={file.preview}
                              alt={file.name}
                              className="max-w-full h-20 object-cover rounded border"
                            />
                          </div>
                        )}

                        {/* Actions */}
                        {file.status === "completed" && (
                          <div className="flex gap-1 mt-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onPreview?.(file.id)}
                              className="h-7 px-2"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Preview
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDownload?.(file.id)}
                              className="h-7 px-2"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upload Stats */}
        {attachments.length > 0 && (
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20 text-center">
              <p className="font-bold text-green-700 dark:text-green-300">
                {attachments.filter(f => f.status === "completed").length}
              </p>
              <p className="text-green-600 dark:text-green-400">Fuldført</p>
            </div>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-center">
              <p className="font-bold text-blue-700 dark:text-blue-300">
                {attachments.filter(f => f.status === "uploading").length}
              </p>
              <p className="text-blue-600 dark:text-blue-400">Uploader</p>
            </div>
            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-center">
              <p className="font-bold text-orange-700 dark:text-orange-300">
                {formatFileSize(
                  attachments.reduce((sum, f) => sum + f.size, 0)
                )}
              </p>
              <p className="text-orange-600 dark:text-orange-400">
                Total størrelse
              </p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
          <div className="flex items-start gap-2">
            <Paperclip className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <div className="text-xs text-orange-700 dark:text-orange-400">
              <p className="font-semibold mb-1">Upload features:</p>
              <ul className="space-y-1">
                <li>• Træk og drop filer direkte</li>
                <li>• Image preview for billeder</li>
                <li>• Real-time upload progress</li>
                <li>• Support for multiple filer</li>
                <li>• File type og størrelse validering</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 bg-linear-to-r from-orange-600 to-red-600"
            disabled={attachments.length >= maxFiles}
          >
            <Paperclip className="w-4 h-4 mr-2" />
            Tilføj filer
          </Button>
          <Button variant="outline" className="flex-1">
            <Upload className="w-4 h-4 mr-2" />
            Upload alle
          </Button>
        </div>
      </div>
    </Card>
  );
}
