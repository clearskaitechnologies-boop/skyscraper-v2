"use client";

interface EmergencyToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export default function EmergencyToggle({ value, onChange }: EmergencyToggleProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded text-red-600 focus:ring-2 focus:ring-red-500"
      />
      <span className="text-sm font-medium text-gray-700">
        24/7 Emergency
      </span>
    </label>
  );
}
