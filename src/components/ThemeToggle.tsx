"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  
  if (!mounted) return null;
  
  const active = resolvedTheme || theme;
  const isDark = active === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm transition-colors hover:bg-[var(--surface-1)]"
      aria-label="Toggle color theme"
    >
      {isDark ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}
