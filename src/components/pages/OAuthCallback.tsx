import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";

export default function OAuthCallback() {
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      // Supabase handles the session exchange automatically
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        // Check if user has a profile & org
        const { data: prof } = await supabase
          .from("user_profiles")
          .select("id,org_id,name")
          .eq("user_id", session.user.id)
          .maybeSingle();

        type ProfileRow = { id?: string; org_id?: string | null } | null;
        const profile = prof as unknown as ProfileRow;

        if (!profile) {
          // Create a default org and profile for first-time users
          try {
            const orgRes = await supabase
              .from("orgs")
              .insert({ name: "My Organization", owner_id: session.user.id })
              .select("id")
              .maybeSingle();
            const orgData = orgRes.data as { id?: string } | null;
            const orgId = orgData?.id;
            await supabase.from("user_profiles").insert({
              userId: session.user.id,
              org_id: orgId,
              name: session.user.email?.split("@")[0] || null,
            });
          } catch (err: unknown) {
            console.error(
              "Failed to create org/profile on callback:",
              err instanceof Error ? err.message : String(err)
            );
          }
          nav("/onboarding");
        } else if (!profile.org_id) {
          nav("/onboarding");
        } else {
          nav("/dashboard");
        }
      } else {
        nav("/auth");
      }
    })();
  }, [nav]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Signing you in…</p>
      </div>
    </div>
  );
}
