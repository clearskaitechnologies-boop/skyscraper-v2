import React from "react";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";

export default function PublicLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="pt-20">
        {/* leaves space for fixed nav */}
        {children}
      </main>
      <Footer />
    </div>
  );
}
