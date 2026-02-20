/**
 * File Upload Validation Utilities
 * Server-side validation for file uploads
 */

import { logWarn } from "./log";

/**
 * File upload limits configuration
 */
export const UPLOAD_LIMITS = {
  // Max file size: 50MB
  MAX_FILE_SIZE: 50 * 1024 * 1024,

  // Max photo file size: 25MB (stricter for images)
  MAX_PHOTO_SIZE: 25 * 1024 * 1024,

  // Allowed image MIME types
  ALLOWED_IMAGE_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/heic",
    "image/heif",
  ],

  // Allowed document MIME types
  ALLOWED_DOCUMENT_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "text/csv",
  ],
} as const;

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate file upload for photos
 */
export function validatePhotoUpload(file: {
  size: number;
  type: string;
  name: string;
}): FileValidationResult {
  // Check file size
  if (file.size > UPLOAD_LIMITS.MAX_PHOTO_SIZE) {
    logWarn("photo_size_exceeded", {
      fileName: file.name,
      fileSize: file.size,
      maxSize: UPLOAD_LIMITS.MAX_PHOTO_SIZE,
    });
    return {
      valid: false,
      error: `Photo size exceeds maximum allowed size of ${UPLOAD_LIMITS.MAX_PHOTO_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check if file is empty
  if (file.size === 0) {
    logWarn("empty_photo_upload", { fileName: file.name });
    return {
      valid: false,
      error: "Photo file is empty",
    };
  }

  // Check MIME type
  if (!UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES.includes(file.type)) {
    logWarn("invalid_photo_type", {
      fileName: file.name,
      fileType: file.type,
    });
    return {
      valid: false,
      error: `Invalid photo type: ${file.type}. Allowed types: JPEG, PNG, WebP, GIF, HEIC`,
    };
  }

  return { valid: true };
}

/**
 * Validate file upload for documents
 */
export function validateDocumentUpload(file: {
  size: number;
  type: string;
  name: string;
}): FileValidationResult {
  // Check file size
  if (file.size > UPLOAD_LIMITS.MAX_FILE_SIZE) {
    logWarn("document_size_exceeded", {
      fileName: file.name,
      fileSize: file.size,
      maxSize: UPLOAD_LIMITS.MAX_FILE_SIZE,
    });
    return {
      valid: false,
      error: `Document size exceeds maximum allowed size of ${UPLOAD_LIMITS.MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check if file is empty
  if (file.size === 0) {
    logWarn("empty_document_upload", { fileName: file.name });
    return {
      valid: false,
      error: "Document file is empty",
    };
  }

  // Check MIME type
  if (!UPLOAD_LIMITS.ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
    logWarn("invalid_document_type", {
      fileName: file.name,
      fileType: file.type,
    });
    return {
      valid: false,
      error: `Invalid document type: ${file.type}. Allowed types: PDF, Word, Excel, CSV, TXT`,
    };
  }

  return { valid: true };
}

/**
 * Validate generic file upload
 * Allows both images and documents
 */
export function validateFileUpload(file: {
  size: number;
  type: string;
  name: string;
}): FileValidationResult {
  // Check file size
  if (file.size > UPLOAD_LIMITS.MAX_FILE_SIZE) {
    logWarn("file_size_exceeded", {
      fileName: file.name,
      fileSize: file.size,
      maxSize: UPLOAD_LIMITS.MAX_FILE_SIZE,
    });
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${UPLOAD_LIMITS.MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check if file is empty
  if (file.size === 0) {
    logWarn("empty_file_upload", { fileName: file.name });
    return {
      valid: false,
      error: "File is empty",
    };
  }

  // Check MIME type (allow both images and documents)
  const isImage = UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES.includes(file.type);
  const isDocument = UPLOAD_LIMITS.ALLOWED_DOCUMENT_TYPES.includes(file.type);

  if (!isImage && !isDocument) {
    logWarn("unsupported_file_type", {
      fileName: file.name,
      fileType: file.type,
    });
    return {
      valid: false,
      error: `Unsupported file type: ${file.type}. Please upload an image or document.`,
    };
  }

  return { valid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Get user-friendly error message for upload failures
 */
export function getUploadErrorMessage(error: any): string {
  if (error?.message?.includes("size exceeds")) {
    return error.message;
  }
  if (error?.message?.includes("type")) {
    return error.message;
  }
  if (error?.message?.includes("Rate limit")) {
    return error.message;
  }
  return "Failed to upload file. Please try again.";
}
