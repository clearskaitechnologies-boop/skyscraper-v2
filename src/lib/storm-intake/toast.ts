/**
 * Toast notifications for Storm Intake
 * Wrapper around Sonner toast with branded messaging
 */

import { toast as sonnerToast } from "sonner";

export const toast = {
  success: (message: string) => {
    sonnerToast.success(message);
  },

  error: (message: string) => {
    sonnerToast.error(message);
  },

  loading: (message: string) => {
    return sonnerToast.loading(message);
  },

  dismiss: (toastId?: string | number) => {
    if (toastId) {
      sonnerToast.dismiss(toastId);
    }
  },

  stormIntake: {
    saved: () => sonnerToast.success("✅ Progress saved"),
    saveError: () => sonnerToast.error("❌ Failed to save progress"),

    weatherLoading: () => sonnerToast.loading("🌩️ Checking storm activity..."),
    weatherLoaded: () => sonnerToast.success("✅ Weather data loaded"),
    weatherError: () => sonnerToast.error("❌ Weather check failed"),

    uploadStarted: (filename: string) => sonnerToast.loading(`📤 Uploading ${filename}...`),
    uploadSuccess: (filename: string) => sonnerToast.success(`✅ ${filename} uploaded`),
    uploadError: (filename: string) => sonnerToast.error(`❌ Failed to upload ${filename}`),

    completing: () => sonnerToast.loading("📊 Generating report..."),
    completed: () => sonnerToast.success("✅ Assessment complete! Report generated."),
    completeError: () => sonnerToast.error("❌ Failed to complete assessment"),

    invalidAddress: () => sonnerToast.error("❌ Please enter a valid address"),
    invalidRoof: () => sonnerToast.error("❌ Please select a roof type"),
    invalidDamage: () => sonnerToast.error("❌ Please select at least one damage indicator"),

    emailSent: () => sonnerToast.success("📧 Report sent to your email"),
    emailFailed: () => sonnerToast.error("❌ Failed to send email"),
  },
};
