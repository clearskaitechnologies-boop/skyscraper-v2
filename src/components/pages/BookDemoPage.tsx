import { useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const demoSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  company: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(20).optional(),
  message: z.string().trim().max(1000).optional(),
});

export default function BookDemoPage() {
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);

    try {
      const fd = new FormData(e.target as HTMLFormElement);
      const payload = {
        name: fd.get("name") as string,
        email: fd.get("email") as string,
        company: (fd.get("company") as string) || null,
        phone: (fd.get("phone") as string) || null,
        message: (fd.get("message") as string) || null,
        utm: { source: new URLSearchParams(location.search).get("utm_source") },
      };

      const validated = demoSchema.parse(payload);

      const { error } = await supabase.from("demo_requests").insert({
        name: validated.name,
        email: validated.email,
        company: validated.company || null,
        phone: validated.phone || null,
        message: validated.message || null,
        utm: payload.utm,
      });

      if (error) throw error;

      toast({
        title: "Request submitted",
        description: "Thanks! We'll be in touch shortly.",
      });
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message || "Please check your inputs and try again.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      {/* Hero */}
      <section className="bg-muted/30">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-6 py-16 md:grid-cols-2">
          <div>
            <h1 className="text-3xl font-semibold md:text-4xl">Book a Live Demo</h1>
            <p className="mt-3 text-muted-foreground">
              See how ClearSKai automates roof proposals, insurance packets, and client
              approvals—start to finish.
            </p>
            <ul className="mt-4 list-inside list-disc space-y-1 text-sm">
              <li>AI summaries & mockups</li>
              <li>One-click PDF exports with branding</li>
              <li>Client e-sign & pricing approvals</li>
            </ul>
          </div>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm"
          >
            <div>
              <label className="text-xs font-medium">Full Name *</label>
              <Input name="name" required placeholder="Jane Contractor" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium">Work Email *</label>
              <Input
                name="email"
                type="email"
                required
                placeholder="jane@company.com"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium">Company</label>
              <Input name="company" placeholder="Acme Roofing" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium">Phone</label>
              <Input name="phone" placeholder="(555) 555-5555" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium">Message</label>
              <Textarea
                name="message"
                placeholder="Tell us about your workflow"
                className="mt-1 min-h-[96px]"
              />
            </div>
            <Button className="w-full" disabled={busy}>
              {busy ? "Submitting…" : "Request Demo"}
            </Button>
          </form>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-12 md:grid-cols-3">
        {[
          { t: "Faster Close", d: "Generate polished proposals in minutes, not hours." },
          { t: "Insurance-Ready", d: "Code callouts & hail reports built-in." },
          { t: "Client Experience", d: "E-sign, approvals, and a clean portal." },
        ].map((b, i) => (
          <div key={i} className="rounded-2xl border p-4">
            <div className="text-lg font-medium">{b.t}</div>
            <div className="mt-1 text-sm text-muted-foreground">{b.d}</div>
          </div>
        ))}
      </section>
    </main>
  );
}
