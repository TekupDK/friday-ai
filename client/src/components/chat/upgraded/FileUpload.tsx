/**
 * FILE UPLOAD - Full-featured
 * Drag & drop file upload med preview og progress
 */

import { useState, useRef, DragEvent } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { 
  Upload, X, FileText, Image as ImageIcon, File,
  CheckCircle2, AlertCircle
} from "lucide-react";

export interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

interface FileUploadProps {
  onUpload?: (files: File[]) => Promise<void>;
  onRemove?: (id: string) => void;
  maxFiles?: number;
  maxSize?: number; // MB
  accept?: string;
  className?: string;
}

export function FileUpload({ 
  onUpload,
  onRemove,
  maxFiles = 5,
  maxSize = 10,
  accept = "image/*,.pdf,.doc,.docx,.txt",
  className
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    await processFiles(droppedFiles);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      await processFiles(selectedFiles);
    }
  };

  const processFiles = async (newFiles: File[]) => {
    // Check file count limit
    if (files.length + newFiles.length > maxFiles) {
      alert(`Maks ${maxFiles} filer tilladt`);
      return;
    }

    // Check file sizes
    const invalidFiles = newFiles.filter(f => f.size > maxSize * 1024 * 1024);
    if (invalidFiles.length > 0) {
      alert(`Nogle filer er større end ${maxSize}MB`);
      return;
    }

    // Create upload entries
    const uploadFiles: UploadedFile[] = await Promise.all(
      newFiles.map(async (file) => ({
        id: Math.random().toString(36).substring(7),
        file,
        preview: file.type.startsWith('image/') ? await createPreview(file) : undefined,
        progress: 0,
        status: 'uploading' as const
      }))
    );

    setFiles(prev => [...prev, ...uploadFiles]);

    // Simulate upload (replace with real upload logic)
    uploadFiles.forEach(uploadFile => {
      simulateUpload(uploadFile.id);
    });

    if (onUpload) {
      try {
        await onUpload(newFiles);
      } catch (error) {
        console.error('Upload error:', error);
      }
    }
  };

  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  const simulateUpload = (id: string) => {
    const interval = setInterval(() => {
      setFiles(prev => prev.map(f => {
        if (f.id === id) {
          const newProgress = Math.min(f.progress + 10, 100);
          return {
            ...f,
            progress: newProgress,
            status: newProgress === 100 ? 'completed' : 'uploading'
          };
        }
        return f;
      }));
    }, 300);

    setTimeout(() => clearInterval(interval), 3000);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    onRemove?.(id);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return ImageIcon;
    if (file.type.includes('pdf')) return FileText;
    return File;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative rounded-xl border-2 border-dashed p-8 transition-all duration-300 cursor-pointer",
          isDragging 
            ? "border-primary bg-primary/5 scale-105" 
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        )}
      >
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all",
            "bg-linear-to-br from-blue-500 to-purple-600",
            isDragging && "scale-110"
          )}>
            <Upload className="w-8 h-8 text-white" />
          </div>
          
          <div>
            <p className="text-sm font-semibold mb-1">
              {isDragging ? "Slip filer her" : "Træk filer her eller klik for at vælge"}
            </p>
            <p className="text-xs text-muted-foreground">
              Maks {maxFiles} filer, {maxSize}MB per fil
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Understøttet: Billeder, PDF, Word, Tekst
            </p>
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((uploadFile) => (
            <FileItem
              key={uploadFile.id}
              uploadFile={uploadFile}
              onRemove={() => removeFile(uploadFile.id)}
              getFileIcon={getFileIcon}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FileItem({ 
  uploadFile, 
  onRemove,
  getFileIcon 
}: { 
  uploadFile: UploadedFile; 
  onRemove: () => void;
  getFileIcon: (file: File) => typeof FileText;
}) {
  const Icon = getFileIcon(uploadFile.file);

  return (
    <Card className="p-3 animate-in slide-in-from-bottom-2 fade-in">
      <div className="flex items-center gap-3">
        {/* Preview or Icon */}
        {uploadFile.preview ? (
          <img 
            src={uploadFile.preview} 
            alt={uploadFile.file.name}
            className="w-12 h-12 rounded-lg object-cover shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6 text-muted-foreground" />
          </div>
        )}

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
            {uploadFile.status === 'completed' && (
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
            )}
            {uploadFile.status === 'error' && (
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            )}
          </div>
          
          <p className="text-xs text-muted-foreground mb-2">
            {(uploadFile.file.size / 1024).toFixed(1)} KB
          </p>

          {/* Progress Bar */}
          {uploadFile.status === 'uploading' && (
            <Progress value={uploadFile.progress} className="h-1" />
          )}

          {uploadFile.status === 'error' && uploadFile.error && (
            <p className="text-xs text-red-600">{uploadFile.error}</p>
          )}
        </div>

        {/* Remove Button */}
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={onRemove}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
