import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import MFAScreen from "@/components/MFAScreen";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export default function AdminSignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [showMFA, setShowMFA] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        toast.error(error.message);
        return;
      }

      // Check if MFA is required
      const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal.data?.nextLevel === "aal2" && aal.data?.currentLevel !== "aal2") {
        setShowMFA(true);
        return;
      }

      // Check if user has admin role
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        const isAdmin = roles?.some((r) => r.role === "admin" || r.role === "owner");

        if (isAdmin) {
          toast.success("Welcome back!");
          navigate("/dashboard");
        } else {
          await supabase.auth.signOut();
          toast.error("Access denied. Admin privileges required.");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleMFAComplete() {
    setShowMFA(false);

    // Check admin role after MFA verification
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const isAdmin = roles?.some((r) => r.role === "admin" || r.role === "owner");

      if (isAdmin) {
        toast.success("Welcome back!");
        navigate("/dashboard");
      } else {
        await supabase.auth.signOut();
        toast.error("Access denied. Admin privileges required.");
      }
    }
  }

  if (showMFA) {
    return <MFAScreen onDone={handleMFAComplete} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Admin Sign In</CardTitle>
          <CardDescription>Sign in to access the admin dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@clearskairoofing.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Signing in…" : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
