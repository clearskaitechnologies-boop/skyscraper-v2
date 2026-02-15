import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  // Dev bypass: in development you can append ?dev=1 to the URL to bypass auth checks for local testing.
  const devBypass =
    typeof window !== "undefined" &&
    process.env.NODE_ENV === "development" &&
    new URL(window.location.href).searchParams.get("dev") === "1";
  const location = useLocation();

  // checking/onboarding state must be declared unconditionally and before
  // any early returns so React hooks rules are preserved.
  const [checking, setChecking] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // If authenticated, ensure basic onboarding/profile exists; redirect to onboarding if missing
  // Run onboarding check whenever session changes. The effect below will early-return
  // if there is no session.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!session) {
          if (mounted) {
            setHasOnboarded(false);
            setChecking(false);
          }
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          if (mounted) setHasOnboarded(false);
          return;
        }

        const { data: prof } = await supabase
          .from("user_profiles")
          .select("org_id,name")
          .eq("user_id", user.id)
          .maybeSingle();

        type ProfileRow = { org_id?: string | null; name?: string | null } | null;
        const profile = prof as unknown as ProfileRow;
        if (mounted) setHasOnboarded(!!(profile && profile.org_id && profile.name));
      } catch (err: unknown) {
        console.error("Onboarding check failed", err instanceof Error ? err.message : String(err));
        if (mounted) setHasOnboarded(false);
      } finally {
        if (mounted) setChecking(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [session]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (devBypass) {
    // allow access in dev when explicitly requested
    return <>{children}</>;
  }

  if (!session) {
    // redirect unauthorized users to the magic-link login page
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Validating account…</p>
        </div>
      </div>
    );
  }

  if (hasOnboarded === false) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
