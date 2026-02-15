"use client";

import { Check, Edit, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/raven-ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Note {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface NotesListProps {
  claimId: string;
}

export function NotesList({ claimId }: NotesListProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [claimId]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notes?claimId=${claimId}`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async () => {
    if (!newNoteContent.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimId,
          content: newNoteContent.trim(),
        }),
      });

      if (res.ok) {
        setNewNoteContent("");
        fetchNotes();
      } else {
        alert("Failed to create note");
      }
    } catch (error) {
      console.error("Failed to create note:", error);
      alert("Failed to create note");
    } finally {
      setSubmitting(false);
    }
  };

  const updateNote = async (id: string) => {
    if (!editContent.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent.trim() }),
      });

      if (res.ok) {
        setEditingId(null);
        setEditContent("");
        fetchNotes();
      } else {
        alert("Failed to update note");
      }
    } catch (error) {
      console.error("Failed to update note:", error);
      alert("Failed to update note");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteNote = async (id: string) => {
    if (!confirm("Delete this note?")) return;

    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchNotes();
      } else {
        alert("Failed to delete note");
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
      alert("Failed to delete note");
    }
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
        <CardDescription>Add notes and observations about this claim</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* New Note Form */}
        <div className="space-y-2">
          <Textarea
            placeholder="Add a note..."
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            rows={3}
          />
          <Button onClick={createNote} disabled={!newNoteContent.trim() || submitting} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Note
          </Button>
        </div>

        {/* Notes List */}
        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No notes yet. Add one above!
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="space-y-2 rounded-lg border bg-muted/30 p-4">
                {editingId === note.id ? (
                  <>
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => updateNote(note.id)}
                        disabled={!editContent.trim() || submitting}
                        size="sm"
                        variant="default"
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Save
                      </Button>
                      <Button
                        onClick={cancelEdit}
                        disabled={submitting}
                        size="sm"
                        variant="outline"
                      >
                        <X className="mr-1 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="whitespace-pre-wrap text-sm">{note.content}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {new Date(note.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {note.updatedAt !== note.createdAt && " (edited)"}
                      </span>
                      <div className="flex gap-2">
                        <Button onClick={() => startEdit(note)} size="sm" variant="ghost">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          onClick={() => deleteNote(note.id)}
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
