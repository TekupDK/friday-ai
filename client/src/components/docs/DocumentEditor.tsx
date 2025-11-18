import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, X, Eye, Code } from "lucide-react";
import { useDocument, useDocuments } from "@/hooks/docs/useDocuments";
import ReactMarkdown from "react-markdown";
import { useDocsKeyboardShortcuts } from "@/hooks/docs/useDocsKeyboardShortcuts";
import { toast } from "sonner";

interface DocumentEditorProps {
  documentId: string | null; // null = create new
  template?: string | null; // template id for new docs
  onSave: () => void;
  onCancel: () => void;
}

// Template content
const TEMPLATES: Record<
  string,
  { title: string; content: string; category: string; tags: string[] }
> = {
  feature: {
    title: "Feature Spec",
    content: `# [Feature Name]

## Overview
Brief description of what this feature does and why it's needed.

## Requirements
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

## Technical Design

### Architecture
\`\`\`
[Diagram or description]
\`\`\`

### API Endpoints
- \`POST /api/feature\` - Create
- \`GET /api/feature/:id\` - Read

## Implementation Plan

### Phase 1: Backend
- [ ] Database schema
- [ ] API endpoints
- [ ] Tests

### Phase 2: Frontend
- [ ] UI components
- [ ] Integration

## Testing Strategy
- Unit tests: [What to test]
- Integration tests: [What to test]
- E2E tests: [What to test]

## Timeline
- Week 1: Backend
- Week 2: Frontend
- Week 3: Testing

---
**Status:** Draft  
**Created:** ${new Date().toISOString().split("T")[0]}`,
    category: "Planning & Roadmap",
    tags: ["feature", "planning", "draft"],
  },
  bug: {
    title: "Bug Report",
    content: `# 🐛 Bug: [Short Description]

## Summary
Clear, concise description of the bug.

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error

## Expected Behavior
What should happen?

## Actual Behavior
What actually happens?

## Screenshots/Logs
\`\`\`
[Paste error logs]
\`\`\`

## Environment
- Browser: [e.g., Chrome 120]
- OS: [e.g., Windows 11]
- Version: [e.g., v2.0.0]

## Fix
- [ ] Identified root cause
- [ ] Implemented fix
- [ ] Added tests
- [ ] Verified in production

---
**Priority:** [Low/Medium/High/Critical]  
**Status:** Open  
**Date:** ${new Date().toISOString().split("T")[0]}`,
    category: "Testing & QA",
    tags: ["bug", "urgent"],
  },
  guide: {
    title: "Guide",
    content: `# 📖 Guide: [Topic]

## Overview
What will this guide teach you?

## Prerequisites
- Knowledge: [What you need to know]
- Tools: [What you need installed]

## Step-by-Step Instructions

### Step 1: [Title]
Description of what we're doing and why.

\`\`\`bash
# Commands
\`\`\`

**Expected output:**
\`\`\`
[What you should see]
\`\`\`

### Step 2: [Title]
Continue...

## Verification
How to verify everything is working:

\`\`\`bash
# Test commands
\`\`\`

## Troubleshooting

### Issue: [Common problem]
**Symptoms:** [What you see]  
**Solution:** [How to fix]

## Next Steps
- [What to do next]
- [Related guides]

---
**Difficulty:** [Beginner/Intermediate/Advanced]  
**Est. time:** [X minutes]  
**Updated:** ${new Date().toISOString().split("T")[0]}`,
    category: "Documentation",
    tags: ["guide", "tutorial"],
  },
  meeting: {
    title: "Meeting Notes",
    content: `# 📝 Meeting Notes: [Topic]

**Date:** ${new Date().toISOString().split("T")[0]}  
**Time:** [HH:MM - HH:MM]  
**Attendees:** [Names]  

## Agenda
1. Topic 1
2. Topic 2

---

## Discussion

### Topic 1: [Title]
**Summary:** [What was discussed]

**Key points:**
- Point 1
- Point 2

**Decisions:**
- ✅ Decision 1

---

## Action Items
- [ ] [Person]: [Task] - Due: [Date]
- [ ] [Person]: [Task] - Due: [Date]

## Next Meeting
**Date:** [YYYY-MM-DD]  
**Agenda:**
- Follow up on action items

---
**Meeting Type:** [Planning/Standup/Review]`,
    category: "Planning & Roadmap",
    tags: ["meeting", "notes"],
  },
};

export function DocumentEditor({
  documentId,
  template,
  onSave,
  onCancel,
}: DocumentEditorProps) {
  const { document, isLoading } = useDocument(documentId);
  const { createDocument, updateDocument, isCreating, isUpdating } =
    useDocuments();

  const [title, setTitle] = useState("");
  const [path, setPath] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  // Keyboard shortcuts
  useDocsKeyboardShortcuts({
    onSave: () => {
      if (title && content) {
        handleSave();
      }
    },
    onPreview: () => {
      setActiveTab(activeTab === "edit" ? "preview" : "edit");
    },
    onEscape: () => {
      onCancel();
    },
  });

  // Load template for new docs
  useEffect(() => {
    if (!documentId && template && TEMPLATES[template]) {
      const tmpl = TEMPLATES[template];
      setTitle(tmpl.title);
      setCategory(tmpl.category);
      setTags(tmpl.tags.join(", "));
      setContent(tmpl.content);
    }
  }, [documentId, template]);

  // Load document data when editing
  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setPath(document.path);
      setCategory(document.category);
      setTags(document.tags?.join(", ") || "");
      setContent(document.content);
    }
  }, [document]);

  const handleSave = () => {
    const tagsArray = tags
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (documentId) {
      // Update existing
      updateDocument(
        {
          id: documentId,
          title,
          content,
          category,
          tags: tagsArray,
        },
        {
          onSuccess: () => {
            toast.success("Document updated successfully!");
            onSave();
          },
          onError: (error: any) => {
            toast.error(`Failed to update document: ${error.message}`);
          },
        }
      );
    } else {
      // Create new
      createDocument(
        {
          path: path || `docs/${title.toLowerCase().replace(/\s+/g, "-")}.md`,
          title,
          content,
          category: category || "General",
          tags: tagsArray,
        },
        {
          onSuccess: () => {
            toast.success("Document created successfully!");
            onSave();
          },
          onError: (error: any) => {
            toast.error(`Failed to create document: ${error.message}`);
          },
        }
      );
    }
  };

  const isSaving = isCreating || isUpdating;

  if (isLoading && documentId) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded w-1/4 animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={onCancel} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <h1 className="text-3xl font-bold">
            {documentId ? "Edit Document" : "Create Document"}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !title || !content}
            title="Save (Ctrl+S)"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save (Ctrl+S)"}
          </Button>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Document Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter document title..."
              required
            />
          </div>

          {/* Path */}
          <div className="space-y-2">
            <Label htmlFor="path">Path</Label>
            <Input
              id="path"
              value={path}
              onChange={e => setPath(e.target.value)}
              placeholder="docs/my-document.md"
              disabled={!!documentId}
            />
            <p className="text-xs text-muted-foreground">
              {documentId
                ? "Path cannot be changed after creation"
                : "Auto-generated from title if left empty"}
            </p>
          </div>

          {/* Category & Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="API, Guide, Tutorial..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="feature, auth, api (comma-separated)"
              />
            </div>
          </div>

          {/* Preview tags */}
          {tags && (
            <div className="flex items-center gap-2 flex-wrap">
              {tags
                .split(",")
                .map(t => t.trim())
                .filter(t => t.length > 0)
                .map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Editor with Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={v => setActiveTab(v as "edit" | "preview")}
            className="w-full"
          >
            <TabsList className="mb-4">
              <TabsTrigger value="edit">
                <Code className="h-4 w-4 mr-2" />
                Edit (Ctrl+P to toggle)
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="mt-0">
              <Textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="# My Document

## Introduction

Write your documentation in Markdown...

## Code Example

```typescript
const example = 'Hello World';
```
"
                className="min-h-[500px] font-mono text-sm"
                required
              />
              <p className="text-xs text-muted-foreground mt-2">
                💡 Tip: Use Markdown syntax. Switch to Preview tab to see
                formatted output.
              </p>
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <div className="min-h-[500px] border rounded-md p-4 prose prose-sm max-w-none dark:prose-invert">
                {content ? (
                  <ReactMarkdown>{content}</ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground italic">
                    No content yet. Switch to Edit tab to start writing.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
