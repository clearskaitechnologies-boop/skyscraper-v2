import React, { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  leadId?: string | null;
  defaultCarrier?: string;
  pdfUrl?: string; // optional pre-generated pdf URL
};

export default function CarrierSubmissionPanel({ leadId, defaultCarrier = "", pdfUrl }: Props) {
  const [email, setEmail] = useState(defaultCarrier);
  const [subject, setSubject] = useState("Inspection Report");
  const [body, setBody] = useState("Please find the attached inspection report.");
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!email) return toast.error("Enter carrier email");
    setBusy(true);
    try {
      let finalPdf = pdfUrl;

      if (!finalPdf) {
        // generate PDF using existing edge function
        const { data, error } = await supabase.functions.invoke("generate-pdf", {
          body: { report_id: crypto.randomUUID(), lead_id: leadId },
        });
        if (error) throw error;
        finalPdf = data?.pdf_url || data?.pdfUrl || "";
      }

      const resp = await fetch("/api/carrier-submissions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${await getAccessToken()}`,
        },
        body: JSON.stringify({
          leadId,
          carrierEmail: email,
          subject,
          body,
          attachments: finalPdf ? [finalPdf] : [],
        }),
      });

      const json = await resp.json();
      if (!resp.ok) throw new Error(json?.error || JSON.stringify(json));

      toast.success("Carrier submission queued");
    } catch (e: any) {
      toast.error(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  async function getAccessToken() {
    try {
      const s = await supabase.auth.getSession();
      return s?.data?.session?.access_token || "";
    } catch {
      return "";
    }
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="font-medium">Send to Carrier</div>
      <Input placeholder="Carrier email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
      <textarea
        className="input h-24"
        placeholder="Message body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <div className="flex gap-2">
        <Button onClick={send} disabled={busy}>
          {busy ? "Sending…" : "Send to Carrier"}
        </Button>
      </div>
    </div>
  );
}
