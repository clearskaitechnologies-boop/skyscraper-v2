import React from "react";

import ReportTile from "@/components/ReportTile";
import { REPORT_SLOTS } from "@/config/reportSlots";

export default function ReportPreviewGrid() {
  const slots = Object.entries(REPORT_SLOTS)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([key, s]) => ({ key, ...s }) as any);

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {slots.map((s: any) => (
        <ReportTile
          key={s.key}
          slot={s.key}
          title={s.title}
          description={s.description}
          imageBase={s.baseName}
          binder={s.binder}
        />
      ))}
    </div>
  );
}
