"use client";

import { Mail,Phone } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface TradePartner {
  id: string;
  businessName: string;
  licenseNumber?: string;
  phone?: string;
  email?: string;
  specialties: string[];
}

interface LinkedTrade {
  id: string;
  role: string;
  tradePartner: TradePartner;
}

interface PortalTradesCardProps {
  claimId: string;
}

export function PortalTradesCard({ claimId }: PortalTradesCardProps) {
  const [linkedTrades, setLinkedTrades] = useState<LinkedTrade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLinkedTrades();
  }, [claimId]);

  const fetchLinkedTrades = async () => {
    try {
      const response = await fetch(`/api/claims/${claimId}/trades`);
      if (response.ok) {
        const data = await response.json();
        setLinkedTrades(data.trades || []);
      }
    } catch (error) {
      console.error("Failed to fetch linked trades:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5">
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-1/3 rounded bg-slate-200" />
          <div className="h-4 w-1/2 rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  if (linkedTrades.length === 0) {
    return null; // Don't show empty section
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5">
      <h2 className="text-lg font-semibold text-slate-900">Trade Partners</h2>
      <p className="mt-1 text-sm text-slate-500">Contractors working on your claim</p>

      <div className="mt-4 space-y-3">
        {linkedTrades.map((link) => (
          <div
            key={link.id}
            className="rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-slate-900">{link.tradePartner.businessName}</h4>
                  {link.role && (
                    <Badge variant="outline" className="text-xs">
                      {link.role}
                    </Badge>
                  )}
                </div>

                {link.tradePartner.specialties.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {link.tradePartner.specialties.map((specialty, idx) => (
                      <Badge key={idx} className="bg-blue-100 text-xs text-blue-700">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="mt-3 space-y-1">
                  {link.tradePartner.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Phone className="h-4 w-4 text-blue-600" />
                      <a
                        href={`tel:${link.tradePartner.phone}`}
                        className="font-medium hover:text-blue-600"
                      >
                        {link.tradePartner.phone}
                      </a>
                    </div>
                  )}
                  {link.tradePartner.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Mail className="h-4 w-4 text-amber-600" />
                      <a
                        href={`mailto:${link.tradePartner.email}`}
                        className="hover:text-amber-600"
                      >
                        {link.tradePartner.email}
                      </a>
                    </div>
                  )}
                  {link.tradePartner.licenseNumber && (
                    <p className="mt-1 text-xs text-slate-600">
                      License: {link.tradePartner.licenseNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
