"use client";

interface RadiusSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RadiusSelect({ value, onChange }: RadiusSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      title="Search radius"
    >
      <option value="">Any Distance</option>
      <option value="10">Within 10 miles</option>
      <option value="25">Within 25 miles</option>
      <option value="50">Within 50 miles</option>
      <option value="100">Within 100 miles</option>
    </select>
  );
}
