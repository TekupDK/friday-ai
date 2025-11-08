import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, X } from "lucide-react";
import { useDocument, useDocuments } from "@/hooks/docs/useDocuments";

interface DocumentEditorProps {
  documentId: string | null; // null = create new
  onSave: () => void;
  onCancel: () => void;
}

export function DocumentEditor({ documentId, onSave, onCancel }: DocumentEditorProps) {
  const { document, isLoading } = useDocument(documentId);
  const { createDocument, updateDocument, isCreating, isUpdating } = useDocuments();

  const [title, setTitle] = useState("");
  const [path, setPath] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");

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
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

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
          onSuccess: onSave,
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
          onSuccess: onSave,
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
          <Button onClick={handleSave} disabled={isSaving || !title || !content}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
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
              onChange={(e) => setTitle(e.target.value)}
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
              onChange={(e) => setPath(e.target.value)}
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
                onChange={(e) => setCategory(e.target.value)}
                placeholder="API, Guide, Tutorial..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="feature, auth, api (comma-separated)"
              />
            </div>
          </div>

          {/* Preview tags */}
          {tags && (
            <div className="flex items-center gap-2 flex-wrap">
              {tags
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t.length > 0)
                .map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Content (Markdown)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
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
        </CardContent>
      </Card>
    </div>
  );
}
