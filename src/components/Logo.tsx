import clsx from "clsx";
import { useEffect, useState } from "react";

import { SkaiLogo } from "@/components/SkaiLogo";

type Props = {
  inSidebar?: boolean; // true when in left nav after login
  collapsed?: boolean; // sidebar collapsed state
  href?: string; // optional link wrapper
};

export default function Logo({ inSidebar, collapsed }: Props) {
  const [shrink, setShrink] = useState(false);

  useEffect(() => {
    if (inSidebar) return; // sidebar uses collapsed, not scroll
    const onScroll = () => setShrink(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [inSidebar]);

  // Public top bar sizes
  const publicSize = shrink ? 48 : 32;
  // Sidebar sizes (collapsed overrides)
  const sidebarSize = collapsed ? 32 : 48;

  return (
    <div className="flex items-center gap-2">
      <SkaiLogo
        size={inSidebar ? sidebarSize : publicSize}
        className={clsx(
          "logo-shrink",
          inSidebar ? (collapsed ? "h-8 w-8" : "h-12 w-12") : shrink ? "h-8 w-8" : "h-12 w-12"
        )}
      />
      {!inSidebar && (
        <span
          className={clsx(
            "text-brand-navy hidden font-semibold tracking-tight sm:block",
            shrink ? "text-lg" : "text-xl"
          )}
        >
          SkaiScraper™
        </span>
      )}
    </div>
  );
}
