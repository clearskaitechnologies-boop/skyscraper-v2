"use client";
import { useState, useTransition } from "react";

export function ViewAsClientButton({ clientId, existingToken }: { clientId: string; existingToken?: string | null }) {
  const [link, setLink] = useState<string | null>(existingToken ? `/portal/${existingToken}` : null);
  const [pending, start] = useTransition();

  async function handleClick() {
    if (link) {
      window.open(link, "_blank");
      return;
    }
    start(async () => {
      const res = await fetch("/api/portal/generate-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, orgId: "placeholder-org" }),
      });
      if (!res.ok) {
        alert("Failed to generate portal link");
        return;
      }
      const data = await res.json();
      const url = `/portal/${data.token}`;
      setLink(url);
      window.open(url, "_blank");
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
    >
      {pending ? "Opening..." : "View as Client"}
    </button>
  );
}
