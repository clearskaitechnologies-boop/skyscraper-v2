/**
 * DashboardGuard - Redirects users without org to onboarding
 */
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";

export default function DashboardGuard({ children }: { children: React.ReactNode }) {
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        nav("/auth");
        return;
      }

      const { data: prof } = await supabase
        .from("user_profiles")
        .select("org_id")
        .eq("user_id", user.id)
        .single();

      if (!prof?.org_id) {
        nav("/onboarding");
      }
    })();
  }, [nav]);

  return <>{children}</>;
}
