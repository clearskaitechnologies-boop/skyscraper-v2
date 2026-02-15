"use client";
import { useRouter } from "next/navigation";
import React from "react";

import MockupImage from "@/components/MockupImage";
import type { SlotKey } from "@/config/reportSlots";

type Props = {
  slot: SlotKey;
  title: string;
  description: string;
  imageBase: string;
  binder?: boolean;
};

export default function ReportTile({ slot, title, description, imageBase }: Props) {
  const router = useRouter();
  const onOpen = () => router.push(`/reports/viewer?page=${slot}`);
  return (
    <button
      aria-label={`Open ${title} preview`}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="group relative w-full rounded-2xl border border-neutral-800/40 bg-neutral-900/40 p-3 text-left shadow-sm transition hover:border-neutral-700 hover:shadow-lg"
      title={`${slot} — ${description}`}
    >
      <div className="overflow-hidden rounded-xl">
        <div className="transition-transform duration-300 group-hover:scale-[1.02]">
          <MockupImage baseName={imageBase} alt={`${slot} — ${title}`} />
        </div>
      </div>
      <div className="pt-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">
            {slot} — {title}
          </h3>
          <span className="text-xs opacity-70">Open</span>
        </div>
        <p className="text-sm opacity-80">{description}</p>
      </div>
    </button>
  );
}
