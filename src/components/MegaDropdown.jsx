import React, { useEffect, useRef } from "react";

export default function MegaDropdown({ id, items = [], open = false }) {
  const panelRef = useRef(null);
  useEffect(() => {
    if (open && panelRef.current) {
      // focus first link
      const a = panelRef.current.querySelector("a");
      if (a) a.focus();
    }
  }, [open]);

  return (
    <div
      id={id}
      ref={panelRef}
      role="menu"
      aria-hidden={!open}
      style={{ display: open ? "block" : "none", padding: 12 }}
    >
      <div style={{ display: "flex", gap: 12 }}>
        {items.map((it) => (
          <a key={it.title} href={it.href} style={{ padding: 8, display: "block" }}>
            {it.title}
          </a>
        ))}
      </div>
    </div>
  );
}
