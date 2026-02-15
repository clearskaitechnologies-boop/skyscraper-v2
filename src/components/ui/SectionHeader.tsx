import React from "react";

interface SectionHeaderProps {
  title: string;
  emoji?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function SectionHeader({ title, emoji, subtitle, actions }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
          {emoji && <span className="text-xl">{emoji}</span>}
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
      </div>
      {actions && <div className="flex-shrink-0">{actions}</div>}
    </div>
  );
}
