"use client";

interface VerifiedToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export default function VerifiedToggle({ value, onChange }: VerifiedToggleProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
      />
      <span className="text-sm font-medium text-gray-700">
        Verified Only
      </span>
    </label>
  );
}
