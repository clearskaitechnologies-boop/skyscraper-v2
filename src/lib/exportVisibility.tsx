"use client";
import React from "react";

export function ExportVisibility({ hideKeys }: { hideKeys?: string[] }) {
  if (!hideKeys?.length) return null;
  const selectors = hideKeys.map((k) => `[data-key="${cssEscape(k)}"]`).join(", ");
  const css = `${selectors}{ display:none !important; }`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

function cssEscape(s: string) {
  return String(s).replace(/"/g, '\\"');
}

// Helper to flatten hide maps into a single key list.
export function keysFromProfileHide(hide?: Record<string, string[]>) {
  if (!hide) return [] as string[];
  const bag: string[] = [];
  for (const section in hide) bag.push(...(hide[section] || []));
  return Array.from(new Set(bag));
}
