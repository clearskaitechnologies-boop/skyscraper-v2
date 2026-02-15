"use client";

import { useEffect, useState } from "react";

export interface UserPreferences {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

/**
 * Hook for managing user UI preferences
 * Persists to localStorage for session continuity
 */
export function useUserPrefs(): UserPreferences {
  const [collapsed, setCollapsed] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved !== null) {
      setCollapsed(saved === "true");
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", collapsed.toString());
  }, [collapsed]);

  return {
    sidebarCollapsed: collapsed,
    setSidebarCollapsed: setCollapsed,
  };
}
