// app/layout.tsx
import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs"; // Updated import for Clerk 6.x
import React from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
