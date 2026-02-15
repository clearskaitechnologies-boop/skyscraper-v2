import { useSession } from "@supabase/auth-helpers-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";

export default function NewLead() {
  const { user } = useSession()!;
  const nav = useNavigate();
  const [lead, setLead] = useState({
    client_name: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    roof_system: "",
    squares: "",
    date_of_loss: "",
  });

  const up = (k: string, v: any) => setLead((s) => ({ ...s, [k]: v }));

  async function save() {
    const payload: any = {
      userId: user!.id,
      client_name: lead.client_name,
      property_address: lead.address,
      // Map squares to roof_size_sqft if provided
      roof_size_sqft: lead.squares ? Number(lead.squares) : null,
      roof_material: lead.roof_system || null,
      // keep city/state/postal in separate columns if needed by other tables
    };

    const { data, error } = await supabase.from("leads").insert(payload).select("id").single();
    if (error) return alert(error.message);
    nav(`/crm/proposals/build/${data.id}`);
  }

  return (
    <div className="space-y-3 p-6">
      <h1 className="text-xl font-bold">New Lead</h1>
      <input
        className="input"
        placeholder="Client Name"
        onChange={(e) => up("client_name", e.target.value)}
      />
      <input
        className="input"
        placeholder="Address"
        onChange={(e) => up("address", e.target.value)}
      />
      <div className="grid grid-cols-3 gap-2">
        <input className="input" placeholder="City" onChange={(e) => up("city", e.target.value)} />
        <input
          className="input"
          placeholder="State"
          onChange={(e) => up("state", e.target.value)}
        />
        <input
          className="input"
          placeholder="Postal"
          onChange={(e) => up("postal_code", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <input
          className="input"
          placeholder="Roof System"
          onChange={(e) => up("roof_system", e.target.value)}
        />
        <input
          className="input"
          placeholder="Squares"
          onChange={(e) => up("squares", e.target.value)}
        />
        <input
          className="input"
          type="date"
          placeholder="DOL"
          onChange={(e) => up("date_of_loss", e.target.value)}
        />
      </div>
      <button className="rounded bg-blue-600 px-4 py-2 text-white" onClick={save}>
        Save & Build Proposal
      </button>
    </div>
  );
}
