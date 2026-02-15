import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const emailSchema = z.object({
  to: z.string().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  subject: z
    .string()
    .trim()
    .min(1, "Subject is required")
    .max(200, "Subject must be less than 200 characters"),
});

export type EmailPDFPanelProps = {
  getPdfBlob: () => Promise<Blob>;
  defaultSubject?: string;
  owner?: string | null;
};

export default function EmailPDFPanel({
  getPdfBlob,
  defaultSubject = "Inspection Report",
  owner,
}: EmailPDFPanelProps) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [busy, setBusy] = useState(false);

  async function send() {
    // Validate inputs
    const validation = emailSchema.safeParse({ to, subject });

    if (!validation.success) {
      const errors = validation.error.errors.map((e) => e.message).join(", ");
      toast.error(errors);
      return;
    }

    setBusy(true);
    try {
      const blob = await getPdfBlob();
      const fileUrl = await uploadAndGetUrl(blob);

      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          to: validation.data.to,
          subject: validation.data.subject,
          html: `<p>Please find your inspection report attached.</p>`,
          pdfUrl: fileUrl,
        },
      });

      if (error) throw error;

      if (data?.ok) {
        toast.success("Email sent successfully");
        setTo("");
      } else {
        toast.error(data?.error || "Email failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send email");
    } finally {
      setBusy(false);
    }
  }

  async function uploadAndGetUrl(blob: Blob): Promise<string> {
    const safeSubject = subject.replace(/[^a-z0-9\-_. ]/gi, "_");
    const fileName = `${owner || "public"}/${Date.now()}-${safeSubject}.pdf`;

    const { error: uploadError } = await supabase.storage.from("reports").upload(fileName, blob, {
      contentType: "application/pdf",
      upsert: false,
    });

    if (uploadError) throw uploadError;

    // Use signed URL with 1 hour expiration for security
    const { data, error: signedError } = await supabase.storage
      .from("reports")
      .createSignedUrl(fileName, 3600, {
        download: safeSubject + ".pdf",
      });

    if (signedError || !data?.signedUrl) {
      throw new Error(signedError?.message || "Could not create signed URL");
    }

    return data.signedUrl;
  }

  return (
    <div className="space-y-2 rounded-2xl border p-3">
      <div className="font-medium">Email PDF</div>
      <Input
        type="email"
        placeholder="Recipient email"
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />
      <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
      <Button onClick={send} disabled={busy || !to}>
        {busy ? "Sending..." : "Send Email"}
      </Button>
    </div>
  );
}
