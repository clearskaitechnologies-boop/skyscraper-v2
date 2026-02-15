import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ensureProfile } from "@/lib/supabaseClient";

export default function AuthPage() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      // ensure a profile row exists for this user
      try {
        ensureProfile(supabase, user);
      } catch (e) {
        console.error(e);
      }
      navigate("/crm/dashboard", { replace: true });
    }
  }, [user, navigate, supabase]);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    if (!email) return setStatus("Please enter an email");
    setStatus("Sending magic link...");
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setStatus(error.message);
    } else {
      setStatus("Magic link sent — check your email.");
    }
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-4 text-3xl font-bold">Sign in to SkaiScraper</h1>
      <p className="mb-6">Enter your email to receive a magic link.</p>
      <form onSubmit={sendMagicLink} className="w-full max-w-md space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full rounded border px-4 py-3"
        />
        <div className="flex items-center justify-center">
          <button className="rounded bg-blue-600 px-6 py-3 text-white" type="submit">
            Send Magic Link
          </button>
        </div>
      </form>
      {status && <div className="mt-4 text-sm">{status}</div>}
    </div>
  );
}
