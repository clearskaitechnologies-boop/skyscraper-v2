import React from "react";

import TopNav from "../components/TopNav";
import { useBranding } from "../context/BrandingContext";

export default function BrandingDebug() {
  const { branding } = useBranding();
  return (
    <div>
      <TopNav />
      <main style={{ padding: 24 }}>
        <h1>Branding Debug</h1>
        <pre>{JSON.stringify(branding, null, 2)}</pre>
      </main>
    </div>
  );
}
