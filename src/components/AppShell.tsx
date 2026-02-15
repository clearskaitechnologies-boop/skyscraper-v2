"use client";
import { TopNav } from "@/modules/navigation/TopNav";
// ✅ SINGLE CHAT WIDGET - removed duplicates (SkaiAssistantOverlay, AssistantLauncher)

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <TopNav />
      <main className="pb-8 pt-20">{children}</main>
      {/* Chat widget is mounted in (app)/layout.tsx - removed duplicate here */}
    </div>
  );
}
