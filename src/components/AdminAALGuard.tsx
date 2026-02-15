import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

import MFAScreen from "./MFAScreen";

interface AdminAALGuardProps {
  children: React.ReactNode;
}

export default function AdminAALGuard({ children }: AdminAALGuardProps) {
  const [ready, setReady] = useState(false);
  const [needsMFA, setNeedsMFA] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (data?.nextLevel === "aal2" && data?.currentLevel !== "aal2") {
        setNeedsMFA(true);
      }

      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Checking security...</p>
        </div>
      </div>
    );
  }

  if (needsMFA) {
    return <MFAScreen onDone={() => setNeedsMFA(false)} />;
  }

  return <>{children}</>;
}
