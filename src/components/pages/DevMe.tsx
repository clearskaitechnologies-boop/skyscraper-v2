import React, { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

export default function DevMe() {
  const [data, setData] = useState<any>({ loading: true });

  useEffect(() => {
    (async () => {
      try {
        const sessionRes = await supabase.auth.getSession();
        const session = sessionRes.data.session;

        const user = session?.user;

        let profiles: any = null;
        let clients: any = null;

        if (user) {
          const { data: p } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();
          profiles = p;

          const { data: c } = await supabase
            .from("clients")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();
          clients = c;
        }

        setData({ loading: false, session, user, profiles, clients });
      } catch (err) {
        setData({ loading: false, error: String(err) });
      }
    })();
  }, []);

  if (data.loading) return <div className="p-6">Loading debug info…</div>;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h2 className="mb-4 text-xl font-semibold">Debug: current session / profiles / clients</h2>
      {data.error && <pre className="text-red-500">{data.error}</pre>}
      <section className="mb-4">
        <h3 className="font-medium">Session</h3>
        <pre className="bg-surface rounded p-3">{JSON.stringify(data.session, null, 2)}</pre>
      </section>

      <section className="mb-4">
        <h3 className="font-medium">User</h3>
        <pre className="bg-surface rounded p-3">{JSON.stringify(data.user, null, 2)}</pre>
      </section>

      <section className="mb-4">
        <h3 className="font-medium">User Profile (user_profiles)</h3>
        <pre className="bg-surface rounded p-3">{JSON.stringify(data.profiles, null, 2)}</pre>
      </section>

      <section className="mb-4">
        <h3 className="font-medium">Clients</h3>
        <pre className="bg-surface rounded p-3">{JSON.stringify(data.clients, null, 2)}</pre>
      </section>

      <p className="text-sm text-muted-foreground">
        Tip: In dev mode you can append <code>?dev=1</code> to the URL to bypass the protected route
        for local testing.
      </p>
    </div>
  );
}
