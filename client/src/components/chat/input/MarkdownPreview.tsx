/**
 * MARKDOWN PREVIEW - Live markdown preview
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import {
  FileText,
  Eye,
  Edit,
  Code,
  Bold,
  Italic,
  Link,
  Image,
  List,
  Quote,
} from "lucide-react";
import { useState } from "react";

interface MarkdownPreviewProps {
  initialMarkdown?: string;
  onSave?: (markdown: string) => void;
  onExport?: (format: "markdown" | "html") => void;
}

export function MarkdownPreview({
  initialMarkdown = "# Markdown Preview\n\nSkriv **bold** eller *italic* tekst.\n\n- List item 1\n- List item 2\n\n> Block quote\n\n`inline code`\n\n```javascript\n// Code block\nfunction hello() {\n  console.log('Hello World!');\n}\n```",
  onSave,
  onExport,
}: MarkdownPreviewProps) {
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [isPreview, setIsPreview] = useState(false);
  const [isSplitView, setIsSplitView] = useState(false);

  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
  };

  const renderMarkdown = (text: string) => {
    // Simple markdown parsing (in real app, use a library like marked.js)
    let html = text;

    // Headers
    html = html.replace(
      /^### (.*$)/gim,
      '<h3 class="text-lg font-semibold mb-2">$1</h3>'
    );
    html = html.replace(
      /^## (.*$)/gim,
      '<h2 class="text-xl font-semibold mb-3">$1</h2>'
    );
    html = html.replace(
      /^# (.*$)/gim,
      '<h1 class="text-2xl font-bold mb-4">$1</h1>'
    );

    // Bold and italic
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

    // Links
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-blue-600 hover:underline">$1</a>'
    );

    // Images
    html = html.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      '<img src="$2" alt="$1" class="max-w-full h-auto rounded" />'
    );

    // Code blocks
    html = html.replace(
      /```([^`]+)```/g,
      '<pre class="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto my-3"><code>$1</code></pre>'
    );
    html = html.replace(
      /`([^`]+)`/g,
      '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">$1</code>'
    );

    // Blockquotes
    html = html.replace(
      /^> (.+)$/gim,
      '<blockquote class="border-l-4 border-gray-300 pl-4 italic my-2">$1</blockquote>'
    );

    // Lists
    html = html.replace(/^\* (.+)$/gim, '<li class="ml-4">• $1</li>');
    html = html.replace(/^- (.+)$/gim, '<li class="ml-4">• $1</li>');

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p class="mb-3">');
    html = '<p class="mb-3">' + html + "</p>";

    // ✅ SECURITY FIX: Sanitize HTML before rendering to prevent XSS
    return sanitizeHtml(html);
  };

  const getWordCount = () => {
    return markdown
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
  };

  const getCharCount = () => {
    return markdown.length;
  };

  const getLineCount = () => {
    return markdown.split("\n").length;
  };

  const markdownSyntax = [
    { icon: Bold, syntax: "**bold**", description: "Bold text" },
    { icon: Italic, syntax: "*italic*", description: "Italic text" },
    { icon: Link, syntax: "[text](url)", description: "Link" },
    { icon: Image, syntax: "![alt](url)", description: "Image" },
    { icon: List, syntax: "- item", description: "Bullet list" },
    { icon: Quote, syntax: "> quote", description: "Blockquote" },
  ];

  return (
    <Card className="border-l-4 border-l-green-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Markdown Preview</h4>
              <p className="text-xs text-muted-foreground">
                Live markdown preview
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsSplitView(!isSplitView)}
            >
              {isSplitView ? "Single" : "Split"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsPreview(!isPreview)}
            >
              {isPreview ? (
                <Edit className="w-3 h-3 mr-1" />
              ) : (
                <Eye className="w-3 h-3 mr-1" />
              )}
              {isPreview ? "Edit" : "Preview"}
            </Button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-1 p-1 rounded-lg bg-muted">
          <button
            onClick={() => {
              setIsPreview(false);
              setIsSplitView(false);
            }}
            className={cn(
              "flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors",
              !isPreview && !isSplitView
                ? "bg-background shadow-sm"
                : "hover:bg-background/50"
            )}
          >
            <Edit className="w-3 h-3 inline mr-1" />
            Edit
          </button>
          <button
            onClick={() => {
              setIsPreview(true);
              setIsSplitView(false);
            }}
            className={cn(
              "flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors",
              isPreview && !isSplitView
                ? "bg-background shadow-sm"
                : "hover:bg-background/50"
            )}
          >
            <Eye className="w-3 h-3 inline mr-1" />
            Preview
          </button>
          <button
            onClick={() => {
              setIsPreview(false);
              setIsSplitView(true);
            }}
            className={cn(
              "flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors",
              isSplitView ? "bg-background shadow-sm" : "hover:bg-background/50"
            )}
          >
            <Code className="w-3 h-3 inline mr-1" />
            Split
          </button>
        </div>

        {/* Editor/Preview */}
        {isSplitView ? (
          <div className="grid grid-cols-2 gap-4">
            {/* Editor */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Markdown:
              </label>
              <textarea
                value={markdown}
                onChange={handleMarkdownChange}
                className="w-full h-64 p-3 font-mono text-sm bg-background border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Skriv markdown her..."
              />
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Preview:
              </label>
              <div
                className="h-64 p-4 border rounded-lg bg-background overflow-y-auto prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
              />
            </div>
          </div>
        ) : isPreview ? (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Preview:
            </label>
            <div
              className="min-h-[200px] p-4 border rounded-lg bg-background overflow-y-auto prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Markdown:
            </label>
            <textarea
              value={markdown}
              onChange={handleMarkdownChange}
              className="w-full h-64 p-3 font-mono text-sm bg-background border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Skriv markdown her..."
            />
          </div>
        )}

        {/* Markdown Syntax Guide */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Quick Syntax:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {markdownSyntax.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => {
                    const textarea = document.querySelector(
                      "textarea"
                    ) as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text =
                        markdown.substring(0, start) +
                        item.syntax +
                        markdown.substring(end);
                      setMarkdown(text);
                      setTimeout(() => {
                        textarea.focus();
                        textarea.setSelectionRange(
                          start + item.syntax.length,
                          start + item.syntax.length
                        );
                      }, 0);
                    }
                  }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  title={item.description}
                >
                  <Icon className="w-3 h-3 text-green-600" />
                  <span className="text-xs font-mono">{item.syntax}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20 text-center">
            <p className="font-bold text-green-700 dark:text-green-300">
              {getWordCount()}
            </p>
            <p className="text-green-600 dark:text-green-400">Words</p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-center">
            <p className="font-bold text-emerald-700 dark:text-emerald-300">
              {getCharCount()}
            </p>
            <p className="text-emerald-600 dark:text-emerald-400">Characters</p>
          </div>
          <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/20 text-center">
            <p className="font-bold text-teal-700 dark:text-teal-300">
              {getLineCount()}
            </p>
            <p className="text-teal-600 dark:text-teal-400">Lines</p>
          </div>
        </div>

        {/* Raw Markdown */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Raw Markdown:
          </label>
          <pre className="p-3 rounded-lg bg-gray-900 text-gray-100 text-xs overflow-x-auto max-h-32">
            {markdown}
          </pre>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            onClick={() => onSave?.(markdown)}
            className="flex-1 bg-linear-to-r from-green-600 to-emerald-600"
          >
            <FileText className="w-4 h-4 mr-2" />
            Save Markdown
          </Button>
          <Button
            onClick={() => onExport?.("markdown")}
            variant="outline"
            className="flex-1"
          >
            <Code className="w-4 h-4 mr-2" />
            Export MD
          </Button>
          <Button
            onClick={() => onExport?.("html")}
            variant="outline"
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            Export HTML
          </Button>
        </div>
      </div>
    </Card>
  );
}
