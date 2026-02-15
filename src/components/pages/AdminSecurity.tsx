import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export default function AdminSecurity() {
  const [qrCode, setQrCode] = useState<string>("");
  const [uri, setUri] = useState<string>("");
  const [factorId, setFactorId] = useState<string>("");
  const [code, setCode] = useState("");
  type TotpFactor = { id: string; friendly_name?: string; status?: string };
  type MFAFactors = { totp?: TotpFactor[]; phone?: unknown[] };
  const [factors, setFactors] = useState<MFAFactors>({ totp: [], phone: [] });
  const [busy, setBusy] = useState(false);

  async function refreshFactors() {
    const result = await supabase.auth.mfa.listFactors();
    if (!result.error && result.data) {
      setFactors(result.data);
    }
  }

  useEffect(() => {
    refreshFactors();
  }, []);

  async function enrollTOTP() {
    setBusy(true);
    setQrCode("");
    setUri("");
    setFactorId("");

    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Admin TOTP",
      });

      if (error) throw error;

      setFactorId(data.id);
      setQrCode((data as any).totp?.qr_code || "");
      setUri((data as any).totp?.uri || "");
      toast.success("Scan the QR code with your authenticator app");
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      toast.error(err.message || "Failed to enroll TOTP");
    } finally {
      setBusy(false);
    }
  }

  async function verifyTOTP() {
    setBusy(true);

    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;

      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code,
      });

      if (error) throw error;

      toast.success("2FA enabled successfully");
      setQrCode("");
      setUri("");
      setFactorId("");
      setCode("");
      await refreshFactors();
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      toast.error(err.message || "Verification failed");
    } finally {
      setBusy(false);
    }
  }

  async function unenrollFactor(id: string) {
    if (!confirm("Remove this factor? You must be MFA-verified (aal2).")) return;

    const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Factor removed");
    await refreshFactors();
  }

  return (
    <main className="container mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-3xl font-bold">Security Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Enable 2FA with an authenticator app (1Password, Authy, Google Authenticator, or Apple
            Keychain).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!factorId ? (
            <Button onClick={enrollTOTP} disabled={busy}>
              {busy ? "Setting up..." : "Enable 2FA"}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Step 1: Scan this QR code</Label>
                {qrCode && (
                  <div className="rounded-lg border bg-background p-4">
                    <img src={qrCode} alt="QR Code" className="mx-auto" />
                  </div>
                )}
                {uri && <p className="break-all text-xs text-muted-foreground">{uri}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Step 2: Enter the 6-digit code</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    maxLength={6}
                    className="w-40"
                  />
                  <Button onClick={verifyTOTP} disabled={busy || code.length < 6}>
                    Verify
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Enrolled Factors</CardTitle>
          <CardDescription>
            Tip: Enroll a second TOTP on another device as a backup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {factors.totp?.map((factor: TotpFactor) => (
              <div
                key={factor.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <div className="font-medium">{factor.friendly_name || "TOTP"}</div>
                  <div className="text-sm text-muted-foreground">Status: {factor.status}</div>
                </div>
                <Button variant="outline" size="sm" onClick={() => unenrollFactor(factor.id)}>
                  Remove
                </Button>
              </div>
            ))}
            {(!factors.totp || factors.totp.length === 0) && (
              <p className="py-4 text-sm text-muted-foreground">No TOTP factors enrolled yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
