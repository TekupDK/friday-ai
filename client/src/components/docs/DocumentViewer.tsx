import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Calendar, Tag, User, GitBranch } from "lucide-react";
import { useDocument, useDocumentComments, useDocuments } from "@/hooks/docs/useDocuments";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CommentsSection } from "./CommentsSection";

interface DocumentViewerProps {
  documentId: string;
  onEdit: () => void;
  onBack: () => void;
}

export function DocumentViewer({ documentId, onEdit, onBack }: DocumentViewerProps) {
  const { document, isLoading } = useDocument(documentId);
  const { comments, addComment, resolveComment } = useDocumentComments(documentId);
  
  const handleAddComment = async (content: string) => {
    return new Promise<void>((resolve, reject) => {
      addComment(
        { documentId, content },
        { onSuccess: () => resolve(), onError: (error) => reject(error) }
      );
    });
  };
  
  const handleResolveComment = async (commentId: string) => {
    return new Promise<void>((resolve, reject) => {
      resolveComment(
        { commentId },
        { onSuccess: () => resolve(), onError: (error) => reject(error) }
      );
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded w-1/4 animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!document) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Document not found</p>
          <Button className="mt-4" onClick={onBack}>
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
          <h1 className="text-3xl font-bold">{document.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{document.path}</p>
        </div>
        <Button onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-4">
            <Badge variant="secondary">{document.category}</Badge>
            {document.tags && document.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {document.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <Separator className="my-4" />
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {document.author}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Updated {formatDistanceToNow(new Date(document.updatedAt), { addSuffix: true })}
            </div>
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Version {document.version}
            </div>
            {document.gitHash && (
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {document.gitHash.slice(0, 7)}
                </code>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Content */}
      <Card>
        <CardContent className="prose prose-slate dark:prose-invert max-w-none p-8">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {document.content}
          </ReactMarkdown>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <CommentsSection
        documentId={documentId}
        comments={comments || []}
        onAddComment={handleAddComment}
        onResolveComment={handleResolveComment}
      />
    </div>
  );
}
