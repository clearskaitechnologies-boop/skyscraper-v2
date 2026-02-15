// Toast notification hooks and utilities
import { toast } from "sonner";

// Success notifications
export const notify = {
  success: (message: string, description?: string) => {
    toast.success(message, { description });
  },

  error: (message: string, description?: string) => {
    toast.error(message, { description });
  },

  info: (message: string, description?: string) => {
    toast.info(message, { description });
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, { description });
  },

  loading: (message: string) => {
    return toast.loading(message);
  },

  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId);
  },
};

// File upload specific notifications
export const fileNotify = {
  uploadStarted: (filename: string) => {
    return notify.loading(`Uploading ${filename}...`);
  },

  uploadSuccess: (filename: string) => {
    notify.success(`Upload complete!`, `${filename} has been uploaded successfully.`);
  },

  uploadError: (filename: string, error: string) => {
    notify.error(`Upload failed`, `Failed to upload ${filename}: ${error}`);
  },

  uploadProgress: (filename: string, progress: number) => {
    const toastId = `upload-${filename}`;
    toast.loading(`Uploading ${filename}... ${Math.round(progress)}%`, {
      id: toastId,
    });
    return toastId;
  },

  deleteSuccess: (filename: string) => {
    notify.success(`File deleted`, `${filename} has been removed.`);
  },

  deleteError: (filename: string) => {
    notify.error(`Delete failed`, `Could not delete ${filename}.`);
  },
};

// Token system notifications
export const tokenNotify = {
  purchaseSuccess: (tokens: number, amount: string) => {
    notify.success(`Tokens purchased!`, `${tokens} tokens added to your account for ${amount}.`);
  },

  purchaseError: (error: string) => {
    notify.error(`Purchase failed`, error);
  },

  insufficientTokens: (required: number, available: number) => {
    notify.warning(
      `Insufficient tokens`,
      `You need ${required} tokens but only have ${available}. Please purchase more tokens.`
    );
  },

  tokensConsumed: (amount: number, operation: string) => {
    notify.info(`${amount} tokens used`, `Tokens consumed for ${operation}.`);
  },
};

// Authentication notifications
export const authNotify = {
  signInSuccess: (name?: string) => {
    notify.success(`Welcome ${name ? `back, ${name}` : "back"}!`);
  },

  signOutSuccess: () => {
    notify.success(`Signed out successfully`);
  },

  signInError: (error: string) => {
    notify.error(`Sign in failed`, error);
  },

  signUpSuccess: (name?: string) => {
    notify.success(`Account created!`, `Welcome to SkaiScraper™${name ? `, ${name}` : ""}!`);
  },
};

// Report and mockup notifications
export const reportNotify = {
  generationStarted: (type: "report" | "mockup") => {
    return notify.loading(`Generating ${type}...`);
  },

  generationSuccess: (type: "report" | "mockup", url?: string) => {
    notify.success(
      `${type.charAt(0).toUpperCase() + type.slice(1)} generated!`,
      url ? "Click to view the result." : undefined
    );
  },

  generationError: (type: "report" | "mockup", error: string) => {
    notify.error(`${type.charAt(0).toUpperCase() + type.slice(1)} generation failed`, error);
  },
};

// System notifications
export const systemNotify = {
  connectionLost: () => {
    notify.error(`Connection lost`, `Please check your internet connection.`);
  },

  connectionRestored: () => {
    notify.success(`Connection restored`);
  },

  maintenanceMode: () => {
    notify.warning(`Maintenance mode`, `Some features may be temporarily unavailable.`);
  },

  updateAvailable: () => {
    notify.info(`Update available`, `A new version of SkaiScraper™ is available.`);
  },
};

// Export main toast function for simple usage
export { toast };
