import React from "react";

export function TradePartnerCard({ name, serviceType, description, websiteUrl, phone, email }: { name: string; serviceType?: string | null; description?: string | null; websiteUrl?: string | null; phone?: string | null; email?: string | null; }) {
  return (
    <div className="flex flex-col gap-2 rounded border bg-white p-4">
      <div className="truncate font-medium" title={name}>{name}</div>
      {serviceType && <div className="text-xs text-muted-foreground">{serviceType}</div>}
      {description && <div className="line-clamp-3 text-xs text-muted-foreground">{description}</div>}
      <div className="flex flex-wrap gap-2 pt-2 text-xs">
        {websiteUrl && <a href={websiteUrl} target="_blank" className="underline">Website</a>}
        {phone && <a href={`tel:${phone}`} className="underline">Call</a>}
        {email && <a href={`mailto:${email}`} className="underline">Email</a>}
      </div>
    </div>
  );
}
