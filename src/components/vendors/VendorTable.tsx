"use client";
import Link from "next/link";

import { Vendor } from "@/data/vendors";

export default function VendorTable({ vendors }: { vendors: Vendor[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50">
          <tr>
            <th className="px-3 py-2 text-left">Vendor</th>
            <th className="px-3 py-2 text-left">Categories</th>
            <th className="px-3 py-2 text-left">Links</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((v) => (
            <tr key={v.slug} className="border-t">
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <img src={v.logoUrl} alt={v.name} className="h-6 w-auto" />
                  <span className="font-medium">{v.name}</span>
                </div>
              </td>
              <td className="px-3 py-2">{v.categories.join(" • ")}</td>
              <td className="space-x-2 px-3 py-2">
                {v.website && (
                  <a
                    className="underline"
                    href={v.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Website
                  </a>
                )}
                {v.warrantyUrl && (
                  <a
                    className="underline"
                    href={v.warrantyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Warranty
                  </a>
                )}
                {v.specsUrl && (
                  <a
                    className="underline"
                    href={v.specsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Specs
                  </a>
                )}
              </td>
              <td className="px-3 py-2 text-right">
                <Link
                  href={`/vendors/${v.slug}`}
                  className="rounded-md border px-3 py-1.5 hover:bg-neutral-50"
                >
                  Details →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
