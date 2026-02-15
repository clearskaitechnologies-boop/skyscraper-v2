"use client";

import { useState } from "react";

import { TRADE_LABELS, TradeType } from "@/lib/trades/trade-types";

type Contractor = {
  id: string;
  businessName: string;
  logoUrl: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
};

type Property = {
  id: string;
  label: string | null;
  address: string;
};

type Link = {
  id: string;
  contractorId: string;
  trade: string;
  isPrimary: boolean;
  nickname: string | null;
  notes: string | null;
  addedAt: string;
  contractor: Contractor;
  property: Property | null;
};

type Props = {
  groupedLinks: Record<TradeType, Link[]>;
};

export function TradeTeamGrid({ groupedLinks }: Props) {
  const [links, setLinks] = useState(groupedLinks);
  const [loadingLinkId, setLoadingLinkId] = useState<string | null>(null);

  async function setPrimary(link: Link) {
    try {
      setLoadingLinkId(link.id);
      const res = await fetch("/api/trade-team/link", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId: link.id, isPrimary: true }),
      });

      if (!res.ok) return;

      const trade = link.trade as TradeType;
      const updatedGroup = links[trade].map((l) =>
        l.id === link.id
          ? { ...l, isPrimary: true }
          : { ...l, isPrimary: false }
      );

      setLinks({
        ...links,
        [trade]: updatedGroup,
      });
    } finally {
      setLoadingLinkId(null);
    }
  }

  async function removeLink(link: Link) {
    const confirm = window.confirm(
      `Remove ${link.contractor.businessName} from your Trade Team?`
    );
    if (!confirm) return;

    try {
      setLoadingLinkId(link.id);
      const res = await fetch(
        `/api/trade-team/link?linkId=${encodeURIComponent(link.id)}`,
        { method: "DELETE" }
      );

      if (!res.ok) return;

      const trade = link.trade as TradeType;
      const updatedGroup = links[trade].filter((l) => l.id !== link.id);

      setLinks({
        ...links,
        [trade]: updatedGroup,
      });
    } finally {
      setLoadingLinkId(null);
    }
  }

  async function saveNotes(link: Link, nickname: string, notes: string) {
    try {
      setLoadingLinkId(link.id);
      const res = await fetch("/api/trade-team/link", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId: link.id, nickname, notes }),
      });

      if (!res.ok) return;

      const trade = link.trade as TradeType;
      const updatedGroup = links[trade].map((l) =>
        l.id === link.id ? { ...l, nickname, notes } : l
      );

      setLinks({
        ...links,
        [trade]: updatedGroup,
      });
    } finally {
      setLoadingLinkId(null);
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {TRADE_LABELS.map((t) => {
        const trade = t.id as TradeType;
        const tradeLinks = links[trade] ?? [];

        return (
          <div
            key={trade}
            className="flex flex-col rounded-xl border bg-white p-4 shadow-sm"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{t.icon}</span>
                <div>
                  <div className="text-sm font-semibold">{t.label}</div>
                  <div className="text-xs text-slate-500">
                    {tradeLinks.length === 0
                      ? "No pro saved yet."
                      : `${tradeLinks.length} pro${
                          tradeLinks.length > 1 ? "s" : ""
                        } on your team.`}
                  </div>
                </div>
              </div>
            </div>

            {tradeLinks.length === 0 ? (
              <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-xs text-slate-500">
                When you submit a work request for {t.label.toLowerCase()} and
                like the company, you can add them to your Trade Team from the
                success screen. This keeps your favorite pros one tap away.
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                {tradeLinks.map((link) => {
                  const c = link.contractor;
                  const isBusy = loadingLinkId === link.id;

                  return (
                    <div
                      key={link.id}
                      className="rounded-lg border bg-slate-50 px-3 py-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">
                              {link.nickname || c.businessName}
                            </span>
                            {link.isPrimary && (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                PRIMARY
                              </span>
                            )}
                          </div>
                          {link.nickname && (
                            <div className="text-[11px] text-slate-500">
                              {c.businessName}
                            </div>
                          )}
                          {link.property && (
                            <div className="mt-1 text-[11px] text-slate-500">
                              Assigned to:{" "}
                              {link.property.label || link.property.address}
                            </div>
                          )}
                          <div className="mt-1 space-x-2 text-[11px] text-slate-600">
                            {c.phone && <span>📞 {c.phone}</span>}
                            {c.email && <span>✉️ {c.email}</span>}
                          </div>
                          {link.notes && (
                            <div className="mt-1 text-[11px] text-slate-600">
                              Notes: {link.notes}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-1">
                          {!link.isPrimary && (
                            <button
                              type="button"
                              onClick={() => setPrimary(link)}
                              disabled={isBusy}
                              className="rounded-full border px-2 py-1 text-[10px] font-medium hover:bg-white disabled:opacity-50"
                            >
                              Set Primary
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const nickname =
                                prompt(
                                  "Nickname for this pro (optional):",
                                  link.nickname || c.businessName
                                ) || link.nickname || c.businessName;
                              const notes =
                                prompt(
                                  "Notes (e.g. 'Did full reroof in 2024'):",
                                  link.notes || ""
                                ) || link.notes || "";
                              saveNotes(link, nickname, notes);
                            }}
                            disabled={isBusy}
                            className="rounded-full border px-2 py-1 text-[10px] font-medium hover:bg-white disabled:opacity-50"
                          >
                            Edit Notes
                          </button>
                          <button
                            type="button"
                            onClick={() => removeLink(link)}
                            disabled={isBusy}
                            className="rounded-full border border-red-200 px-2 py-1 text-[10px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
