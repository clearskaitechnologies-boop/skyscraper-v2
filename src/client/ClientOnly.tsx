import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

/**
 * ClientOnly Component - Client-Side Authorization Guard
 *
 * SECURITY NOTE: This component provides UI-level access control ONLY.
 * It should NOT be relied upon as the primary security boundary.
 *
 * Real Security Enforcement:
 * - RLS policies on clients and v_client_reports tables verify access server-side
 * - Edge functions validate client identity before serving data
 * - This component merely hides UI elements - data remains protected by RLS
 *
 * A malicious user could bypass this check, but would still be blocked
 * by RLS policies when attempting data operations. This is correct defense-in-depth.
 */
type ClientRow = {
  id?: string;
  subscription_active?: boolean | null;
  has_subscription?: boolean | null;
  subscription_status?: string | null;
  stripe_customer_id?: string | null;
  [k: string]: unknown;
};

export default function ClientOnly({
  children,
  requireSubscription = false,
}: {
  children: React.ReactNode;
  requireSubscription?: boolean;
}) {
  const [ready, setReady] = useState(false);
  const [ok, setOk] = useState(false);
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setOk(false);
        setReason("not-signed-in");
        setReady(true);
        return;
      }

      const { data: client } = await supabase
        .from("clients")
        .select(
          "id, subscription_active, has_subscription, subscription_status, stripe_customer_id"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (!client) {
        setOk(false);
        setReason("no-client");
        setReady(true);
        return;
      }

      // Determine subscription truthiness using multiple possible fields
      const c = client as unknown as ClientRow;
      const hasSubscription = Boolean(
        c.subscription_active ||
          c.has_subscription ||
          (typeof c.stripe_customer_id === "string" && c.stripe_customer_id.length > 0) ||
          c.subscription_status === "active"
      );

      if (requireSubscription && !hasSubscription) {
        setOk(false);
        setReason("no-subscription");
        setReady(true);
        return;
      }

      setOk(true);
      setReady(true);
    })();
  }, [requireSubscription]);

  if (!ready) return <div className="p-6">Loading…</div>;

  if (!ok) {
    if (reason === "not-signed-in")
      return (
        <div className="p-6">
          Client access only.{" "}
          <a className="underline" href="/client/sign-in">
            Sign in
          </a>
        </div>
      );
    if (reason === "no-client")
      return (
        <div className="p-6">
          No client account found.{" "}
          <a className="underline" href="/client/sign-in">
            Sign in
          </a>
        </div>
      );
    if (reason === "no-subscription")
      return (
        <div className="p-6">
          You need an active subscription to access this page.{" "}
          <a className="underline" href="/book-demo">
            Contact sales
          </a>
        </div>
      );

    return <div className="p-6">Access restricted</div>;
  }

  return <>{children}</>;
}
