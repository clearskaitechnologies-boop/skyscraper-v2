"use client";

export type CoverPageProps = {
  title: string;
  address?: string;
  date?: string;
  logoUrl?: string;
  company?: { name?: string; phone?: string; email?: string; website?: string; address?: string };
  client?: { name?: string; email?: string; phone?: string };
  qrUrl?: string;
};

export default function CoverPage({
  title,
  address,
  date,
  logoUrl,
  company,
  client,
  qrUrl,
}: CoverPageProps) {
  const today = new Date();
  const d = date || today.toLocaleDateString();
  return (
    <section className="pdf-break-before mb-6 rounded-2xl border bg-card p-6">
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold leading-tight">{title}</h1>
          {address && <div className="text-sm opacity-70">{address}</div>}
          <div className="text-sm opacity-70">Date: {d}</div>
          {client && (client.name || client.email || client.phone) && (
            <div className="mt-2 text-sm">
              <div className="font-medium">Client</div>
              {client.name && <div>{client.name}</div>}
              {client.email && <div className="opacity-70">{client.email}</div>}
              {client.phone && <div className="opacity-70">{client.phone}</div>}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-3">
          {logoUrl && (
            <div className="relative h-12 w-40">
              <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
            </div>
          )}
          {company &&
            (company.name ||
              company.phone ||
              company.email ||
              company.website ||
              company.address) && (
              <div className="text-right text-xs opacity-80">
                {company.name && <div className="font-medium opacity-100">{company.name}</div>}
                {company.address && <div>{company.address}</div>}
                {company.phone && <div>{company.phone}</div>}
                {company.email && <div>{company.email}</div>}
                {company.website && <div>{company.website}</div>}
              </div>
            )}
          {qrUrl && (
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrUrl)}`}
              alt="QR code"
              className="h-24 w-24 rounded border"
            />
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-3 text-sm md:grid-cols-3">
        <div className="rounded-xl border bg-muted/50 p-3">
          <div className="text-[13px] uppercase tracking-wide opacity-60">Project Address</div>
          <div>{address || "—"}</div>
        </div>
        <div className="rounded-xl border bg-muted/50 p-3">
          <div className="text-[13px] uppercase tracking-wide opacity-60">Prepared By</div>
          <div>{company?.name || "—"}</div>
        </div>
        <div className="rounded-xl border bg-muted/50 p-3">
          <div className="text-[13px] uppercase tracking-wide opacity-60">Prepared On</div>
          <div>{d}</div>
        </div>
      </div>
    </section>
  );
}
