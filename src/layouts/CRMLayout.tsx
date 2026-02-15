import React from "react";

import { AppSidebar } from "@/app/(app)/_components/AppSidebar";
import Header from "@/components/layout/Header";

export default function CRMLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
