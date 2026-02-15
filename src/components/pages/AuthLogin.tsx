import React, { useState } from "react";
import { useLocation,useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/useToast";
import { sendMagicLink } from "@/lib/auth";
export default function AuthLogin() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const nav = useNavigate();
  const loc = useLocation();

  const inviteOnly = (process.env.NEXT_PUBLIC_INVITE_ONLY || "false") === "true";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await sendMagicLink(email, !inviteOnly);
      // supabase response shape may include `error` — treat result as unknown and narrow
      const maybeRes = res as unknown as { error?: { message?: string } } | null;
      const errObj = maybeRes?.error;
      if (errObj) {
        const msg = errObj.message ?? String(errObj);
        if (msg && msg.includes("signups_not_allowed")) {
          toast.info("Sign-ups are disabled (invite-only).", "Sign-ups disabled");
        } else {
          toast.error(msg, "Could not send link");
        }
        return;
      }

      toast.success("Check your email — we sent a magic link.", "Link sent");
      // Optionally route to a confirm page or back
      const locState = loc.state as { from?: { pathname?: string } } | null;
      const to = locState?.from?.pathname || "/";
      nav(to);
    } catch (err: any) {
      const e = err as unknown;
      toast.error(e instanceof Error ? e.message : String(e) || "Unknown error", "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
          <h1 className="mb-2 text-2xl font-bold">Request a Magic Link</h1>
          <p className="mb-4 text-sm text-muted-foreground">
            Enter your email to receive a secure sign-in link.
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@company.com"
              required
            />
            <div className="flex items-center gap-3">
              <Button type="submit" className="flex-1" disabled={busy}>
                {busy ? "Sending…" : "Send Magic Link"}
              </Button>
              <Button variant="outline" onClick={() => nav("/signup")}>
                Start Free
              </Button>
            </div>
          </form>

          {inviteOnly && (
            <div className="mt-4 text-sm text-muted-foreground">
              Sign-ups are currently invite-only. If you have an invite, request access via the link
              above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
