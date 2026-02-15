"use client";

import { useState } from "react";

const SERVICE_CATEGORIES = [
  { id: "all", label: "All", icon: "🌟" },
  { id: "roofing", label: "Roofing", icon: "🏠" },
  { id: "hvac", label: "HVAC", icon: "❄️" },
  { id: "plumbing", label: "Plumbing", icon: "💧" },
  { id: "electrical", label: "Electrical", icon: "⚡" },
  { id: "restoration", label: "Restoration", icon: "🔧" },
  { id: "windows", label: "Windows", icon: "🪟" },
  { id: "landscaping", label: "Landscaping", icon: "🌿" },
];

interface CategoryFiltersProps {
  onCategoryChange?: (categoryId: string) => void;
}

export function CategoryFilters({ onCategoryChange }: CategoryFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    onCategoryChange?.(categoryId);
  };

  return (
    <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
      {SERVICE_CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleCategoryClick(cat.id)}
          className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
            selectedCategory === cat.id
              ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
              : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-800"
          }`}
        >
          <span>{cat.icon}</span>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
}
