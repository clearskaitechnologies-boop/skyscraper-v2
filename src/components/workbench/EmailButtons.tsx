/**
 * Email buttons for sending reports
 */
import { Mail } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EmailButtonsProps {
  defaultTo?: string;
  defaultSubject?: string;
  defaultBodyMd?: string;
  attachmentUrl?: string;
}

export default function EmailButtons({
  defaultTo,
  defaultSubject,
  defaultBodyMd,
  attachmentUrl,
}: EmailButtonsProps) {
  const [to, setTo] = useState(defaultTo || "");
  const [subject, setSubject] = useState(defaultSubject || "ClearSKai Report");
  const [body, setBody] = useState(defaultBodyMd || "Please find the report attached/linked.");

  async function send() {
    try {
      const resp = await fetch("/.netlify/functions/send-report-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, bodyMd: body, attachmentUrl }),
      });

      const data = await resp.json();

      if (data.via === "mailto") {
        window.location.href = data.url;
      } else {
        alert("Email queued successfully");
      }
    } catch (error: any) {
      alert("Failed to send email: " + error.message);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Mail className="h-4 w-4" />
        <span className="font-medium">Send as Email</span>
      </div>
      <div className="grid gap-3">
        <Input placeholder="to@example.com" value={to} onChange={(e) => setTo(e.target.value)} />
        <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <Textarea
          placeholder="Message (Markdown OK)"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
        />
        <Button onClick={send} disabled={!to}>
          <Mail className="mr-2 h-4 w-4" />
          Send Email
        </Button>
      </div>
    </div>
  );
}
