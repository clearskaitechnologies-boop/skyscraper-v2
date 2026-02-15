import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Vendor } from "@/data/vendors";

export default function VendorCard({ v }: { v: Vendor }) {
  return (
    <div className="group rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-3">
        <img src={v.logoUrl} alt={v.name} className="h-10 w-auto object-contain" />
        <div className="ml-auto flex gap-2">
          {v.website && (
            <a
              className="text-sm underline"
              href={v.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              Website
            </a>
          )}
          {v.warrantyUrl && (
            <a
              className="text-sm underline"
              href={v.warrantyUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Warranty
            </a>
          )}
          {v.specsUrl && (
            <a
              className="text-sm underline"
              href={v.specsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Specs
            </a>
          )}
        </div>
      </div>

      <div className="mt-3 space-x-2">
        {v.categories.map((c) => (
          <Badge key={c}>{c}</Badge>
        ))}
      </div>

      {v.summary && <p className="mt-3 text-sm text-neutral-600">{v.summary}</p>}

      <div className="mt-4 flex items-center gap-3">
        <Link
          href={`/vendors/${v.slug}`}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
        >
          View Details
        </Link>
        {v.docs?.slice(0, 2).map((d) => (
          <a
            key={d.url}
            href={d.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline"
          >
            {d.label}
          </a>
        ))}
      </div>
    </div>
  );
}
