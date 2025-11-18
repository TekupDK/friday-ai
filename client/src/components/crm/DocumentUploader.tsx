/**
 * DocumentUploader Component
 *
 * File upload component with Supabase Storage integration.
 * 
 * Features:
 * - File validation (size and type)
 * - Upload progress indicator
 * - Supabase Storage integration
 * - Document metadata management
 * 
 * @example
 * ```typescript
 * <DocumentUploader
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   customerProfileId={customerId}
 * />
 * ```
 */

import { Upload, X, File } from "lucide-react";
import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { AppleButton, AppleModal } from "./apple-ui";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabaseClient";
import { STORAGE, validateFile } from "@/constants/storage";

interface DocumentUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  customerProfileId: number;
}

export function DocumentUploader({
  isOpen,
  onClose,
  customerProfileId,
}: DocumentUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    tags: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();

  // Create document mutation
  const createMutation = trpc.crm.extensions.createDocument.useMutation({
    onSuccess: () => {
      utils.crm.extensions.listDocuments.invalidate({ customerProfileId });
      toast.success("Document uploaded successfully");
      handleClose();
    },
    onError: error => {
      toast.error(error.message || "Failed to upload document");
      setUploading(false);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file using centralized validation
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(validation.error || "Invalid file");
        return;
      }
      setSelectedFile(file);
      setUploadProgress(0); // Reset progress
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }

    if (!supabase) {
      toast.error("Supabase Storage is not configured");
      return;
    }

    setUploading(true);

    try {
      // 1. Upload file to Supabase Storage
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${customerProfileId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      // Note: Supabase Storage SDK doesn't support progress callbacks directly
      // We'll simulate progress for better UX
      setUploadProgress(10);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE.BUCKET_NAME)
        .upload(filePath, selectedFile, {
          cacheControl: STORAGE.CACHE_CONTROL,
          upsert: false,
        });
      
      setUploadProgress(90);

      if (uploadError) {
        // If bucket doesn't exist, try to create it or use alternative approach
        if (uploadError.message.includes("Bucket not found")) {
          toast.error(
            "Storage bucket not found. Please create 'customer-documents' bucket in Supabase Storage."
          );
          setUploading(false);
          return;
        }
        throw uploadError;
      }

      // 2. Get public URL for the uploaded file
      setUploadProgress(95);
      const {
        data: { publicUrl },
      } = supabase.storage.from(STORAGE.BUCKET_NAME).getPublicUrl(filePath);

      // 3. Parse tags
      const tags = formData.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(Boolean);

      // 4. Create document metadata
      setUploadProgress(100);
      await createMutation.mutateAsync({
        customerProfileId,
        filename: selectedFile.name,
        storageUrl: publicUrl,
        filesize: selectedFile.size,
        mimeType: selectedFile.type || "application/octet-stream",
        category: formData.category || undefined,
        description: formData.description || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to upload document. Please try again."
      );
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setFormData({ category: "", description: "", tags: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setUploading(false);
    setUploadProgress(0);
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <AppleModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Document"
      size="lg"
    >
      <div className="space-y-4">
        {/* File Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Select File *
          </label>
          {selectedFile ? (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md border border-border">
              <File className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type || "Unknown type"}
                </p>
              </div>
              <AppleButton
                variant="tertiary"
                size="sm"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                leftIcon={<X className="w-4 h-4" />}
              >
                Remove
              </AppleButton>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-md p-8 text-center cursor-pointer hover:border-primary transition-colors"
            >
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium mb-1">Click to select file</p>
              <p className="text-xs text-muted-foreground">
                Max file size: {STORAGE.MAX_FILE_SIZE / 1024 / 1024}MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept="*/*"
              />
            </div>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-2">
            Category
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={e =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
          >
            <option value="">Select category</option>
            <option value="contract">Contract</option>
            <option value="invoice">Invoice</option>
            <option value="photo">Photo</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={e =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
            rows={3}
            placeholder="Document description..."
          />
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium mb-2">
            Tags (comma-separated)
          </label>
          <input
            id="tags"
            type="text"
            value={formData.tags}
            onChange={e => setFormData({ ...formData, tags: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
            placeholder="tag1, tag2, tag3"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Separate tags with commas
          </p>
        </div>

        {/* Upload Progress */}
        {uploading && uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Uploading...</span>
              <span className="font-medium">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
                role="progressbar"
                aria-valuenow={uploadProgress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-4 border-t border-border">
          <AppleButton
            type="button"
            variant="tertiary"
            onClick={handleClose}
            disabled={uploading}
          >
            Cancel
          </AppleButton>
          <AppleButton
            onClick={handleUpload}
            loading={uploading}
            disabled={!selectedFile || uploading}
            leftIcon={<Upload className="w-4 h-4" />}
          >
            {uploading ? `Uploading... ${uploadProgress}%` : "Upload"}
          </AppleButton>
        </div>
      </div>
    </AppleModal>
  );
}

