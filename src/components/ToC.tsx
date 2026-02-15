"use client";
import React from "react";

export type ToCItem = { id: string; title: string };

export default function ToC({
  items,
  heading = "Contents",
}: {
  items: ToCItem[];
  heading?: string;
}) {
  if (!items?.length) return null;
  return (
    <section className="pdf-break-before mb-6">
      <h2 className="text-xl font-semibold">{heading}</h2>
      <ul className="mt-2 space-y-1">
        {items.map((it) => (
          <li key={it.id} className="flex items-center justify-between text-sm">
            <span>{it.title}</span>
            <a href={`#${it.id}`} className="text-xs opacity-60 hover:opacity-100">
              view
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
