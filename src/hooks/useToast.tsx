import { useToastContext } from "@/components/toast/ToastProvider";

export function useToast() {
  const { show } = useToastContext();
  return {
    info: (message: string, title?: string) => show({ message, title, type: "info" }),
    success: (message: string, title?: string) => show({ message, title, type: "success" }),
    error: (message: string, title?: string) => show({ message, title, type: "error" }),
    show,
  };
}
