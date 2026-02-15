"use client";
import { useEffect, useState } from "react";

export default function VersionStamp() {
  const [ver, setVer] = useState<{ commit?: string; buildTime?: string } | null>(null);

  useEffect(() => {
    let timer: any;
    
    async function check() {
      try {
        const r = await fetch("/api/diag/version", { cache: "no-store" });
        const j = await r.json();
        setVer(j);
        
        // Self-heal: if the DOM has data-build and it differs, hard reload
        const dom = document.documentElement.getAttribute("data-build");
        if (dom && j.buildTime && dom !== j.buildTime) {
          console.log("🔄 New build detected, refreshing...", { old: dom, new: j.buildTime });
          // Hard refresh to bust CDN
          location.replace(location.href.split("#")[0]);
        }
      } catch (err) {
        console.error("Version check failed:", err);
      }
      
      // Re-check every 60s
      timer = setTimeout(check, 60000);
    }
    
    check();
    return () => clearTimeout(timer);
  }, []);

  return null;
}
