import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Search, 
  Plus, 
  Home, 
  AlertCircle,
  Filter,
  BookOpen
} from "lucide-react";
import { useLocation } from "wouter";
import { DocumentList } from "@/components/docs/DocumentList";
import { DocumentViewer } from "@/components/docs/DocumentViewer";
import { DocumentEditor } from "@/components/docs/DocumentEditor";
import { ConflictList } from "@/components/docs/ConflictList";
import { useDocuments, useConflicts } from "@/hooks/docs/useDocuments";
import { useDocsWebSocket } from "@/hooks/docs/useDocsWebSocket";

/**
 * Documentation Management Page
 * 
 * Features:
 * - Full-screen docs management (outside 3-panel layout)
 * - List, view, edit, create documents
 * - Real-time updates via WebSocket
 * - Conflict resolution
 * - Search and filters
 */
export default function DocsPage() {
  const [, navigate] = useLocation();
  const [view, setView] = useState<'list' | 'view' | 'edit' | 'create'>('list');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();

  const { documents, total, isLoading } = useDocuments({
    search: searchQuery || undefined,
    category: categoryFilter,
    limit: 50,
  });

  const { conflicts } = useConflicts();
  const { isConnected } = useDocsWebSocket();

  const handleViewDocument = (docId: string) => {
    setSelectedDocId(docId);
    setView('view');
  };

  const handleEditDocument = (docId: string) => {
    setSelectedDocId(docId);
    setView('edit');
  };

  const handleCreateDocument = () => {
    setSelectedDocId(null);
    setView('create');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedDocId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Workspace
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Documentation</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Connection status */}
              <Badge variant={isConnected ? "default" : "secondary"}>
                <div className={`h-2 w-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
                {isConnected ? 'Live' : 'Offline'}
              </Badge>

              {/* Conflict indicator */}
              {conflicts.length > 0 && (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {conflicts.length} Conflicts
                </Badge>
              )}

              {/* Create button */}
              {view === 'list' && (
                <Button onClick={handleCreateDocument}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Document
                </Button>
              )}
            </div>
          </div>

          {/* Search & Filters (only in list view) */}
          {view === 'list' && (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {view === 'list' && (
          <Tabs defaultValue="documents" className="w-full">
            <TabsList>
              <TabsTrigger value="documents">
                <FileText className="h-4 w-4 mr-2" />
                Documents ({total})
              </TabsTrigger>
              {conflicts.length > 0 && (
                <TabsTrigger value="conflicts">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Conflicts ({conflicts.length})
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="documents" className="mt-6">
              <DocumentList
                documents={documents}
                isLoading={isLoading}
                onView={handleViewDocument}
                onEdit={handleEditDocument}
              />
            </TabsContent>

            {conflicts.length > 0 && (
              <TabsContent value="conflicts" className="mt-6">
                <ConflictList conflicts={conflicts} />
              </TabsContent>
            )}
          </Tabs>
        )}

        {view === 'view' && selectedDocId && (
          <DocumentViewer
            documentId={selectedDocId}
            onEdit={() => handleEditDocument(selectedDocId)}
            onBack={handleBackToList}
          />
        )}

        {view === 'edit' && selectedDocId && (
          <DocumentEditor
            documentId={selectedDocId}
            onSave={handleBackToList}
            onCancel={handleBackToList}
          />
        )}

        {view === 'create' && (
          <DocumentEditor
            documentId={null}
            onSave={handleBackToList}
            onCancel={handleBackToList}
          />
        )}
      </main>
    </div>
  );
}
