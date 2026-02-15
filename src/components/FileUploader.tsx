import { CheckCircle, Loader2, Upload, XCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { StorageAdapter,uploadFile } from "@/lib/storage";

interface FileUploaderProps {
  onUploadComplete?: (urls: string[]) => void;
  adapter?: StorageAdapter;
  multiple?: boolean;
  accept?: string;
}

const FileUploader = ({
  onUploadComplete,
  adapter = "mock",
  multiple = true,
  accept = "image/*",
}: FileUploaderProps) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadPromises = Array.from(files).map((file) => uploadFile(file, adapter));
      const results = await Promise.all(uploadPromises);
      const urls = results.map((r) => r.url);

      setUploadedUrls(urls);
      onUploadComplete?.(urls);

      toast({
        title: "Upload successful",
        description: `${urls.length} file(s) uploaded successfully`,
      });
    } catch (e) {
      const errorMessage = String(e);
      setError(errorMessage);
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary">
        <input
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={(e) => {
            setFiles(e.target.files);
            setUploadedUrls([]);
            setError(null);
          }}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-2 text-sm text-muted-foreground">Click to upload or drag and drop</p>
          <p className="text-xs text-muted-foreground">
            {accept === "image/*" ? "PNG, JPG, HEIC up to 20MB each" : "Any file up to 20MB"}
          </p>
        </label>
      </div>

      {files && files.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">{files.length} file(s) selected</div>
          <Button onClick={handleUpload} disabled={uploading} className="w-full">
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Files
              </>
            )}
          </Button>
        </div>
      )}

      {uploadedUrls.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-success">
          <CheckCircle className="h-4 w-4" />
          <span>{uploadedUrls.length} file(s) uploaded successfully</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <XCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
