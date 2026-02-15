import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type Toast = {
  id: string;
  title?: string;
  message: string;
  type?: "success" | "error" | "info";
  timeoutMs?: number;
};

type ToastContextType = {
  toasts: Toast[];
  show: (t: Omit<Toast, "id">) => string;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).slice(2);
      const toast: Toast = { id, type: "info", timeoutMs: 3500, ...t };
      setToasts((prev) => [...prev, toast]);
      if (toast.timeoutMs && toast.timeoutMs > 0) {
        setTimeout(() => dismiss(id), toast.timeoutMs);
      }
      return id;
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toasts, show, dismiss }), [toasts, show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Sonner handles toasts globally; keep provider for legacy use but do not render custom Toaster here. */}
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToastContext must be used within <ToastProvider>");
  return ctx;
}

function Toaster() {
  const { toasts, dismiss } = useToastContext();

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-xl border p-4 shadow-lg animate-in slide-in-from-right ${
            t.type === "error"
              ? "border-l-4 border-red-200 border-l-red-500 bg-red-50"
              : t.type === "success"
                ? "border-l-4 border-green-200 border-l-green-500 bg-green-50"
                : "border-l-4 border-blue-200 border-l-blue-500 bg-blue-50"
          }`}
        >
          {t.title && <div className="mb-1 font-semibold">{t.title}</div>}
          <div className="text-sm">{t.message}</div>
          <div className="mt-2 text-right">
            <button
              onClick={() => dismiss(t.id)}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
