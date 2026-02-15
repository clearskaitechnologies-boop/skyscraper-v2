import { Mail, MapPin,Phone } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1, "Message is required").max(1000),
});

export default function Contact() {
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
        subject: (fd.get("subject") as string) || null,
        message: fd.get("message") as string,
      };

      contactSchema.parse(payload);

      // Store in demo_requests table (reusing for general contact)
      const { error } = await supabase.from("demo_requests").insert({
        name: payload.name,
        email: payload.email,
        message: `[${payload.subject || "Contact"}] ${payload.message}`,
      });

      if (error) throw error;

      toast({
        title: "Message sent",
        description: "Thanks for reaching out! We'll respond within 24 hours.",
      });

      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast({
        title: "Failed to send",
        description: error.message || "Please check your inputs and try again.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="pt-20">
        <section className="bg-gradient-subtle py-16">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="mb-12 text-center">
              <h1 className="mb-4 text-4xl font-bold md:text-5xl">Get in Touch</h1>
              <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                Have questions? We're here to help. Reach out and we'll respond within 24 hours.
              </p>
            </div>

            <div className="mb-12 grid gap-6 md:grid-cols-3">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="mb-3 inline-flex rounded-xl bg-primary/10 p-3">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-1 font-semibold">Email</h3>
                  <p className="text-sm text-muted-foreground">hello@clearskai.ai</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="mb-3 inline-flex rounded-xl bg-primary/10 p-3">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-1 font-semibold">Phone</h3>
                  <p className="text-sm text-muted-foreground">(928) 555-0123</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="mb-3 inline-flex rounded-xl bg-primary/10 p-3">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-1 font-semibold">Location</h3>
                  <p className="text-sm text-muted-foreground">Arizona, USA</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mx-auto max-w-2xl">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Name *</label>
                      <Input name="name" required placeholder="Your name" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Email *</label>
                      <Input name="email" type="email" required placeholder="your@email.com" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Subject</label>
                    <Input name="subject" placeholder="What's this about?" />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Message *</label>
                    <Textarea
                      name="message"
                      required
                      placeholder="Tell us how we can help..."
                      className="min-h-[160px]"
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={busy}>
                    {busy ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
