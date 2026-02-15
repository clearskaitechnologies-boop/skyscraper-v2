"use client";

import {
  Calendar,
  Download,
  ExternalLink,
  File,
  FileText,
  Filter,
  Image,
  Lock,
  MoreHorizontal,
  StickyNote,
  User,
} from "lucide-react";
import { useEffect,useState } from "react";
import useSWR from "swr";

import { Badge } from "@/components/ui/badge";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface FileAsset {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  publicUrl: string;
  category: string;
  note?: string;
  createdAt: string;
  ownerId: string;
}

const categories = [
  { value: "all", label: "All Files", color: "bg-gray-100 text-gray-800" },
  { value: "damage", label: "Damage", color: "bg-red-100 text-red-800" },
  { value: "estimate", label: "Estimate", color: "bg-blue-100 text-blue-800" },
  { value: "invoice", label: "Invoice", color: "bg-green-100 text-green-800" },
  {
    value: "carrier",
    label: "Insurance",
    color: "bg-purple-100 text-purple-800",
  },
  { value: "other", label: "Other", color: "bg-gray-100 text-gray-800" },
];

export default function FilesList({ leadId, claimId }: { leadId?: string; claimId?: string }) {
  const [files, setFiles] = useState<FileAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Check storage status
  const { data: storageData } = useSWR("/api/health/storage", fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 60000,
  });

  const storageEnabled = storageData?.enabled ?? true;
  const storageReady = storageData?.ready ?? true;
  const isStorageDisabled = !storageEnabled || !storageReady;

  useEffect(() => {
    fetchFiles();
  }, [leadId, claimId]);

  const fetchFiles = async () => {
    try {
      const params = new URLSearchParams();
      if (leadId) params.set("leadId", leadId);
      if (claimId) params.set("claimId", claimId);

      const res = await fetch(`/api/files?${params}`);
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch (error) {
      console.error("Failed to fetch files:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <Image className="h-5 w-5 text-blue-500" />;
    if (mimeType === "application/pdf") return <FileText className="h-5 w-5 text-red-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const getCategoryColor = (category: string) => {
    return categories.find((c) => c.value === category)?.color || "bg-gray-100 text-gray-800";
  };

  const getCategoryLabel = (category: string) => {
    return categories.find((c) => c.value === category)?.label || category;
  };

  const filteredFiles =
    selectedCategory === "all" ? files : files.filter((file) => file.category === selectedCategory);

  const categoryCounts = categories.reduce(
    (acc, category) => {
      if (category.value === "all") {
        acc[category.value] = files.length;
      } else {
        acc[category.value] = files.filter((f) => f.category === category.value).length;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selectedCategory === category.value
                ? category.color + " ring-2 ring-blue-500 ring-offset-2"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            title={`Filter by ${category.label}`}
          >
            {category.label}
            {categoryCounts[category.value] > 0 && (
              <span className="ml-1 rounded bg-white bg-opacity-50 px-1">
                {categoryCounts[category.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Files List */}
      {filteredFiles.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          {isStorageDisabled ? (
            <>
              <Lock className="mx-auto mb-2 h-12 w-12 text-amber-500 opacity-75" />
              <p className="mb-1 font-medium text-amber-700">
                Uploads are temporarily disabled while billing is verified.
              </p>
              <button
                className="inline-flex items-center gap-1 text-sm text-blue-600 underline hover:text-blue-800"
                onClick={() => {
                  // TODO: Open learn more modal
                  console.log("Learn more about storage status");
                }}
              >
                Learn more
                <ExternalLink className="h-3 w-3" />
              </button>
            </>
          ) : (
            <>
              <File className="mx-auto mb-2 h-12 w-12 opacity-50" />
              <p>
                {selectedCategory === "all"
                  ? "No files uploaded yet"
                  : `No ${getCategoryLabel(selectedCategory).toLowerCase()} files`}
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between rounded-lg border bg-white p-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex min-w-0 flex-1 items-center space-x-3">
                {getFileIcon(file.mimeType)}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center space-x-2">
                    <h4 className="truncate text-sm font-medium text-gray-900">{file.filename}</h4>
                    <Badge className={`text-xs ${getCategoryColor(file.category)} border-0`}>
                      {getCategoryLabel(file.category)}
                    </Badge>
                    {file.note && (
                      <div className="flex items-center" title={file.note}>
                        <StickyNote className="h-3 w-3 text-amber-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{formatFileSize(file.sizeBytes)}</span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(file.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>User</span>
                    </div>
                  </div>
                  {file.note && (
                    <div className="mt-1 text-xs italic text-gray-600">"{file.note}"</div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={file.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 rounded border border-blue-200 px-3 py-1 text-sm text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800"
                  title="Open file"
                >
                  <Download className="h-4 w-4" />
                  <span>Open</span>
                </a>
                <button
                  className="rounded p-1 text-gray-400 hover:text-gray-600"
                  title="More options"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
