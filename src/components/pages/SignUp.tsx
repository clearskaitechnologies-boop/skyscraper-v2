import Image from "next/image";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import clearSkaiLogo from "@/assets/clearskai-logo.jpg";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/integrations/supabase/client";
import { signUpSchema } from "@/lib/validation/schemas";

export default function SignUp() {
  const nav = useNavigate();
  const { success, error: showError } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!agree) {
      return setError("Please agree to the Terms to continue.");
    }

    // SECURITY: Validate input with Zod schema (checks password complexity)
    const result = signUpSchema.safeParse({ email, password });
    if (!result.success) {
      return setError(result.error.issues[0].message);
    }

    if (password !== confirm) {
      return setError("Passwords do not match.");
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) {
        setError(error.message || "Unable to sign up.");
        showError(error.message);
      } else {
        success("Check your email to confirm your account.", "Sign up successful");
        nav("/auth");
      }
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
            <h1 className="text-2xl font-bold">Create your ClearSKai account</h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              You'll receive a confirmation email to activate your login.
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div>
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type="password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agree}
                onCheckedChange={(checked) => setAgree(checked === true)}
              />
              <Label htmlFor="terms" className="cursor-pointer text-sm">
                I agree to the{" "}
                <Link to="/terms" className="text-primary hover:underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Creating…" : "Create account"}
            </Button>

            <div className="text-center text-sm">
              <Link
                to="/auth"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                Have an account? Sign in
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
