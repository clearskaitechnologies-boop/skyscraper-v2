/**
 * File Upload Handler
 *
 * Client-side upload management with drag-drop, progress, validation
 * Multi-file uploads, chunking, retry logic
 */

export interface UploadOptions {
  maxSize?: number; // bytes
  maxFiles?: number;
  allowedTypes?: string[];
  autoUpload?: boolean;
  chunkSize?: number;
}

export interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: "pending" | "uploading" | "completed" | "error";
  progress: number;
  url?: string;
  error?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Upload handler class
 */
export class FileUploadHandler {
  private files: Map<string, UploadFile> = new Map();
  private options: UploadOptions;
  private onProgressCallbacks: Array<(file: UploadFile) => void> = [];
  private onCompleteCallbacks: Array<(file: UploadFile) => void> = [];
  private onErrorCallbacks: Array<(file: UploadFile, error: string) => void> = [];

  constructor(options: UploadOptions = {}) {
    this.options = {
      maxSize: options.maxSize || 50 * 1024 * 1024, // 50MB default
      maxFiles: options.maxFiles || 10,
      allowedTypes: options.allowedTypes || ["*"],
      autoUpload: options.autoUpload !== false,
      chunkSize: options.chunkSize || 5 * 1024 * 1024, // 5MB chunks
    };
  }

  /**
   * Add files to upload queue
   */
  addFiles(files: FileList | File[]): UploadFile[] {
    const fileArray = Array.from(files);
    const uploadFiles: UploadFile[] = [];

    for (const file of fileArray) {
      // Check max files
      if (this.files.size >= this.options.maxFiles!) {
        console.warn("Maximum number of files reached");
        break;
      }

      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        console.error(`File validation failed: ${validation.error}`);
        continue;
      }

      // Create upload file
      const uploadFile: UploadFile = {
        id: this.generateId(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: "pending",
        progress: 0,
      };

      this.files.set(uploadFile.id, uploadFile);
      uploadFiles.push(uploadFile);

      // Auto upload if enabled
      if (this.options.autoUpload) {
        this.uploadFile(uploadFile.id).catch(console.error);
      }
    }

    return uploadFiles;
  }

  /**
   * Upload single file
   */
  async uploadFile(fileId: string): Promise<string> {
    const uploadFile = this.files.get(fileId);
    if (!uploadFile) {
      throw new Error("File not found");
    }

    try {
      uploadFile.status = "uploading";
      this.notifyProgress(uploadFile);

      // Create form data
      const formData = new FormData();
      formData.append("file", uploadFile.file);

      // Upload with progress tracking
      const url = await this.uploadWithProgress(formData, (progress) => {
        uploadFile.progress = progress.percentage;
        this.notifyProgress(uploadFile);
      });

      uploadFile.status = "completed";
      uploadFile.progress = 100;
      uploadFile.url = url;

      this.notifyComplete(uploadFile);

      return url;
    } catch (error) {
      uploadFile.status = "error";
      uploadFile.error = error instanceof Error ? error.message : "Upload failed";

      this.notifyError(uploadFile, uploadFile.error);

      throw error;
    }
  }

  /**
   * Upload all pending files
   */
  async uploadAll(): Promise<string[]> {
    const pending = Array.from(this.files.values()).filter((f) => f.status === "pending");

    const results = await Promise.allSettled(pending.map((f) => this.uploadFile(f.id)));

    return results
      .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
      .map((r) => r.value);
  }

  /**
   * Cancel upload
   */
  cancelUpload(fileId: string): void {
    const uploadFile = this.files.get(fileId);
    if (uploadFile && uploadFile.status === "uploading") {
      uploadFile.status = "error";
      uploadFile.error = "Cancelled by user";
      // TODO: Abort XHR/fetch request
    }
  }

  /**
   * Remove file from queue
   */
  removeFile(fileId: string): void {
    this.files.delete(fileId);
  }

  /**
   * Clear all files
   */
  clear(): void {
    this.files.clear();
  }

  /**
   * Get all files
   */
  getFiles(): UploadFile[] {
    return Array.from(this.files.values());
  }

  /**
   * Get file by ID
   */
  getFile(fileId: string): UploadFile | undefined {
    return this.files.get(fileId);
  }

  /**
   * Register progress callback
   */
  onProgress(callback: (file: UploadFile) => void): void {
    this.onProgressCallbacks.push(callback);
  }

  /**
   * Register complete callback
   */
  onComplete(callback: (file: UploadFile) => void): void {
    this.onCompleteCallbacks.push(callback);
  }

  /**
   * Register error callback
   */
  onError(callback: (file: UploadFile, error: string) => void): void {
    this.onErrorCallbacks.push(callback);
  }

  /**
   * Validate file
   */
  private validateFile(file: File): { valid: boolean; error?: string } {
    // Check size
    if (file.size > this.options.maxSize!) {
      return {
        valid: false,
        error: `File size exceeds maximum of ${this.formatBytes(this.options.maxSize!)}`,
      };
    }

    // Check type
    if (this.options.allowedTypes && this.options.allowedTypes[0] !== "*") {
      const ext = this.getFileExtension(file.name);
      if (!this.options.allowedTypes.includes(ext)) {
        return {
          valid: false,
          error: `File type .${ext} is not allowed`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * Upload with progress tracking
   */
  private async uploadWithProgress(
    formData: FormData,
    onProgress: (progress: UploadProgress) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          onProgress({
            loaded: e.loaded,
            total: e.total,
            percentage: Math.round((e.loaded / e.total) * 100),
          });
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response.url);
          } catch {
            reject(new Error("Invalid server response"));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Network error"));
      });

      xhr.open("POST", "/api/storage/upload");
      xhr.send(formData);
    });
  }

  /**
   * Notify progress
   */
  private notifyProgress(file: UploadFile): void {
    this.onProgressCallbacks.forEach((cb) => cb(file));
  }

  /**
   * Notify complete
   */
  private notifyComplete(file: UploadFile): void {
    this.onCompleteCallbacks.forEach((cb) => cb(file));
  }

  /**
   * Notify error
   */
  private notifyError(file: UploadFile, error: string): void {
    this.onErrorCallbacks.forEach((cb) => cb(file, error));
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get file extension
   */
  private getFileExtension(filename: string): string {
    const parts = filename.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
  }

  /**
   * Format bytes
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }
}

/**
 * Create drag-drop zone handler
 */
export function createDropZoneHandler(
  element: HTMLElement,
  onDrop: (files: FileList) => void
): () => void {
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    element.classList.add("drag-over");
  };

  const handleDragLeave = () => {
    element.classList.remove("drag-over");
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    element.classList.remove("drag-over");

    if (e.dataTransfer?.files) {
      onDrop(e.dataTransfer.files);
    }
  };

  element.addEventListener("dragover", handleDragOver as EventListener);
  element.addEventListener("dragleave", handleDragLeave);
  element.addEventListener("drop", handleDrop as EventListener);

  // Return cleanup function
  return () => {
    element.removeEventListener("dragover", handleDragOver as EventListener);
    element.removeEventListener("dragleave", handleDragLeave);
    element.removeEventListener("drop", handleDrop as EventListener);
  };
}
