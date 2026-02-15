export const FILE_CONSTRAINTS = {
  maxSize: 15 * 1024 * 1024, // 15MB
  allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
};

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateFile(file: File): FileValidationResult {
  // Check file size
  if (file.size > FILE_CONSTRAINTS.maxSize) {
    return {
      isValid: false,
      error: `File size too large. Maximum size is ${formatFileSize(FILE_CONSTRAINTS.maxSize)}.`,
    };
  }

  // Check file type
  if (!FILE_CONSTRAINTS.allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${FILE_CONSTRAINTS.allowedTypes
        .map((t) => t.split("/")[1])
        .join(", ")}`,
    };
  }

  // Check file extension
  const extension = getFileExtension(file.name);
  if (!FILE_CONSTRAINTS.allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: `Invalid file extension. Allowed extensions: ${FILE_CONSTRAINTS.allowedExtensions.join(
        ", "
      )}`,
    };
  }

  return { isValid: true };
}

export function validateFiles(files: File[]): FileValidationResult {
  for (const file of files) {
    const result = validateFile(file);
    if (!result.isValid) {
      return result;
    }
  }
  return { isValid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function getFileExtension(filename: string): string {
  return "." + filename.split(".").pop()?.toLowerCase() || "";
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

export function createFilePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
