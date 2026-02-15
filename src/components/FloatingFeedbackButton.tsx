"use client";

import { MessageSquare, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export default function FloatingFeedbackButton() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Floating Button */}
      <Link href="/feedback">
        <Button
          size="lg"
          className="group h-14 gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-6 shadow-lg transition-all hover:scale-105 hover:shadow-xl dark:from-blue-500 dark:to-blue-600"
        >
          <MessageSquare className="h-5 w-5" />
          <span className="font-semibold">Feedback</span>
        </Button>
      </Link>

      {/* Dismiss button (small X) */}
      <button
        onClick={() => setIsVisible(false)}
        className="rounded-full bg-slate-200 p-1.5 text-slate-600 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600"
        aria-label="Hide feedback button"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
