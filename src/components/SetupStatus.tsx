"use client";
import { useEffect, useState } from "react";

import { functionsHealthy } from "@/lib/functionsClient";

export default function SetupStatus() {
  const [ok, setOk] = useState<null | boolean>(null);

  useEffect(() => {
    let mounted = true;
    functionsHealthy().then((v) => mounted && setOk(v));
    return () => {
      mounted = false;
    };
  }, []);

  const Item = ({ label, ready }: { label: string; ready: boolean }) => (
    <div className="flex items-center gap-2">
      <span
        className={`inline-block h-2.5 w-2.5 rounded-full ${
          ready ? "bg-emerald-500" : "bg-amber-400"
        }`}
      />
      <span className={ready ? "text-gray-700" : "text-gray-700"}>
        {label} — {ready ? "Connected" : "Checking..."}
      </span>
    </div>
  );

  return (
    <div className="rounded-xl border bg-blue-50/60 p-4 text-sm">
      <div className="mb-2 font-medium">Setup Status</div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Item label="Firebase Storage" ready={true} />
        <Item label="Firestore Database" ready={true} />
        <Item label="Cloud Functions" ready={ok === true} />
        <Item label="PDF Generation" ready={ok === true} />
      </div>
      {ok === false && (
        <div className="mt-3 text-rose-600">
          Functions ping failed. If you just deployed, try a hard refresh (⌘⇧R) or check function
          logs.
        </div>
      )}
    </div>
  );
}
