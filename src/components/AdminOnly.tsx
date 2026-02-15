import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";

/**
 * AdminOnly Component - Client-Side Authorization Guard
 *
 * SECURITY NOTE: This component provides UI-level access control ONLY.
 * It should NOT be relied upon as the primary security boundary.
 *
 * Real Security Enforcement:
 * - RLS policies on all database tables verify admin/owner roles server-side
 * - Edge functions check roles using has_role() security definer function
 * - This component merely hides UI elements - data remains protected by RLS
 *
 * A malicious user could bypass this check by:
 * - Modifying browser DevTools
 * - Intercepting network responses
 * - Direct URL navigation
 *
 * However, they would still be blocked by RLS policies when attempting
 * any data operations. This is defense-in-depth working correctly.
 */
export default function AdminOnly({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  async function checkAdminStatus() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setReady(true);
        setIsAdmin(false);
        return;
      }

      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } else {
        // Check for admin or owner role
        const hasAdminAccess = roles?.some((r) => r.role === "admin" || r.role === "owner");
        setIsAdmin(!!hasAdminAccess);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    } finally {
      setReady(true);
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
          <button
            onClick={() => navigate("/")}
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
