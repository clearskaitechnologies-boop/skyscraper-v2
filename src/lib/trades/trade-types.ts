export type TradeType =
  | "ROOFING"
  | "PLUMBING"
  | "ELECTRICAL"
  | "HVAC"
  | "GENERAL"
  | "HANDYMAN"
  | "LANDSCAPING"
  | "PEST_CONTROL"
  | "CLEANING"
  | "WINDOWS"
  | "OTHER";

export const TRADE_LABELS: { id: TradeType; label: string; icon: string }[] = [
  { id: "ROOFING", label: "Roofing", icon: "🏠" },
  { id: "PLUMBING", label: "Plumbing", icon: "🚰" },
  { id: "ELECTRICAL", label: "Electrical", icon: "⚡" },
  { id: "HVAC", label: "HVAC", icon: "❄️" },
  { id: "GENERAL", label: "General Contractor", icon: "🧱" },
  { id: "HANDYMAN", label: "Handyman", icon: "🛠️" },
  { id: "LANDSCAPING", label: "Landscaping", icon: "🌿" },
  { id: "PEST_CONTROL", label: "Pest Control", icon: "🐜" },
  { id: "CLEANING", label: "Cleaning", icon: "🧼" },
  { id: "WINDOWS", label: "Windows & Glass", icon: "🪟" },
  { id: "OTHER", label: "Other Trade", icon: "✨" },
];
