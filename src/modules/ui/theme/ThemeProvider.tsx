"use client";

// ============================================================================
// THEME PROVIDER - Using next-themes for Light/Dark Mode
// ============================================================================

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

import { FieldModeProvider } from "./FieldModeProvider";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={true}
      disableTransitionOnChange
    >
      <FieldModeProvider>{children}</FieldModeProvider>
    </NextThemesProvider>
  );
}
