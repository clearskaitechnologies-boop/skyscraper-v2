import { useSession } from "@supabase/auth-helpers-react";
import React from "react";
import { Link } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";

export default function BrandingGate({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const user = session?.user;
  const [state, setState] = React.useState<"loading" | "ok" | "incomplete">("loading");

  React.useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: prof } = await supabase
        .from("user_profiles")
        .select("org_id")
        .eq("user_id", user.id)
        .maybeSingle();
      const orgId = prof?.org_id;
      if (!orgId) return setState("incomplete");
      const { data } = await supabase
        .from("org_branding")
        .select("*")
        .eq("org_id", orgId)
        .maybeSingle();
      if (!data) return setState("incomplete");
      const d: any = data;
      const complete = !!(
        d.company_name &&
        d.phone &&
        d.email &&
        (d.roc_number || d.roc) &&
        d.city &&
        d.state &&
        d.logo_url
      );
      setState(complete ? "ok" : "incomplete");
    })();
  }, [user]);

  if (state === "loading") return null;
  if (state === "incomplete") {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="space-y-3 text-center">
          <h2 className="text-xl font-bold">Finish Your Branding</h2>
          <p className="text-slate-600">
            Company name, AZROC, phone, email, city & state, and a logo are required.
          </p>
          <Link
            to="/crm/branding"
            className="inline-block rounded bg-blue-600 px-4 py-2 text-white"
          >
            Complete Branding
          </Link>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
