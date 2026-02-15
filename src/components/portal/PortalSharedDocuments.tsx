"use client";

import { format } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  MessageSquare,
  RefreshCw,
  Send,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent,CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SharedFile = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  publicUrl: string;
  mimeType: string | null;
  fileSize: number | null;
  createdAt: string;
  uploadedByRole: string;
};

type QuestionAnswer = {
  id: string;
  question: string;
  answer: string | null;
  createdAt: string;
};

interface PortalSharedDocumentsProps {
  claimId: string;
}

export function PortalSharedDocuments({ claimId }: PortalSharedDocumentsProps) {
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Q&A state
  const [expandedFileId, setExpandedFileId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Record<string, QuestionAnswer[]>>({});
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [askingQuestion, setAskingQuestion] = useState(false);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/portal/claims/${claimId}/files`);
      if (!res.ok) {
        throw new Error(`Failed to load files (${res.status})`);
      }

      const data = await res.json();
      // Filter out photos - show only documents/PDFs
      const docs = (data.files ?? []).filter(
        (f: SharedFile) => !f.mimeType?.startsWith("image/") && f.type !== "PHOTO"
      );
      setFiles(docs);
    } catch (err: any) {
      console.error(err);
      setError("Could not load documents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [claimId]);

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return "";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const loadQuestionsForFile = async (fileId: string) => {
    try {
      const res = await fetch(`/api/claims/${claimId}/documents/${fileId}/ask`);
      if (!res.ok) throw new Error("Failed to load Q&A history");

      const data = await res.json();
      setQuestions((prev) => ({ ...prev, [fileId]: data.questions || [] }));
    } catch (err) {
      console.error("Error loading Q&A:", err);
    }
  };

  const toggleFileExpanded = (fileId: string) => {
    if (expandedFileId === fileId) {
      setExpandedFileId(null);
    } else {
      setExpandedFileId(fileId);
      // Load Q&A history if not already loaded
      if (!questions[fileId]) {
        loadQuestionsForFile(fileId);
      }
    }
  };

  const askQuestion = async (fileId: string) => {
    if (!currentQuestion.trim()) return;

    try {
      setAskingQuestion(true);
      const res = await fetch(`/api/claims/${claimId}/documents/${fileId}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: currentQuestion.trim() }),
      });

      if (!res.ok) throw new Error("Failed to ask question");

      const newQA = await res.json();

      // Add to local state
      setQuestions((prev) => ({
        ...prev,
        [fileId]: [newQA, ...(prev[fileId] || [])],
      }));

      setCurrentQuestion("");
    } catch (err) {
      console.error("Error asking question:", err);
      setError("Failed to process your question. Please try again.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setAskingQuestion(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold">Shared Documents</CardTitle>
        <Button variant="outline" size="sm" onClick={fetchFiles} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading && !files.length ? (
          <p className="text-sm text-muted-foreground">Loading shared documents…</p>
        ) : !files.length ? (
          <p className="text-sm text-muted-foreground">
            Your contractor hasn't shared any documents yet. When they do, they'll appear here to
            view and download.
          </p>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className={cn(
                  "rounded-md border transition",
                  expandedFileId === file.id ? "border-primary/40 bg-primary/5" : ""
                )}
              >
                {/* File Header */}
                <div
                  className={cn(
                    "flex items-center justify-between px-3 py-3 text-sm",
                    !expandedFileId && "hover:border-primary/60 hover:bg-primary/5"
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <FileText className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{file.title}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{format(new Date(file.createdAt), "MMM d, yyyy")}</span>
                        {file.fileSize && (
                          <>
                            <span>•</span>
                            <span>{formatFileSize(file.fileSize)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={`/portal/claims/${claimId}/documents/${file.id}`}
                        className="flex-shrink-0"
                        title={`View ${file.title}`}
                      >
                        <FileText className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={file.publicUrl}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="flex-shrink-0"
                        title={`Download ${file.title}`}
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleFileExpanded(file.id)}>
                      {expandedFileId === file.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Q&A Section */}
                {expandedFileId === file.id && (
                  <div className="border-t bg-white px-3 py-3">
                    {/* Ask Question Input */}
                    <div className="mb-3 flex gap-2">
                      <Input
                        placeholder="Ask a question about this document..."
                        value={currentQuestion}
                        onChange={(e) => setCurrentQuestion(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !askingQuestion) {
                            askQuestion(file.id);
                          }
                        }}
                        disabled={askingQuestion}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => askQuestion(file.id)}
                        disabled={!currentQuestion.trim() || askingQuestion}
                        size="sm"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Q&A History */}
                    {questions[file.id] && questions[file.id].length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase text-muted-foreground">
                          Previous Questions
                        </p>
                        {questions[file.id].map((qa) => (
                          <div key={qa.id} className="rounded-md border bg-slate-50/50 p-3">
                            <p className="mb-2 text-sm font-medium text-slate-900">
                              Q: {qa.question}
                            </p>
                            {qa.answer && <p className="text-sm text-slate-600">A: {qa.answer}</p>}
                            <p className="mt-1.5 text-xs text-muted-foreground">
                              {format(new Date(qa.createdAt), "MMM d, h:mm a")}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No questions yet. Ask anything about this document!
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
