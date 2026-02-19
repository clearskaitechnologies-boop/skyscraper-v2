"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { SignaturePad } from "@/components/SignaturePad";
import { logger } from "@/lib/logger";

export default function SignDocumentPage({ params }: { params: { documentId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams?.get("role") || "CLIENT";

  const [signature, setSignature] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSign = async () => {
    if (!signature || !name || !email) {
      alert("Please complete all fields and add your signature");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/signatures/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: params.documentId,
          signerName: name,
          signerEmail: email,
          role,
          signature,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save signature");
      }

      alert("Document signed successfully");
      router.push("/documents");
    } catch (error) {
      logger.error("Signing failed:", error);
      alert("Failed to sign document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="card">
        <h1 className="mb-2 text-2xl font-semibold">Sign Document</h1>
        <p className="mb-6 text-slate-500">
          Signing as: <span className="font-medium">{role}</span>
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Full Name</label>
            <input
              type="text"
              className="inputBase w-full"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>
            <input
              type="email"
              className="inputBase w-full"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Signature</label>
            <SignaturePad onChange={(val) => setSignature(val ?? "")} />
            {signature && <p className="mt-2 text-sm text-green-600">✓ Signature captured</p>}
          </div>

          <button onClick={handleSign} disabled={loading} className="btnPrimary w-full">
            {loading ? "Signing..." : "Sign Document"}
          </button>
        </div>
      </div>
    </div>
  );
}
