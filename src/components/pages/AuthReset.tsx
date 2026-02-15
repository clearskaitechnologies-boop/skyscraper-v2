import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocation,useNavigate } from "react-router-dom";

import clearSkaiLogo from "@/assets/clearskai-logo.jpg";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export default function AuthReset() {
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<"request" | "update">("request");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (session && loc.hash.includes("type=recovery"))) {
        setPhase("update");
      }
    });

    if (loc.hash.includes("type=recovery")) setPhase("update");

    return () => subscription.unsubscribe();
  }, [loc.hash]);

  async function requestReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    const redirectTo = `${window.location.origin}/auth/reset`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) setError(error.message);
    else setMessage("Check your email for a reset link.");
  }

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else {
      setMessage("Password updated. Redirecting to sign in…");
      setTimeout(() => nav("/auth"), 1000);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <div className="mb-8 flex flex-col items-center">
            <Image src={clearSkaiLogo} alt="ClearSKai" className="mb-4 h-16 w-auto" />
            <h1 className="text-2xl font-bold">Reset your password</h1>
          </div>

          {phase === "request" && (
            <form onSubmit={requestReset} className="space-y-4">
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@clearskairoofing.com"
                />
              </div>
              <Button type="submit" className="w-full">
                Send reset link
              </Button>
              {message && <p className="text-sm text-green-600">{message}</p>}
              {error && <p className="text-sm text-red-600">{error}</p>}
            </form>
          )}

          {phase === "update" && (
            <form onSubmit={updatePassword} className="space-y-4">
              <div>
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  minLength={8}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a new password"
                />
              </div>
              <Button type="submit" className="w-full">
                Update password
              </Button>
              {message && <p className="text-sm text-green-600">{message}</p>}
              {error && <p className="text-sm text-red-600">{error}</p>}
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
