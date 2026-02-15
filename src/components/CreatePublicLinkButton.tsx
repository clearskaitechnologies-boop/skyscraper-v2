import { Copy,Link2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface CreatePublicLinkButtonProps {
  reportId: string;
}

export default function CreatePublicLinkButton({ reportId }: CreatePublicLinkButtonProps) {
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string>("");
  const [hours, setHours] = useState<string>("168"); // 7 days default
  const [scope, setScope] = useState<"view" | "download">("download");

  async function generateLink() {
    setBusy(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const fnUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL!.replace("/rest/v1", "")}/functions/v1/create-public-token`;
      const response = await fetch(fnUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          reportId,
          hours: Number(hours),
          scope,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate link");
      }

      const result = await response.json();
      setGeneratedUrl(result.url);
      toast.success("Public link generated");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate link");
    } finally {
      setBusy(false);
    }
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  }

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen);
    if (!newOpen) {
      setGeneratedUrl("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Link2 className="mr-2 h-4 w-4" />
          Create Public Link
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Public Link</DialogTitle>
          <DialogDescription>
            Generate a secure, time-limited link to share this report with clients.
          </DialogDescription>
        </DialogHeader>

        {!generatedUrl ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Link Duration</Label>
              <Select value={hours} onValueChange={setHours}>
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="72">3 days</SelectItem>
                  <SelectItem value="168">7 days (default)</SelectItem>
                  <SelectItem value="336">14 days</SelectItem>
                  <SelectItem value="720">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scope">Access Level</Label>
              <Select value={scope} onValueChange={(v) => setScope(v as "view" | "download")}>
                <SelectTrigger id="scope">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View only</SelectItem>
                  <SelectItem value="download">Download PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={generateLink} disabled={busy} className="w-full">
              {busy ? "Generating..." : "Generate Link"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Public Link</Label>
              <div className="flex gap-2">
                <Input value={generatedUrl} readOnly className="flex-1" />
                <Button onClick={copyToClipboard} size="icon" variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This link will expire in {hours} hours and allows {scope} access.
              </p>
            </div>

            <Button
              onClick={() => {
                setGeneratedUrl("");
              }}
              variant="outline"
              className="w-full"
            >
              Generate Another Link
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
