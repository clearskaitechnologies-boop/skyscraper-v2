"use client";

import { CreditCard, X, Zap } from "lucide-react";
import { useState } from "react";

import { createTokenCheckout } from "@/app/actions/addTokens";

type AddTokensModalProps = {
  orgId: string;
  isOpen: boolean;
  onCloseAction: () => void;
  currentBalance?: number;
};

export default function AddTokensModal({
  orgId,
  isOpen,
  onCloseAction,
  currentBalance = 0,
}: AddTokensModalProps) {
  const [pack, setPack] = useState("25");
  const [loading, setLoading] = useState(false);

  const packs = [
    {
      label: "$10 Token Pack",
      value: "10",
      tokens: "1,000",
      rawTokens: 1000,
      bonus: null,
      popular: false,
    },
    {
      label: "$25 Token Pack",
      value: "25",
      tokens: "2,600",
      rawTokens: 2600,
      bonus: "+100 bonus",
      popular: true,
    },
    {
      label: "$50 Token Pack",
      value: "50",
      tokens: "5,400",
      rawTokens: 5400,
      bonus: "+400 bonus",
      popular: false,
    },
    {
      label: "$100 Token Pack",
      value: "100",
      tokens: "11,200",
      rawTokens: 11200,
      bonus: "+1,200 bonus",
      popular: false,
    },
  ];

  async function handleBuy() {
    setLoading(true);
    try {
      const { url } = await createTokenCheckout(orgId, pack);
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const selectedPack = packs.find((p) => p.value === pack);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="p-6">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-slate-900">Add Tokens</h2>
            </div>
            <button
              onClick={onCloseAction}
              className="p-1 text-slate-400 hover:text-slate-600"
              title="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Current Balance */}
          <div className="mb-6 rounded-lg bg-slate-50 p-4">
            <p className="mb-1 text-sm text-slate-600">Current Balance</p>
            <p className="text-xl font-semibold text-slate-900">
              {currentBalance.toLocaleString()} tokens
            </p>
            <p className="text-xs text-slate-500">≈ ${(currentBalance * 0.01).toFixed(2)} value</p>
          </div>

          <p className="mb-6 text-slate-600">
            Top up your wallet to continue using AI tools. Bigger packs include bonus tokens!
          </p>

          {/* Pack Selection */}
          <div className="mb-6 space-y-3">
            {packs.map((p) => (
              <label
                key={p.value}
                className={`relative flex cursor-pointer items-center justify-between rounded-lg border-2 p-4 transition-all ${
                  pack === p.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                } ${p.popular ? "ring-2 ring-blue-200" : ""}`}
              >
                {p.popular && (
                  <div className="absolute -top-2 left-4">
                    <span className="rounded-full bg-blue-500 px-2 py-1 text-xs font-medium text-white">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="pack"
                    value={p.value}
                    checked={pack === p.value}
                    onChange={() => setPack(p.value)}
                    className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-slate-900">{p.label}</div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span>{p.tokens} tokens</span>
                      {p.bonus && <span className="font-medium text-green-600">{p.bonus}</span>}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold text-slate-900">${p.value}</div>
                  <div className="text-xs text-slate-500">
                    {((parseInt(p.value) / p.rawTokens) * 100).toFixed(1)}
                    ¢/token
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* Purchase Summary */}
          {selectedPack && (
            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="mb-2 font-medium text-blue-900">Purchase Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Pack:</span>
                  <span className="font-medium text-blue-900">{selectedPack.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Tokens:</span>
                  <span className="font-medium text-blue-900">{selectedPack.tokens}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">New Balance:</span>
                  <span className="font-medium text-blue-900">
                    {(currentBalance + selectedPack.rawTokens).toLocaleString()} tokens
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Purchase Button */}
          <button
            onClick={handleBuy}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CreditCard className="h-4 w-4" />
            {loading ? "Redirecting to checkout..." : `Buy ${selectedPack?.tokens} Tokens`}
          </button>

          <p className="mt-3 text-center text-xs text-slate-500">
            Secure checkout powered by Stripe. Tokens never expire.
          </p>
        </div>
      </div>
    </div>
  );
}
