# Constants System - CRM Module

**Author:** Development Team  
**Last Updated:** 2025-11-17  
**Version:** 1.0.0

## Overview

The Constants System provides centralized configuration and helper functions for the CRM module. It eliminates magic numbers, improves maintainability, and ensures consistency across the codebase.

**Key Benefits:**
- ✅ Single source of truth for configuration
- ✅ Type-safe constants
- ✅ Reusable helper functions
- ✅ Easy to update and maintain
- ✅ Better code organization

## Structure

```
client/src/constants/
├── pricing.ts    # Pricing configuration and calculations
└── storage.ts    # Storage configuration and validation
```

## Storage Constants

**Location:** `client/src/constants/storage.ts`

### Configuration

```typescript
export const STORAGE = {
  /** Maximum file size in bytes (10MB) */
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  
  /** Supabase Storage bucket name */
  BUCKET_NAME: "customer-documents",
  
  /** Allowed MIME types for upload */
  ALLOWED_TYPES: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    // ... more types
  ],
  
  /** Cache control header value */
  CACHE_CONTROL: "3600",
} as const;
```

### Validation Functions

#### `validateFileSize(size: number)`

Validates file size against maximum allowed size.

**Parameters:**
- `size` (number): File size in bytes

**Returns:**
```typescript
{ valid: boolean; error?: string }
```

**Example:**
```typescript
import { validateFileSize } from "@/constants/storage";

const result = validateFileSize(5 * 1024 * 1024); // 5MB
if (!result.valid) {
  console.error(result.error); // "File size must be less than 10MB"
}
```

#### `validateFileType(type: string)`

Validates MIME type against allowed types.

**Parameters:**
- `type` (string): MIME type (e.g., "application/pdf")

**Returns:**
```typescript
{ valid: boolean; error?: string }
```

**Example:**
```typescript
import { validateFileType } from "@/constants/storage";

const result = validateFileType("application/pdf");
if (!result.valid) {
  console.error(result.error);
}
```

#### `validateFile(file: File)`

Validates both file size and type.

**Parameters:**
- `file` (File): File object from input

**Returns:**
```typescript
{ valid: boolean; error?: string }
```

**Example:**
```typescript
import { validateFile } from "@/constants/storage";

const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }
    // File is valid, proceed with upload
  }
};
```

## Pricing Constants

**Location:** `client/src/constants/pricing.ts`

### Configuration

```typescript
export const PRICING = {
  /** Hourly rate charged to customers (faktureret) */
  HOURLY_RATE: 349, // DKK per hour
  
  /** Labor cost per hour (løn) */
  LABOR_COST: 90, // DKK per hour per person
} as const;
```

### Calculation Functions

#### `calculateRevenue(billableHours: number)`

Calculates revenue from billable hours.

**Parameters:**
- `billableHours` (number): Total billable hours

**Returns:** `number` - Revenue in DKK

**Example:**
```typescript
import { calculateRevenue } from "@/constants/pricing";

const revenue = calculateRevenue(4); // 4 hours
console.log(revenue); // 1396 DKK (4 × 349)
```

#### `calculateLaborCost(billableHours: number)`

Calculates labor cost from billable hours.

**Parameters:**
- `billableHours` (number): Total billable hours

**Returns:** `number` - Labor cost in DKK

**Example:**
```typescript
import { calculateLaborCost } from "@/constants/pricing";

const cost = calculateLaborCost(4); // 4 hours
console.log(cost); // 360 DKK (4 × 90)
```

#### `calculateProfit(billableHours: number)`

Calculates profit (revenue - labor cost).

**Parameters:**
- `billableHours` (number): Total billable hours

**Returns:** `number` - Profit in DKK

**Example:**
```typescript
import { calculateProfit } from "@/constants/pricing";

const profit = calculateProfit(4); // 4 hours
console.log(profit); // 1036 DKK (1396 - 360)
```

#### `calculateProfitMargin(billableHours: number)`

Calculates profit margin percentage.

**Parameters:**
- `billableHours` (number): Total billable hours

**Returns:** `number` - Margin percentage (0-100)

**Example:**
```typescript
import { calculateProfitMargin } from "@/constants/pricing";

const margin = calculateProfitMargin(4); // 4 hours
console.log(margin); // 74.2% (1036 / 1396 × 100)
```

## Usage Examples

### In Components

```typescript
import { STORAGE } from "@/constants/storage";
import { PRICING } from "@/constants/pricing";

function MyComponent() {
  // Use storage constants
  const maxSize = STORAGE.MAX_FILE_SIZE;
  const bucketName = STORAGE.BUCKET_NAME;
  
  // Use pricing constants
  const hourlyRate = PRICING.HOURLY_RATE;
  const laborCost = PRICING.LABOR_COST;
  
  return (
    <div>
      <p>Max file size: {maxSize / 1024 / 1024}MB</p>
      <p>Hourly rate: {hourlyRate} DKK</p>
    </div>
  );
}
```

### In Reports

```typescript
import { PRICING, calculateProfit } from "@/constants/pricing";

function generateReport(tasks: Task[]) {
  const totalRevenue = tasks.reduce((sum, task) => {
    return sum + (task.hours * PRICING.HOURLY_RATE);
  }, 0);
  
  const totalProfit = tasks.reduce((sum, task) => {
    return sum + calculateProfit(task.hours);
  }, 0);
  
  return { totalRevenue, totalProfit };
}
```

### In Validation

```typescript
import { validateFile, STORAGE } from "@/constants/storage";

function handleUpload(file: File) {
  // Validate file
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  // Upload to Supabase
  await supabase.storage
    .from(STORAGE.BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: STORAGE.CACHE_CONTROL,
    });
}
```

## Best Practices

1. **Always use constants** - Don't hardcode values
2. **Import what you need** - Use named imports, not default
3. **Use helper functions** - Don't duplicate calculation logic
4. **Type safety** - Constants use `as const` for type inference
5. **Update in one place** - Change constants, not scattered values

## Migration Guide

### Replacing Magic Numbers

**Before:**
```typescript
// ❌ Bad: Magic numbers
if (file.size > 10 * 1024 * 1024) {
  throw new Error("File too large");
}
const revenue = hours * 349;
```

**After:**
```typescript
// ✅ Good: Use constants
import { STORAGE, PRICING } from "@/constants";

if (file.size > STORAGE.MAX_FILE_SIZE) {
  throw new Error("File too large");
}
const revenue = hours * PRICING.HOURLY_RATE;
```

### Using Helper Functions

**Before:**
```typescript
// ❌ Bad: Duplicated logic
const revenue = hours * 349;
const cost = hours * 90;
const profit = revenue - cost;
const margin = (profit / revenue) * 100;
```

**After:**
```typescript
// ✅ Good: Use helper functions
import { calculateRevenue, calculateProfit, calculateProfitMargin } from "@/constants/pricing";

const revenue = calculateRevenue(hours);
const profit = calculateProfit(hours);
const margin = calculateProfitMargin(hours);
```

## Troubleshooting

### TypeScript Errors with `ALLOWED_TYPES`

**Problem:** Type error when checking if type is in `ALLOWED_TYPES`

**Solution:**
```typescript
// Use type assertion
if (!(STORAGE.ALLOWED_TYPES as readonly string[]).includes(type)) {
  // Handle invalid type
}
```

### Constants Not Updating

**Problem:** Changes to constants don't reflect in app

**Solution:**
- Restart dev server
- Clear browser cache
- Check that constants are imported correctly

## Related Documentation

- [Document Management](../DOCUMENT_MANAGEMENT.md)
- [API Reference](../../../API_REFERENCE.md)
- [Development Guide](../../../DEVELOPMENT_GUIDE.md)

