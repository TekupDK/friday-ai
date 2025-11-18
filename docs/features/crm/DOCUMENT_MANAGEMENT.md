# Document Management - CRM Module

**Author:** Development Team  
**Last Updated:** 2025-11-17  
**Version:** 1.0.0

## Overview

The Document Management feature provides comprehensive file upload, storage, and management capabilities for customer documents in the CRM module. It integrates with Supabase Storage for reliable file storage and includes features like upload progress tracking, file validation, and automatic cleanup.

**Key Features:**

- ✅ File upload to Supabase Storage
- ✅ Upload progress indicator
- ✅ File validation (size and type)
- ✅ Automatic file deletion from storage
- ✅ Document metadata management
- ✅ Centralized constants configuration

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │ DocumentUploader │  │  DocumentList    │           │
│  │                  │  │                  │           │
│  │ - File selection │  │ - Document grid  │           │
│  │ - Progress bar   │  │ - Search/filter  │           │
│  │ - Validation     │  │ - Delete action  │           │
│  └──────────────────┘  └──────────────────┘           │
│           │                      │                      │
│           └──────────┬───────────┘                      │
│                      │                                   │
│              ┌───────▼────────┐                         │
│              │  Constants     │                         │
│              │  - STORAGE      │                         │
│              │  - PRICING      │                         │
│              └───────┬─────────┘                         │
└──────────────────────┼──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                    Backend Layer                         │
│  ┌──────────────────────────────────────────────┐     │
│  │  tRPC Endpoints                               │     │
│  │  - createDocument                             │     │
│  │  - listDocuments                              │     │
│  │  - deleteDocument                             │     │
│  └──────────────────────────────────────────────┘     │
│                       │                                  │
│              ┌────────▼─────────┐                        │
│              │  Database       │                        │
│              │  (Metadata)      │                        │
│              └──────────────────┘                        │
└───────────────────────┬──────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────┐
│              Supabase Storage Layer                       │
│  ┌──────────────────────────────────────────────┐        │
│  │  Bucket: customer-documents                 │        │
│  │  - File storage                             │        │
│  │  - Public URLs                              │        │
│  │  - Automatic cleanup                        │        │
│  └──────────────────────────────────────────────┘        │
└───────────────────────────────────────────────────────────┘
```

### Data Flow

**Upload Flow:**

1. User selects file in `DocumentUploader`
2. File validated using `STORAGE` constants
3. File uploaded to Supabase Storage bucket
4. Progress tracked and displayed (10% → 90% → 95% → 100%)
5. Public URL retrieved from Supabase
6. Metadata saved to database via tRPC `createDocument`
7. Cache invalidated, UI updated

**Delete Flow:**

1. User clicks delete in `DocumentList`
2. tRPC `deleteDocument` mutation called
3. Metadata deleted from database
4. File path extracted from storage URL
5. File deleted from Supabase Storage
6. Cache invalidated, UI updated

## Constants System

### Storage Constants (`client/src/constants/storage.ts`)

Centralized configuration for file uploads and storage operations.

**Configuration:**

```typescript
export const STORAGE = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  BUCKET_NAME: "customer-documents",
  ALLOWED_TYPES: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    // ... more types
  ],
  CACHE_CONTROL: "3600",
} as const;
```

**Validation Functions:**

- `validateFileSize(size: number)` - Validates file size
- `validateFileType(type: string)` - Validates MIME type
- `validateFile(file: File)` - Validates both size and type

**Usage:**

```typescript
import { STORAGE, validateFile } from "@/constants/storage";

// Validate before upload
const validation = validateFile(selectedFile);
if (!validation.valid) {
  toast.error(validation.error);
  return;
}

// Use constants
const bucketName = STORAGE.BUCKET_NAME;
const maxSize = STORAGE.MAX_FILE_SIZE;
```

### Pricing Constants (`client/src/constants/pricing.ts`)

Centralized pricing configuration for reports and calculations.

**Configuration:**

```typescript
export const PRICING = {
  HOURLY_RATE: 349, // DKK per hour (faktureret)
  LABOR_COST: 90, // DKK per hour (løn)
} as const;
```

**Helper Functions:**

- `calculateRevenue(billableHours: number)` - Calculate revenue
- `calculateLaborCost(billableHours: number)` - Calculate labor cost
- `calculateProfit(billableHours: number)` - Calculate profit
- `calculateProfitMargin(billableHours: number)` - Calculate margin %

**Usage:**

```typescript
import { PRICING, calculateProfit } from "@/constants/pricing";

const revenue = billableHours * PRICING.HOURLY_RATE;
const profit = calculateProfit(billableHours);
```

## API Reference

### `crm.extensions.createDocument`

**Purpose:** Create document metadata record after file upload

**Input:**

```typescript
{
  customerProfileId: number;
  filename: string;
  storageUrl: string; // Supabase Storage public URL
  filesize: number; // bytes
  mimeType: string;
  category?: string;
  description?: string;
  tags?: string[];
}
```

**Output:**

```typescript
CustomerDocument {
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
```

**Example:**

```typescript
const createMutation = trpc.crm.extensions.createDocument.useMutation({
  onSuccess: () => {
    toast.success("Document uploaded successfully");
    utils.crm.extensions.listDocuments.invalidate();
  },
});

await createMutation.mutateAsync({
  customerProfileId: 123,
  filename: "contract.pdf",
  storageUrl: "https://...supabase.co/.../contract.pdf",
  filesize: 1024000,
  mimeType: "application/pdf",
  category: "contract",
  tags: ["important", "signed"],
});
```

### `crm.extensions.listDocuments`

**Purpose:** List documents for a customer

**Input:**

```typescript
{
  customerProfileId: number;
  category?: string;
  limit?: number; // Default: 50, Max: 100
  offset?: number; // Default: 0
}
```

**Output:**

```typescript
CustomerDocument[]
```

**Example:**

```typescript
const { data: documents } = trpc.crm.extensions.listDocuments.useQuery({
  customerProfileId: 123,
  category: "contract",
  limit: 20,
});
```

### `crm.extensions.deleteDocument`

**Purpose:** Delete document metadata and file from storage

**Input:**

```typescript
{
  id: number;
}
```

**Output:**

```typescript
{
  success: boolean;
  storageUrl: string; // URL for file deletion
}
```

**Example:**

```typescript
const deleteMutation = trpc.crm.extensions.deleteDocument.useMutation({
  onSuccess: async result => {
    // Also delete from Supabase Storage
    if (result.storageUrl && supabase) {
      const filePath = extractPathFromUrl(result.storageUrl);
      await supabase.storage.from("customer-documents").remove([filePath]);
    }
    toast.success("Document deleted");
  },
});

await deleteMutation.mutateAsync({ id: 456 });
```

## Implementation Details

### Upload Progress Indicator

The upload progress is simulated since Supabase Storage SDK doesn't provide native progress callbacks. Progress updates occur at key points:

- **10%** - Upload started
- **90%** - Upload completed
- **95%** - Public URL retrieved
- **100%** - Metadata saved

**Implementation:**

```typescript
const [uploadProgress, setUploadProgress] = useState(0);

// During upload
setUploadProgress(10);
await supabase.storage.from(bucket).upload(filePath, file);
setUploadProgress(90);
const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
setUploadProgress(95);
await createMutation.mutateAsync({ ... });
setUploadProgress(100);
```

**UI Component:**

```typescript
{uploading && uploadProgress > 0 && (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-sm">
      <span>Uploading...</span>
      <span>{uploadProgress}%</span>
    </div>
    <div className="w-full bg-muted rounded-full h-2">
      <div
        className="bg-primary h-2 rounded-full transition-all"
        style={{ width: `${uploadProgress}%` }}
        role="progressbar"
        aria-valuenow={uploadProgress}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  </div>
)}
```

### File Deletion from Supabase Storage

When a document is deleted, both the metadata and the actual file are removed:

**Implementation:**

```typescript
const deleteMutation = trpc.crm.extensions.deleteDocument.useMutation({
  onSuccess: async result => {
    if (result.storageUrl && supabase) {
      // Extract file path from URL
      // Format: https://[project].supabase.co/storage/v1/object/public/customer-documents/documents/[path]
      const url = new URL(result.storageUrl);
      const pathParts = url.pathname.split("/");
      const bucketIndex = pathParts.indexOf("customer-documents");

      if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
        const filePath = pathParts.slice(bucketIndex + 1).join("/");
        await supabase.storage.from("customer-documents").remove([filePath]);
      }
    }
  },
});
```

**Error Handling:**

- If storage deletion fails, metadata is still deleted
- Warning logged to console
- User notified via toast

### File Validation

Files are validated before upload using centralized validation:

```typescript
import { validateFile } from "@/constants/storage";

const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid file");
      return;
    }
    setSelectedFile(file);
  }
};
```

**Validation Rules:**

- **Size:** Maximum 10MB (configurable via `STORAGE.MAX_FILE_SIZE`)
- **Type:** Must be in `STORAGE.ALLOWED_TYPES` list
- **Error Messages:** Clear, user-friendly messages

## Usage Examples

### Basic Upload

```typescript
import { DocumentUploader } from "@/components/crm/DocumentUploader";

function CustomerDetail({ customerId }: { customerId: number }) {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <>
      <button onClick={() => setUploadOpen(true)}>
        Upload Document
      </button>
      <DocumentUploader
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        customerProfileId={customerId}
      />
    </>
  );
}
```

### List Documents with Search

```typescript
import { DocumentList } from "@/components/crm/DocumentList";

function CustomerDocuments({ customerId }: { customerId: number }) {
  return <DocumentList customerProfileId={customerId} />;
}
```

### Custom Validation

```typescript
import {
  STORAGE,
  validateFileSize,
  validateFileType,
} from "@/constants/storage";

function customValidation(file: File): string | null {
  const sizeCheck = validateFileSize(file.size);
  if (!sizeCheck.valid) {
    return sizeCheck.error;
  }

  // Custom type check
  if (!file.name.endsWith(".pdf")) {
    return "Only PDF files are allowed";
  }

  return null;
}
```

## Troubleshooting

### Upload Fails with "Bucket not found"

**Problem:** Supabase Storage bucket doesn't exist

**Solution:**

1. Create bucket in Supabase Dashboard:
   - Go to Storage → Create bucket
   - Name: `customer-documents`
   - Public: Yes (for public URLs)
2. Set bucket policies:
   - Allow authenticated users to upload
   - Allow public read access

### Progress Bar Not Showing

**Problem:** Upload progress indicator doesn't appear

**Solution:**

- Check that `uploading` state is `true`
- Verify `uploadProgress > 0`
- Check browser console for errors
- Ensure progress updates are called in correct order

### File Not Deleted from Storage

**Problem:** Metadata deleted but file remains in Supabase

**Solution:**

- Check that `storageUrl` is valid
- Verify file path extraction logic
- Check Supabase Storage permissions
- Review browser console for errors

### Validation Errors

**Problem:** Valid files are rejected

**Solution:**

- Check `STORAGE.ALLOWED_TYPES` includes your file type
- Verify file size is under `STORAGE.MAX_FILE_SIZE`
- Check MIME type detection (browser-dependent)
- Review validation error messages

### TypeScript Errors

**Problem:** Type errors with constants

**Solution:**

- Ensure constants are imported correctly
- Use type assertions if needed: `(STORAGE.ALLOWED_TYPES as readonly string[])`
- Check that `as const` is used in constant definitions

## Best Practices

1. **Always validate files before upload** - Use `validateFile()` function
2. **Handle errors gracefully** - Show user-friendly messages
3. **Clean up on delete** - Always delete from storage when metadata is deleted
4. **Use constants** - Don't hardcode values, use `STORAGE` and `PRICING` constants
5. **Progress feedback** - Always show progress for long operations
6. **Error logging** - Log errors to console for debugging

## Related Documentation

- [CRM Module Overview](./README.md)
- [Constants System](../constants/README.md)
- [Supabase Integration](../../integrations/Supabase.md)
- [API Reference](../../../API_REFERENCE.md)
