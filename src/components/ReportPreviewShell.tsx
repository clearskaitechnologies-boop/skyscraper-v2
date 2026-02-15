import { ReactNode,useEffect } from "react";

interface ReportPreviewShellProps {
  children: ReactNode;
}

export function ReportPreviewShell({ children }: ReportPreviewShellProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Ctrl/Cmd + P → Export PDF
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        (document.getElementById("btn-export-pdf") as HTMLButtonElement)?.click();
      }

      // Ctrl/Cmd + S → AI Summary
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        (document.getElementById("btn-ai-summary") as HTMLButtonElement)?.click();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div role="region" aria-label="Report preview" className="space-y-4">
      {children}
    </div>
  );
}
