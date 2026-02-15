import React from "react";

export function TimelineItem({ title, description, date }: { title: string; description?: string; date: Date }) {
  return (
    <div className="relative pl-6">
      <div className="absolute left-0 top-2 h-3 w-3 rounded-full bg-blue-600" />
      <div className="text-sm font-medium">{title}</div>
      {description && <div className="mt-1 text-xs text-muted-foreground">{description}</div>}
      <div className="mt-1 text-[10px] text-muted-foreground">{date.toLocaleString()}</div>
    </div>
  );
}
