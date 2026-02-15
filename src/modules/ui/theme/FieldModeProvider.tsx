"use client";
import { createContext, ReactNode,useContext, useEffect, useState } from "react";

interface FieldModeContextValue {
  fieldMode: boolean;
  setFieldMode: (enabled: boolean) => void;
}

const FieldModeContext = createContext<FieldModeContextValue | undefined>(undefined);

export function FieldModeProvider({ children }: { children: ReactNode }) {
  const [fieldMode, setFieldModeState] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("fieldMode") === "true";
    setFieldModeState(saved);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("fieldMode", fieldMode.toString());
  }, [fieldMode, mounted]);

  const setFieldMode = (enabled: boolean) => {
    setFieldModeState(enabled);
  };

  return (
    <FieldModeContext.Provider value={{ fieldMode, setFieldMode }}>
      {children}
    </FieldModeContext.Provider>
  );
}

export function useFieldMode() {
  const context = useContext(FieldModeContext);
  if (!context) {
    throw new Error("useFieldMode must be used within FieldModeProvider");
  }
  return context;
}
