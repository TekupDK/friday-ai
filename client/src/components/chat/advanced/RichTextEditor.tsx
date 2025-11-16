/**
 * RICH TEXT EDITOR - WYSIWYG text editor
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";
import {
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  Image,
  Code,
  Quote,
  Eye,
  Edit,
  Download,
  Undo,
  Redo,
} from "lucide-react";
import { useState, useRef } from "react";

export interface RichTextContent {
  html: string;
  text: string;
  wordCount: number;
  charCount: number;
}

interface RichTextEditorProps {
  initialContent?: string;
  onSave?: (content: RichTextContent) => void;
  onPreview?: (html: string) => void;
  onExport?: (format: "html" | "markdown" | "plain") => void;
}

export function RichTextEditor({
  initialContent = "<p>Start typing your rich text here...</p>",
  onSave,
  onPreview,
  onExport,
}: RichTextEditorProps) {
  // ✅ SECURITY FIX: Sanitize initial content to prevent XSS
  const sanitizedInitialContent = DOMPurify.sanitize(initialContent);
  const [content, setContent] = useState(sanitizedInitialContent);
  const [isPreview, setIsPreview] = useState(false);
  const [history, setHistory] = useState<string[]>([sanitizedInitialContent]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);

  const updateContent = (newContent: string) => {
    // ✅ SECURITY FIX: Sanitize content before storing to prevent XSS
    const sanitized = DOMPurify.sanitize(newContent);
    setContent(sanitized);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(sanitized);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      updateContent(editorRef.current.innerHTML);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      // ✅ SECURITY FIX: Sanitize history content before restoring
      const sanitized = DOMPurify.sanitize(history[newIndex]);
      setHistoryIndex(newIndex);
      setContent(sanitized);
      if (editorRef.current) {
        editorRef.current.innerHTML = sanitized;
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      // ✅ SECURITY FIX: Sanitize history content before restoring
      const sanitized = DOMPurify.sanitize(history[newIndex]);
      setHistoryIndex(newIndex);
      setContent(sanitized);
      if (editorRef.current) {
        editorRef.current.innerHTML = sanitized;
      }
    }
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      updateContent(editorRef.current.innerHTML);
    }
  };

  const getTextContent = (html: string) => {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  };

  const getStats = () => {
    const text = getTextContent(content);
    const words = text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0);
    return {
      html: content,
      text: text,
      wordCount: words.length,
      charCount: text.length,
    };
  };

  const stats = getStats();

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      execCommand("createLink", url);
    }
  };

  const insertImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      execCommand("insertImage", url);
    }
  };

  const toolbarButtons = [
    { icon: Bold, command: "bold", title: "Bold" },
    { icon: Italic, command: "italic", title: "Italic" },
    { icon: Underline, command: "underline", title: "Underline" },
    { divider: true },
    { icon: AlignLeft, command: "justifyLeft", title: "Align Left" },
    { icon: AlignCenter, command: "justifyCenter", title: "Align Center" },
    { icon: AlignRight, command: "justifyRight", title: "Align Right" },
    { divider: true },
    { icon: List, command: "insertUnorderedList", title: "Bullet List" },
    { icon: ListOrdered, command: "insertOrderedList", title: "Numbered List" },
    { divider: true },
    { icon: Link, command: "createLink", title: "Link", custom: insertLink },
    {
      icon: Image,
      command: "insertImage",
      title: "Image",
      custom: insertImage,
    },
    { icon: Code, command: "formatBlock", value: "pre", title: "Code Block" },
    {
      icon: Quote,
      command: "formatBlock",
      value: "blockquote",
      title: "Quote",
    },
  ];

  return (
    <Card className="border-l-4 border-l-indigo-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
              <Type className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Rich Text Editor</h4>
              <p className="text-xs text-muted-foreground">
                WYSIWYG text editor
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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

        {/* Toolbar */}
        {!isPreview && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 p-2 rounded-lg bg-muted/50 border border-border">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleUndo}
                disabled={historyIndex === 0}
              >
                <Undo className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRedo}
                disabled={historyIndex === history.length - 1}
              >
                <Redo className="w-3 h-3" />
              </Button>

              <div className="w-px h-6 bg-border mx-1" />

              {toolbarButtons.map((button, index) => {
                if (button.divider) {
                  return (
                    <div key={index} className="w-px h-6 bg-border mx-1" />
                  );
                }

                const Icon = button.icon;
                return (
                  <Button
                    key={index}
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      button.custom
                        ? button.custom()
                        : button.command
                          ? (button.value !== undefined
                              ? execCommand(button.command, button.value)
                              : execCommand(button.command))
                          : undefined
                    }
                    title={button.title}
                  >
                    {Icon ? <Icon className="w-3 h-3" /> : null}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Editor/Preview */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            {isPreview ? "Preview" : "Content"}:
          </label>

          {isPreview ? (
            <div
              className="min-h-[200px] p-4 border rounded-lg bg-background prose prose-sm max-w-none"
              // ✅ SECURITY FIX: Sanitize content before rendering to prevent XSS
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
            />
          ) : (
            <div
              ref={editorRef}
              contentEditable
              onInput={handleContentChange}
              className="min-h-[200px] p-4 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500 prose prose-sm max-w-none"
              // ✅ SECURITY FIX: Sanitize content before rendering to prevent XSS
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
            />
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-center">
            <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
              {stats.wordCount}
            </p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400">
              Words
            </p>
          </div>
          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-center">
            <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
              {stats.charCount}
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              Characters
            </p>
          </div>
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-center">
            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {content.length}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              HTML Length
            </p>
          </div>
        </div>

        {/* HTML Preview */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            HTML Output:
          </label>
          <pre className="p-3 rounded-lg bg-gray-900 text-gray-100 text-xs overflow-x-auto max-h-32">
            {content}
          </pre>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            onClick={() => onSave?.(stats)}
            className="flex-1 bg-linear-to-r from-indigo-600 to-purple-600"
          >
            <Type className="w-4 h-4 mr-2" />
            Save Content
          </Button>
          <Button
            onClick={() => onExport?.("html")}
            variant="outline"
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Export HTML
          </Button>
          <Button
            onClick={() => onExport?.("markdown")}
            variant="outline"
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Export MD
          </Button>
        </div>
      </div>
    </Card>
  );
}
