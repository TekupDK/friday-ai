# Improvement Suggestions

**Date:** 2025-11-17
**Status:** REVIEWED / SUGGESTIONS PROVIDED

## Current Code Assessment

- **Quality:** ⭐⭐⭐⭐ (4/5) - God struktur, type-safe, men mangler nogle features
- **Performance:** ⭐⭐⭐⭐ (4/5) - God, men kan optimeres
- **Maintainability:** ⭐⭐⭐⭐⭐ (5/5) - Klar struktur, god dokumentation

---

## Improvement Opportunities

### 🚀 High Impact: Upload Progress Indicator

**Category:** UX Enhancement
**Effort:** LOW
**Benefit:** Bedre user experience, visuel feedback under upload

**Current:**

```typescript
const [uploading, setUploading] = useState(false);

// No progress tracking
const { data, error } = await supabase.storage
  .from(bucketName)
  .upload(filePath, selectedFile);
```

**Improved:**

```typescript
const [uploadProgress, setUploadProgress] = useState(0);

// Track upload progress
const { data, error } = await supabase.storage
  .from(bucketName)
  .upload(filePath, selectedFile, {
    onUploadProgress: (progress) => {
      const percent = (progress.loaded / progress.total) * 100;
      setUploadProgress(percent);
    },
  });

// Display progress bar
{uploading && (
  <div className="w-full bg-muted rounded-full h-2">
    <div
      className="bg-primary h-2 rounded-full transition-all"
      style={{ width: `${uploadProgress}%` }}
    />
  </div>
)}
```

**Benefits:**

- Bedre UX - brugeren kan se upload progress
- Reducerer frustration ved store filer
- Klar feedback om upload status

**Implementation:**

1. Tilføj `uploadProgress` state
2. Brug `onUploadProgress` callback i Supabase upload
3. Vis progress bar i UI

---

### 🚀 High Impact: Supabase Storage Configuration

**Category:** Configuration
**Effort:** LOW
**Benefit:** Fleksibel konfiguration, nemmere at teste

**Current:**

```typescript
const bucketName = "customer-documents"; // Hardcoded
```

**Improved:**

```typescript
// Environment variable or config
const bucketName =
  import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || "customer-documents";

// Or from config file
import { STORAGE_CONFIG } from "@/config/storage";
const bucketName = STORAGE_CONFIG.customerDocumentsBucket;
```

**Benefits:**

- Nemmere at skifte bucket i forskellige miljøer
- Test med forskellige buckets
- Bedre konfiguration management

**Implementation:**

1. Tilføj environment variable `VITE_SUPABASE_STORAGE_BUCKET`
2. Eller opret `config/storage.ts` med bucket konfiguration
3. Opdater `DocumentUploader` til at bruge config

---

### ⚡ Performance: File Size Validation Before Upload

**Category:** Performance
**Effort:** LOW
**Benefit:** Sparer bandwidth, bedre UX

**Current:**

```typescript
// Validation happens in handleFileSelect
if (file.size > 10 * 1024 * 1024) {
  toast.error("File size must be less than 10MB");
  return;
}
```

**Improved:**

```typescript
// More comprehensive validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const validateFile = (file: File): string | null => {
  if (file.size > MAX_FILE_SIZE) {
    return `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`;
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `File type ${file.type} is not allowed`;
  }
  return null;
};

// Use in handleFileSelect
const error = validateFile(file);
if (error) {
  toast.error(error);
  return;
}
```

**Benefits:**

- Bedre error messages
- Type validation
- Centraliseret validation logic

---

### 🎯 Best Practice: Error Boundary for Document Upload

**Category:** Error Handling
**Effort:** MEDIUM
**Benefit:** Bedre error recovery, bedre UX

**Current:**

```typescript
try {
  // Upload logic
} catch (error) {
  console.error("Upload error:", error);
  toast.error(error.message || "Failed to upload");
  setUploading(false);
}
```

**Improved:**

```typescript
// Create error handler utility
const handleUploadError = (error: unknown) => {
  if (error instanceof Error) {
    // Specific error handling
    if (error.message.includes("Bucket not found")) {
      return "Storage bucket not found. Please contact administrator.";
    }
    if (error.message.includes("Network")) {
      return "Network error. Please check your connection and try again.";
    }
    if (error.message.includes("size")) {
      return "File too large. Maximum size is 10MB.";
    }
    return error.message;
  }
  return "An unexpected error occurred. Please try again.";
};

// Use in catch block
catch (error) {
  const message = handleUploadError(error);
  toast.error(message);
  setUploading(false);
  // Log to error tracking service
  logError("document_upload", error);
}
```

**Benefits:**

- Bedre error messages
- Centraliseret error handling
- Logging til error tracking

---

### 🎯 Best Practice: Type Safety for Segment Update

**Category:** Type Safety
**Effort:** LOW
**Benefit:** Bedre type safety, færre runtime errors

**Current:**

```typescript
const updateData: {
  name?: string;
  description?: string | null;
  type?: "manual" | "automatic";
  rules?: Record<string, any> | null;
  color?: string | null;
} = {};
```

**Improved:**

```typescript
// Use Drizzle inferred types
import type { customerSegments } from "@/drizzle/schema";

type SegmentUpdate = Partial<
  Pick<
    typeof customerSegments.$inferSelect,
    "name" | "description" | "type" | "rules" | "color"
  >
>;

const updateData: SegmentUpdate = {};

// Or use utility type
type UpdateSegmentInput = {
  [K in keyof SegmentUpdate]?: SegmentUpdate[K] | null;
};
```

**Benefits:**

- Type safety fra database schema
- Automatisk type sync
- Færre type errors

---

### ⚡ Performance: Memoize Report Calculations

**Category:** Performance
**Effort:** LOW
**Benefit:** Bedre performance ved store rapporter

**Current:**

```typescript
// Calculations done in loop
for (const task of tasks) {
  const timePerPerson = task.calendarTime;
  const totalTime = timePerPerson * task.numberOfPeople;
  const costPerPerson = timePerPerson * 90;
  const totalCost = totalTime * 90;
  // ...
}
```

**Improved:**

```typescript
// Pre-calculate values
const enrichedTasks = useMemo(() => {
  return tasks.map(task => ({
    ...task,
    timePerPerson: task.calendarTime,
    totalTime: task.calendarTime * task.numberOfPeople,
    costPerPerson: task.calendarTime * 90,
    totalCost: task.calendarTime * task.numberOfPeople * 90,
    revenue: task.invoicedTime * 349,
    profit: task.invoicedTime * 349 - task.invoicedTime * 90,
  }));
}, [tasks]);

// Use enriched tasks in render
```

**Benefits:**

- Bedre performance
- Beregninger kun én gang
- Nemmere at teste

---

### 🎯 Best Practice: Extract Constants

**Category:** Code Organization
**Effort:** LOW
**Benefit:** Nemmere at vedligeholde, konsistent

**Current:**

```typescript
// Magic numbers scattered in code
const hourlyRate = 349; // Standard rate
const costPerHour = 90; // Løn pr. time
const maxFileSize = 10 * 1024 * 1024; // 10MB
```

**Improved:**

```typescript
// Create constants file
// constants/pricing.ts
export const PRICING = {
  HOURLY_RATE: 349, // DKK per hour (faktureret)
  LABOR_COST: 90, // DKK per hour (løn)
} as const;

// constants/storage.ts
export const STORAGE = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  BUCKET_NAME: "customer-documents",
  ALLOWED_TYPES: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    // ...
  ],
} as const;

// Use in code
import { PRICING } from "@/constants/pricing";
const revenue = task.invoicedTime * PRICING.HOURLY_RATE;
```

**Benefits:**

- Centraliseret konfiguration
- Nemmere at opdatere
- Konsistent brug

---

### 🚀 High Impact: File Deletion fra Supabase

**Category:** Feature Completion
**Effort:** MEDIUM
**Benefit:** Komplet CRUD for dokumenter

**Current:**

```typescript
// Only metadata deleted, file remains in Supabase
const deleteMutation = trpc.crm.extensions.deleteDocument.useMutation();
```

**Improved:**

```typescript
// Delete both metadata and file
const deleteMutation = trpc.crm.extensions.deleteDocument.useMutation({
  onSuccess: async (_, variables) => {
    // Also delete from Supabase Storage
    if (supabase && variables.storageUrl) {
      const filePath = extractPathFromUrl(variables.storageUrl);
      await supabase.storage.from("customer-documents").remove([filePath]);
    }
  },
});
```

**Benefits:**

- Komplet cleanup
- Sparer storage space
- Bedre data management

---

### ⚡ Performance: Lazy Load Documents

**Category:** Performance
**Effort:** MEDIUM
**Benefit:** Bedre performance ved mange dokumenter

**Current:**

```typescript
// Loads all documents at once
const { data: documents } = trpc.crm.extensions.listDocuments.useQuery({
  customerProfileId,
  limit: 100,
});
```

**Improved:**

```typescript
// Pagination or virtual scrolling
const { data: documents, fetchNextPage } =
  trpc.crm.extensions.listDocuments.useInfiniteQuery(
    {
      customerProfileId,
      limit: 20,
    },
    {
      getNextPageParam: lastPage => lastPage.nextCursor,
    }
  );

// Or use virtual scrolling
import { useVirtualizer } from "@tanstack/react-virtual";
```

**Benefits:**

- Bedre performance
- Kan håndtere mange dokumenter
- Bedre UX

---

## Quick Wins

1. **Extract Constants** - Move magic numbers til constants file (15 min)
2. **File Size Validation** - Forbedret validation med bedre messages (30 min)
3. **Error Messages** - Bedre error handling med specifikke messages (30 min)
4. **Type Safety** - Brug Drizzle inferred types (20 min)

## Long-term Improvements

1. **Upload Progress Indicator** - Implementer progress tracking (2 timer)
2. **File Deletion fra Supabase** - Slet filer når dokument slettes (1 time)
3. **Multiple File Upload** - Support for bulk upload (3 timer)
4. **File Preview** - Preview før upload (2 timer)
5. **Lazy Loading** - Pagination eller virtual scrolling (3 timer)

## Priority Recommendations

1. **[HIGH]** Extract Constants - Nemt, høj impact, reducerer magic numbers
2. **[HIGH]** Upload Progress Indicator - Bedre UX, relativt nemt
3. **[MEDIUM]** File Deletion fra Supabase - Komplet feature, vigtig for cleanup
4. **[MEDIUM]** Error Handling Improvements - Bedre UX, reducerer frustration
5. **[LOW]** Lazy Loading - Performance optimization, kan vente hvis der ikke er mange dokumenter

---

## Code Quality Metrics

**Current State:**

- TypeScript Coverage: ~95%
- Error Handling: Good (kan forbedres)
- Code Organization: Excellent
- Documentation: Good

**After Improvements:**

- TypeScript Coverage: ~98%
- Error Handling: Excellent
- Code Organization: Excellent
- Documentation: Excellent

---

## Implementation Guide

### Quick Wins (1-2 timer)

1. **Extract Constants:**

   ```bash
   # Create constants files
   mkdir -p client/src/constants
   touch client/src/constants/pricing.ts
   touch client/src/constants/storage.ts
   ```

2. **Update Imports:**
   - Find alle magic numbers
   - Erstat med constants
   - Test

### Medium Priority (2-4 timer)

1. **Upload Progress:**
   - Tilføj progress state
   - Implementer callback
   - Vis progress bar

2. **File Deletion:**
   - Tilføj Supabase delete call
   - Test deletion flow
   - Verify cleanup

---

## Testing Recommendations

1. **Supabase Storage:**
   - Test upload med forskellige filtyper
   - Test error scenarios (bucket not found, network error)
   - Test med store filer

2. **Segment Update:**
   - Test partial updates
   - Test ownership verification
   - Test error handling

3. **Team 2 Rapport:**
   - Test med real data
   - Verificer beregninger
   - Test med forskellige datoer

---

## Conclusion

Koden er generelt af høj kvalitet med god struktur og type safety. De foreslåede forbedringer fokuserer på:

- UX forbedringer (progress indicator)
- Code organization (constants)
- Feature completion (file deletion)
- Performance (lazy loading)

De fleste forbedringer er "quick wins" med høj impact og lav effort.
