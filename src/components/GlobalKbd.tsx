"use client";
import { useEffect } from "react";

export default function GlobalKbd() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = navigator.platform.includes("Mac") ? e.metaKey : e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        document.querySelector<HTMLInputElement>("[data-global-search]")?.focus();
      }
      // Cmd+Shift+A → Claims Analysis
      if (meta && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        window.location.href = '/ai/claims-analysis';
      }
      // Cmd+Shift+R → Report Assembly
      if (meta && e.shiftKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        window.location.href = '/ai/report-assembly';
      }
      // Cmd+Shift+B → Rebuttal Builder
      if (meta && e.shiftKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        window.location.href = '/claims/rebuttal-builder';
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  return null;
}
