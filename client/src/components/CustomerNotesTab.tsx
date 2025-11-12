import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow } from "date-fns";
import { da } from "date-fns/locale";
import { Edit2, MessageSquare, Plus, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CustomerNotesTabProps {
  customerId: number;
}

export function CustomerNotesTab({ customerId }: CustomerNotesTabProps) {
  const [newNote, setNewNote] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingNote, setEditingNote] = useState("");

  const { data: notes, refetch } = trpc.customer.getNotes.useQuery(
    { customerId },
    { enabled: !!customerId }
  );

  const addNoteMutation = trpc.customer.addNote.useMutation({
    onSuccess: () => {
      setNewNote("");
      refetch();
      toast.success("Note tilføjet");
    },
    onError: error => {
      toast.error("Kunne ikke tilføje note: " + error.message);
    },
  });

  const updateNoteMutation = trpc.customer.updateNote.useMutation({
    onSuccess: () => {
      setEditingNoteId(null);
      setEditingNote("");
      refetch();
      toast.success("Note opdateret");
    },
    onError: error => {
      toast.error("Kunne ikke opdatere note: " + error.message);
    },
  });

  const deleteNoteMutation = trpc.customer.deleteNote.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Note slettet");
    },
    onError: error => {
      toast.error("Kunne ikke slette note: " + error.message);
    },
  });

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addNoteMutation.mutate({ customerId, note: newNote.trim() });
  };

  const handleUpdateNote = (noteId: number) => {
    if (!editingNote.trim()) return;
    updateNoteMutation.mutate({ noteId, note: editingNote.trim() });
  };

  const handleDeleteNote = (noteId: number) => {
    if (confirm("Er du sikker på at du vil slette denne note?")) {
      deleteNoteMutation.mutate({ noteId });
    }
  };

  const startEditing = (note: any) => {
    setEditingNoteId(note.id);
    setEditingNote(note.note);
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditingNote("");
  };

  return (
    <div className="space-y-4">
      {/* Add New Note */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Tilføj ny note
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Skriv din note her..."
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleAddNote}
              disabled={!newNote.trim() || addNoteMutation.isPending}
              size="sm"
            >
              <Save className="w-4 h-4 mr-2" />
              {addNoteMutation.isPending ? "Gemmer..." : "Gem note"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Noter
              <Badge variant="secondary">{notes?.length || 0}</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notes && notes.length > 0 ? (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {notes.map(note => (
                  <div
                    key={note.id}
                    className="border rounded-lg p-3 space-y-2 hover:bg-muted/30 transition-colors"
                  >
                    {/* Note Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>
                          {formatDistanceToNow(new Date(note.createdAt), {
                            addSuffix: true,
                            locale: da,
                          })}
                        </span>
                        {note.updatedAt !== note.createdAt && (
                          <Badge variant="outline" className="text-xs">
                            Redigeret
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {editingNoteId !== note.id && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditing(note)}
                              className="h-7 w-7 p-0"
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNote(note.id)}
                              className="h-7 w-7 p-0 hover:text-red-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                        {editingNoteId === note.id && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateNote(note.id)}
                              disabled={updateNoteMutation.isPending}
                              className="h-7 px-2"
                            >
                              <Save className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={cancelEditing}
                              className="h-7 w-7 p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Note Content */}
                    {editingNoteId === note.id ? (
                      <Textarea
                        value={editingNote}
                        onChange={e => setEditingNote(e.target.value)}
                        rows={3}
                        className="text-sm"
                      />
                    ) : (
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {note.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Ingen noter endnu</p>
              <p className="text-xs">Tilføj din første note ovenfor</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
