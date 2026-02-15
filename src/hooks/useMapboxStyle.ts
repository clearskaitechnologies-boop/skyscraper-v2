"use client";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function useMapboxStyle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // Detect initial theme
    const isDark = document.documentElement.classList.contains("dark") ||
                   document.documentElement.dataset.theme === "dark" ||
                   window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(isDark ? "dark" : "light");

    // Watch for theme changes
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark") ||
                     document.documentElement.dataset.theme === "dark";
      setTheme(isDark ? "dark" : "light");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const mapStyle = theme === "dark"
    ? "mapbox://styles/mapbox/dark-v11"
    : "mapbox://styles/mapbox/streets-v12";

  return { theme, mapStyle, isDark: theme === "dark" };
}
