/**
 * Document Categories Panel
 * Groups claim documents by category for easy client navigation
 */

"use client";

import { ClipboardCheck,FileSpreadsheet, FileText, Image } from "lucide-react";
import Link from "next/link";

interface ClaimDocument {
  id: string;
  fileName: string;
  originalName?: string | null;
  category?: string | null;
  fileType?: string;
  uploadedAt: Date;
  s3Key?: string | null;
}

interface DocumentCategoriesProps {
  documents: ClaimDocument[];
  claimId: string;
}

const categories = [
  { key: "estimate", label: "Estimates", icon: FileSpreadsheet, color: "bg-blue-500" },
  { key: "photo", label: "Photos", icon: Image, color: "bg-purple-500" },
  { key: "report", label: "Reports", icon: FileText, color: "bg-green-500" },
  { key: "supplement", label: "Supplements", icon: ClipboardCheck, color: "bg-orange-500" },
];

export default function DocumentCategories({ documents, claimId }: DocumentCategoriesProps) {
  const groupedDocs = documents.reduce(
    (acc, doc) => {
      const cat = doc.category?.toLowerCase() || "other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(doc);
      return acc;
    },
    {} as Record<string, ClaimDocument[]>
  );

  return (
    <div className="rounded-2xl border border-border bg-card px-6 py-6 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">Documents</h2>
      <p className="mt-1 text-sm text-muted-foreground">View all documents organized by category</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => {
          const count = groupedDocs[category.key]?.length || 0;
          const Icon = category.icon;

          return (
            <div
              key={category.key}
              className="rounded-xl border border-border bg-muted/30 px-4 py-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className={`rounded-lg ${category.color} p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-foreground">{count}</span>
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{category.label}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {count === 0 ? "No files yet" : `${count} file${count !== 1 ? "s" : ""}`}
              </p>
            </div>
          );
        })}
      </div>

      {/* Document list */}
      {documents.length > 0 && (
        <div className="mt-6 space-y-2">
          <h3 className="text-sm font-semibold text-foreground">All Documents</h3>
          <div className="divide-y divide-border rounded-lg border border-border bg-background">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {doc.originalName || doc.fileName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {doc.category || "General"} • Uploaded{" "}
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {doc.s3Key && (
                  <Link
                    href={`/api/files/download?key=${doc.s3Key}`}
                    className="text-sm font-medium text-primary hover:underline"
                    target="_blank"
                  >
                    View
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {documents.length === 0 && (
        <div className="mt-6 rounded-lg border border-border bg-muted/20 px-6 py-8 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">
            No documents have been shared yet. They'll appear here once uploaded.
          </p>
        </div>
      )}
    </div>
  );
}
