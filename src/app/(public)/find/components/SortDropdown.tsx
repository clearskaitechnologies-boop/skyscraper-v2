"use client";

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      title="Sort results"
    >
      <option value="best">Best Match</option>
      <option value="distance">Nearest First</option>
      <option value="verified">Verified First</option>
    </select>
  );
}
