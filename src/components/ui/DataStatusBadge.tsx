"use client";
import React from 'react';

export function DataStatusBadge({ label, time }: { label?: string; time?: Date | string }) {
  const ts = typeof time === 'string' ? time : time ? time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : null;
  return (
    <span className="inline-flex items-center gap-1 rounded border border-[color:var(--border)] bg-[var(--surface-2)] px-2 py-1 text-xs text-[color:var(--muted)]">
      <span>{label || 'Data snapshot'}{ts ? ` • ${ts}` : ''}</span>
    </span>
  );
}

export default DataStatusBadge;
