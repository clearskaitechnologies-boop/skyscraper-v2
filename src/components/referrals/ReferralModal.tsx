"use client";

import { Check,Copy, Mail, Share2, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function ReferralModal() {
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState<string>("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (open && !link) {
      fetchReferralLink();
    }
  }, [open]);

  async function fetchReferralLink() {
    try {
      const response = await fetch("/api/referral/link");
      const data = await response.json();
      if (data.url) {
        setLink(data.url);
      }
    } catch (error) {
      console.error("Failed to fetch referral link:", error);
    }
  }

  async function sendInvite() {
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setSent(false);

    try {
      const response = await fetch("/api/referral/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.ok) {
        setSent(true);
        setEmail("");
        setTimeout(() => setSent(false), 3000);
      } else {
        alert(data.error || "Failed to send invite");
      }
    } catch (error) {
      alert("Failed to send invite. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
      >
        <Share2 className="h-4 w-4" />
        Refer a Contractor
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Modal */}
      <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center p-4">
        <div
          className="pointer-events-auto w-full max-w-lg rounded-2xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <Share2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Refer a Contractor</h2>
                <p className="text-sm text-slate-500">Earn rewards when they subscribe</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 transition-colors hover:bg-slate-100"
              aria-label="Close modal"
              title="Close"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6 p-6">
            {/* Reward Info */}
            <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-4">
              <h3 className="mb-2 font-semibold text-slate-900">🎉 Referral Rewards</h3>
              <ul className="space-y-1 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">•</span>
                  <span>
                    <strong>First successful referral:</strong> Get +30 days added to your
                    subscription
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-600">•</span>
                  <span>
                    <strong>Additional referrals:</strong> Earn 500 bonus tokens per paid
                    subscription
                  </span>
                </li>
              </ul>
            </div>

            {/* Share Link */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Your referral link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={link}
                  readOnly
                  className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 font-mono text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Loading..."
                />
                <button
                  onClick={copyLink}
                  disabled={!link}
                  className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-100 px-4 py-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500">Share this link with contractors you know</p>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500">or</span>
              </div>
            </div>

            {/* Send Email Invite */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Send an email invite
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="contractor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendInvite();
                    }}
                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={sendInvite}
                  disabled={loading || !email}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2.5 font-medium text-white shadow-md transition-all duration-200 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Sending...
                    </>
                  ) : sent ? (
                    <>
                      <Check className="h-4 w-4" />
                      Sent!
                    </>
                  ) : (
                    "Send Invite"
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500">
                We'll send them a personalized invitation email
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end rounded-b-2xl border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
