import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import clearSkaiLogo from "@/assets/clearskai-logo.jpg";
import { PageTitle } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { signInSchema } from "@/lib/validation/schemas";

export default function SignIn() {
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      // SECURITY: Validate input with Zod schema
      const result = signInSchema.safeParse({ email, password });
      if (!result.success) {
        setError(result.error.issues[0].message);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message || "Invalid login credentials");
        return;
      }

      const to = (loc.state as any)?.from?.pathname || "/crm/dashboard";
      nav(to, { replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <div className="mb-8 flex flex-col items-center">
            <Image src={clearSkaiLogo} alt="ClearSKai" className="mb-4 h-16 w-auto" />
            <PageTitle>Welcome to ClearSKai</PageTitle>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Sign in to access your AI-powered trades platform
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>

            <div>
              <Label htmlFor="password">Your password</Label>
              <div className="flex gap-2">
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShow((s) => !s)}
                  className="px-3"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </Button>

            <div className="flex justify-between text-sm">
              <Link
                to="/auth/reset"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                Forgot your password?
              </Link>
              <Link
                to="/signup"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                Don't have an account? Sign up
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
