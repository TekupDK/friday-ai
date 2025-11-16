# 🤖 AI Documentation Generator - Frontend Usage Guide

## 📦 Components & Hooks

### Hook: `useAIGeneration()`

**Location:** `client/src/hooks/docs/useAIGeneration.ts`

```typescript
import { useAIGeneration } from "@/hooks/docs/useAIGeneration";

function MyComponent() {
  const {
    generateLeadDoc,        // Mutation for single lead
    updateLeadDoc,          // Mutation for updating existing doc
    generateWeeklyDigest,   // Mutation for weekly digest
    bulkGenerateLeadDocs,   // Mutation for bulk generation
    isGenerating            // Loading state
  } = useAIGeneration();

  return (
    <Button onClick={() => generateLeadDoc.mutate({ leadId: 1 })}>
      Generate Doc
    </Button>
  );
}

```text

---

## 🎯 Ready-to-Use Components

### 1. Generate Lead Doc Button

**Standard button with icon:**

```tsx
import { GenerateLeadDocButton } from "@/components/docs/GenerateLeadDocButton";

<GenerateLeadDocButton
  leadId={lead.id}
  leadName={lead.name}
  variant="outline"
  size="sm"
/>;

```text

**Icon-only version for tight spaces:**

```tsx
import { GenerateLeadDocIconButton } from "@/components/docs/GenerateLeadDocButton";

<GenerateLeadDocIconButton leadId={lead.id} leadName={lead.name} />;

```bash

---

## 📍 Integration Points

### In Docs Page Toolbar

**Location:** `client/src/pages/docs/DocsPage.tsx`

Already integrated! ✅

- "Weekly Digest" button
- "Bulk Generate" button

### In Leads List/Table

**Example integration:**

```tsx
// In your LeadsTable component
import { GenerateLeadDocIconButton } from "@/components/docs/GenerateLeadDocButton";

function LeadsTable({ leads }) {
  return (
    <Table>
      {leads.map(lead => (
        <TableRow key={lead.id}>
          <TableCell>{lead.name}</TableCell>
          <TableCell>{lead.email}</TableCell>
          <TableCell>
            <GenerateLeadDocIconButton leadId={lead.id} leadName={lead.name} />
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
}

```text

### In Lead Detail View

**Example integration:**

```tsx
// In LeadDetailPage.tsx
import { GenerateLeadDocButton } from "@/components/docs/GenerateLeadDocButton";

function LeadDetailPage({ leadId }) {
  return (
    <div>
      <h1>Lead Details</h1>

      <div className="flex gap-2 mt-4">
        <Button>Edit</Button>
        <GenerateLeadDocButton leadId={leadId} variant="default" />
      </div>
    </div>
  );
}

```text

### In Dropdown Menu

**Example integration:**

```tsx
import { useAIGeneration } from "@/hooks/docs/useAIGeneration";
import { Sparkles } from "lucide-react";

function LeadActionsMenu({ lead }) {
  const { generateLeadDoc } = useAIGeneration();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>•••</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => /*edit*/ }>
          Edit Lead
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => generateLeadDoc.mutate({ leadId: lead.id })}>
          <Sparkles className="h-4 w-4 mr-2" />
          Generate AI Doc
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

```text

---

## 🔄 Manual API Calls

### Generate Lead Doc

```typescript
const { generateLeadDoc } = useAIGeneration();

// Trigger generation
generateLeadDoc.mutate({ leadId: 123 });

// With callbacks
generateLeadDoc.mutate(
  { leadId: 123 },
  {
    onSuccess: result => {
      if (result.success) {
        console.log("Doc created:", result.docId);
      }
    },
  }
);

```text

### Generate Weekly Digest

```typescript
const { generateWeeklyDigest } = useAIGeneration();

// Simple trigger
generateWeeklyDigest.mutate();

```text

### Bulk Generate All Leads

```typescript
const { bulkGenerateLeadDocs } = useAIGeneration();

// Generate for all leads
bulkGenerateLeadDocs.mutate();

// Result includes stats
bulkGenerateLeadDocs.mutate(undefined, {
  onSuccess: result => {
    console.log(`Generated ${result.generated} docs`);
    console.log(`Failed: ${result.failed}`);
  },
});

```text

---

## 🎨 Customization Examples

### Custom Loading State

```tsx
import { useAIGeneration } from "@/hooks/docs/useAIGeneration";

function CustomButton({ leadId }) {
  const { generateLeadDoc, isGenerating } = useAIGeneration();

  return (
    <Button
      onClick={() => generateLeadDoc.mutate({ leadId })}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <>
          <Loader2 className="animate-spin mr-2" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2" />
          AI Documentation
        </>
      )}
    </Button>
  );
}

```text

### With Confirmation Dialog

```tsx
import { useAIGeneration } from "@/hooks/docs/useAIGeneration";

function ConfirmGenerateButton({ leadId, leadName }) {
  const [open, setOpen] = useState(false);
  const { generateLeadDoc } = useAIGeneration();

  const handleConfirm = () => {
    generateLeadDoc.mutate({ leadId });
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Generate Doc</Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generate AI Documentation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will analyze {leadName}'s emails, meetings, and conversations
              to create a comprehensive documentation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Generate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

```text

---

## 🎯 Where to Add Buttons

### High Priority

1. ✅ **Docs Page Toolbar** - Already done!
1. 🔲 **Leads List** - Add icon button in actions column
1. 🔲 **Lead Detail Page** - Add prominent button

### Nice to Have

1. 🔲 **Lead Quick Actions Menu** - Add to dropdown
1. 🔲 **Dashboard** - Add "Generate Weekly Digest" widget
1. 🔲 **Settings** - Add automation options

---

## 💡 Best Practices

### Do's ✅

- Show loading state during generation
- Use toast notifications for success/error
- Navigate to doc after generation
- Disable button while generating
- Show contextual help tooltips

### Don'ts ❌

- Don't allow multiple simultaneous generations
- Don't forget error handling
- Don't block UI completely during generation
- Don't hide the button from relevant contexts

---

## 🚀 Quick Start Checklist

To add AI doc generation to a new page:

- [ ] Import `useAIGeneration` hook
- [ ] Add generate button with loading state
- [ ] Handle success with toast notification
- [ ] Handle errors gracefully
- [ ] Test with real lead data

**Example minimal implementation:**

```tsx
import { useAIGeneration } from "@/hooks/docs/useAIGeneration";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function MyLeadComponent({ leadId }) {
  const { generateLeadDoc, isGenerating } = useAIGeneration();

  return (
    <Button
      onClick={() => generateLeadDoc.mutate({ leadId })}
      disabled={isGenerating}
    >
      <Sparkles className="h-4 w-4 mr-2" />
      {isGenerating ? "Generating..." : "Generate Doc"}
    </Button>
  );
}

```

---

**That's it! AI Documentation Generator is ready to use! 🎉**
