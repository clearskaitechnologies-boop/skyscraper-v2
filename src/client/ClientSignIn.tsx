import { useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const authSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function ClientSignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"password" | "magic">("password");
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);

    try {
      if (mode === "password") {
        const validated = authSchema.parse({ email, password });
        const { error } = await supabase.auth.signInWithPassword({
          email: validated.email,
          password: validated.password,
        });
        if (error) throw error;
        window.location.href = "/client";
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/client` },
        });
        if (error) throw error;
        toast({
          title: "Check your email",
          description: "We've sent you a magic link to sign in.",
        });
      }
    } catch (e: any) {
      toast({
        title: "Sign in failed",
        description: e.message || "Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto mt-16 max-w-sm space-y-4 p-6">
      <h1 className="text-xl font-semibold">Client Portal Sign In</h1>
      <div className="flex gap-2 text-xs">
        <Button
          variant={mode === "password" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("password")}
        >
          Email & Password
        </Button>
        <Button
          variant={mode === "magic" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("magic")}
        >
          Magic Link
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          placeholder="you@email.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {mode === "password" && (
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        )}
        <Button className="w-full" disabled={busy}>
          {busy ? "Signing in…" : "Continue"}
        </Button>
      </form>
    </main>
  );
}
