import { CheckCircle2, FileText,Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

import SignaturePad from "./SignaturePad";

interface NextStepsSignProps {
  reportId: string;
  defaultName?: string;
  defaultEmail?: string;
  onComplete?: (result: any) => void;
}

export default function NextStepsSign({
  reportId,
  defaultName,
  defaultEmail,
  onComplete,
}: NextStepsSignProps) {
  const [name, setName] = useState(defaultName || "");
  const [email, setEmail] = useState(defaultEmail || "");
  const [agree, setAgree] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string>("");

  async function handleSubmit() {
    if (!agree) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!signatureDataUrl) {
      toast.error("Please provide your signature");
      return;
    }

    setBusy(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-signature", {
        body: {
          reportId,
          signerName: name,
          signerEmail: email || null,
          signatureDataUrl,
        },
      });

      if (error) throw error;

      if (data?.receiptUrl) {
        setReceiptUrl(data.receiptUrl);
        toast.success("Document signed successfully!");
        onComplete?.(data);
      } else {
        throw new Error("No receipt URL returned");
      }
    } catch (e: any) {
      console.error("Signature submission error:", e);
      toast.error(e.message || "Failed to submit signature");
    } finally {
      setBusy(false);
    }
  }

  if (receiptUrl) {
    return (
      <Card className="p-6">
        <div className="space-y-4 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />
          <div>
            <h3 className="mb-2 text-xl font-semibold">Document Signed Successfully!</h3>
            <p className="mb-4 text-muted-foreground">
              Thank you for signing. {email && "A receipt has been sent to your email."}
            </p>
          </div>
          <Button asChild variant="default" className="gap-2">
            <a href={receiptUrl} target="_blank" rel="noreferrer">
              <FileText className="h-4 w-4" />
              Download Signed Document
            </a>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4 p-6">
        <div>
          <h3 className="mb-4 text-lg font-semibold">Signer Information</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="signer-name">Full Name *</Label>
              <Input
                id="signer-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <Label htmlFor="signer-email">Email (optional)</Label>
              <Input
                id="signer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Receive a copy of the signed document
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold">Digital Signature</h3>
          <SignaturePad onChange={setSignatureDataUrl} />
        </div>

        <div className="flex items-start space-x-3 border-t pt-4">
          <Checkbox
            id="terms"
            checked={agree}
            onCheckedChange={(checked) => setAgree(checked as boolean)}
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="terms"
              className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the terms and conditions
            </Label>
            <p className="text-sm text-muted-foreground">
              By signing, you acknowledge that you have read and agree to the terms outlined in this
              report.
            </p>
          </div>
        </div>
      </Card>

      <Alert>
        <AlertDescription className="text-sm">
          Your signature will be securely stored and attached to the final report. This creates a
          legally binding agreement.
        </AlertDescription>
      </Alert>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={busy || !name || !signatureDataUrl || !agree}
          size="lg"
          className="gap-2"
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Sign & Accept Document
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
