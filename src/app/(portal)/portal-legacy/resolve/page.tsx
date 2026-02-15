"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PortalResolvePage() {
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/portal/resolve-token?token=${encodeURIComponent(token)}`);
      if (!res.ok) {
        setError("Invalid or expired token");
      } else {
        router.push(`/portal/${token}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Enter Portal Access Token</h1>
        <input
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="Paste access token"
          className="w-full rounded border px-3 py-2 text-sm"
        />
        {error && <div className="text-xs text-red-600">{error}</div>}
        <button
          type="submit"
          disabled={loading || !token}
          className="w-full rounded bg-blue-600 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Resolving..." : "Enter Portal"}
        </button>
        <p className="text-xs text-gray-500">Your contractor sends this secure link or token for private claim visibility.</p>
      </form>
    </div>
  );
}
