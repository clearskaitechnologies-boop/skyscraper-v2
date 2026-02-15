"use client";

import { FileCheck, FileX, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SignatureResponseFormProps {
  requestId: string;
  claimId: string;
  slug: string;
  signerName: string;
  signerEmail: string;
}

export function SignatureResponseForm({
  requestId,
  claimId,
  slug,
  signerName,
  signerEmail,
}: SignatureResponseFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleResponse = async (action: "signed" | "declined") => {
    if (action === "signed" && !agreedToTerms) {
      alert("Please agree to the terms before signing.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/signatures/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit response");
      }

      // Redirect back to documents page
      router.push(`/portal/${slug}/claims/${claimId}/documents?signed=${action}`);
      router.refresh();
    } catch (error) {
      console.error("Error submitting signature response:", error);
      alert("Failed to submit your response. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card px-6 py-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">Your Response</h2>

      {/* Signer Info */}
      <div className="mt-4 space-y-2 text-sm">
        <div>
          <span className="font-medium text-muted-foreground">Signer Name:</span>
          <p className="text-foreground">{signerName}</p>
        </div>
        <div>
          <span className="font-medium text-muted-foreground">Signer Email:</span>
          <p className="text-foreground">{signerEmail}</p>
        </div>
      </div>

      {/* Terms Checkbox */}
      <div className="mt-6 flex items-start gap-3">
        <input
          type="checkbox"
          id="agree-terms"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
        <label htmlFor="agree-terms" className="text-sm text-foreground">
          I have read and reviewed the document above. I agree that my electronic signature is
          legally binding and has the same effect as a handwritten signature.
        </label>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => handleResponse("signed")}
          disabled={isSubmitting || !agreedToTerms}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileCheck className="h-4 w-4" />
          )}
          Sign Document
        </button>

        <button
          onClick={() => handleResponse("declined")}
          disabled={isSubmitting}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileX className="h-4 w-4" />
          )}
          Decline
        </button>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        By clicking "Sign Document", you are applying your legally binding electronic signature to
        this document. This action cannot be undone.
      </p>
    </div>
  );
}
