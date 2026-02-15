import { CheckCircle2, Copy, Link as LinkIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface PublicLinkGeneratorProps {
  reportId: string;
}

export default function PublicLinkGenerator({ reportId }: PublicLinkGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState<string>("");
  const [copied, setCopied] = useState(false);

  async function generateLink() {
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-public-link", {
        body: { reportId },
      });

      if (error) throw error;

      if (data?.link) {
        setLink(data.link);
        toast.success("Public signing link generated!");
      } else {
        throw new Error("No link returned");
      }
    } catch (e: any) {
      console.error("Link generation error:", e);
      toast.error(e.message || "Failed to generate link");
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      toast.error("Failed to copy link");
    }
  }

  return (
    <Card className="space-y-4 p-6">
      <div>
        <h3 className="mb-2 text-lg font-semibold">Public Signing Link</h3>
        <p className="text-sm text-muted-foreground">
          Generate a secure link that allows clients to sign this document without logging in. Links
          expire after 7 days.
        </p>
      </div>

      {!link ? (
        <Button onClick={generateLink} disabled={loading} className="gap-2">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <LinkIcon className="h-4 w-4" />
              Generate Signing Link
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-3">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Your public signing link has been generated successfully!
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="public-link">Public Link</Label>
            <div className="mt-1 flex gap-2">
              <Input id="public-link" value={link} readOnly className="font-mono text-sm" />
              <Button onClick={copyToClipboard} variant="outline" size="icon" className="shrink-0">
                {copied ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Share this link with your client to collect their signature
            </p>
          </div>

          <Button onClick={() => setLink("")} variant="outline" size="sm">
            Generate New Link
          </Button>
        </div>
      )}
    </Card>
  );
}
