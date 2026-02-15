"use client";
import React, { useTransition } from "react";

export function VisibilityToggle({ initial, onChange }: { initial: boolean; onChange?: (v: boolean) => Promise<void> | void }) {
  const [value, setValue] = React.useState(initial);
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      onClick={() => start(async () => { const next = !value; setValue(next); await onChange?.(next); })}
      className={`rounded border px-2 py-1 text-xs ${value ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}
      disabled={pending}
    >
      {pending ? 'Saving…' : value ? 'Public' : 'Private'}
    </button>
  );
}
