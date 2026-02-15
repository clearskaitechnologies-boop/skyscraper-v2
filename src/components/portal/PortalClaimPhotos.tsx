"use client";

import { RefreshCw,Upload } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ClaimPhoto = {
  id: string;
  publicUrl: string;
  title: string;
  mimeType: string | null;
  createdAt: string;
};

interface PortalClaimPhotosProps {
  claimId: string;
}

export function PortalClaimPhotos({ claimId }: PortalClaimPhotosProps) {
  const [photos, setPhotos] = useState<ClaimPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPhotos = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch(`/api/portal/claims/${claimId}/photos`);
      if (!res.ok) {
        throw new Error(`Failed to load photos (${res.status})`);
      }

      const data = await res.json();
      setPhotos(data.photos ?? []);
    } catch (err: any) {
      console.error(err);
      setError("Could not load photos. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [claimId]);

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/portal/claims/${claimId}/photos`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed (${res.status})`);
      }

      const data = await res.json();
      setPhotos((prev) => [data.photo, ...prev]);

      // reset input
      event.target.value = "";
    } catch (err: any) {
      console.error(err);
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold">Photos &amp; Site Pictures</CardTitle>
        <div className="flex items-center gap-2">
          <label
            htmlFor="photo-upload"
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90",
              isUploading && "cursor-not-allowed opacity-50"
            )}
          >
            <Upload className="h-4 w-4" />
            Upload Photo
            <Input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={onFileChange}
              disabled={isUploading}
              className="sr-only"
            />
          </label>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPhotos}
            disabled={isLoading || isUploading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {isLoading && !photos.length ? (
          <p className="text-sm text-muted-foreground">Loading photos…</p>
        ) : !photos.length ? (
          <p className="text-sm text-muted-foreground">
            No photos uploaded yet. Add your first site picture above.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo) => (
              <a
                key={photo.id}
                href={photo.publicUrl}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "group relative overflow-hidden rounded-lg border bg-muted/40",
                  "transition hover:border-primary/60 hover:bg-muted"
                )}
              >
                {photo.mimeType?.startsWith("image/") ? (
                  <img
                    src={photo.publicUrl}
                    alt={photo.title}
                    className="h-32 w-full object-cover transition-transform group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-32 items-center justify-center px-2 text-center text-xs text-muted-foreground">
                    {photo.title}
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="truncate text-xs font-medium text-white">{photo.title}</p>
                </div>
              </a>
            ))}
          </div>
        )}

        {isUploading && (
          <p className="mt-2 text-xs text-muted-foreground">
            Uploading… please don't close the page.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
