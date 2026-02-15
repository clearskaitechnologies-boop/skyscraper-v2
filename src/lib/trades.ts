/**
 * Supported trade types for the Trades Network
 */
export const TRADE_TYPES = [
  "Roofing",
  "General Contracting",
  "Plumbing",
  "Electrical",
  "HVAC",
  "Painting",
  "Drywall & Texture",
  "Flooring",
  "Concrete & Foundations",
  "Framing & Carpentry",
  "Solar Install",
  "Landscaping & Irrigation",
  "Fire & Water Restoration",
  "Mold Remediation",
  "Asphalt & Paving",
  "Gutters & Sheet Metal",
  "Fencing",
  "Welding / Metal Fabrication",
  "Windows & Glazing",
  "Handyman / Punch-Out",
] as const;

export type TradeType = (typeof TRADE_TYPES)[number];

/**
 * Get emoji for trade type
 */
export function getTradeEmoji(trade: string): string {
  const emojiMap: Record<string, string> = {
    Roofing: "🏠",
    "General Contracting": "👷",
    Plumbing: "🔧",
    Electrical: "⚡",
    HVAC: "❄️",
    Painting: "🎨",
    "Drywall & Texture": "🧱",
    Flooring: "🪵",
    "Concrete & Foundations": "🏗️",
    "Framing & Carpentry": "🔨",
    "Solar Install": "☀️",
    "Landscaping & Irrigation": "🌳",
    "Fire & Water Restoration": "🔥",
    "Mold Remediation": "🧼",
    "Asphalt & Paving": "🛣️",
    "Gutters & Sheet Metal": "🏚️",
    Fencing: "🚧",
    "Welding / Metal Fabrication": "⚙️",
    "Windows & Glazing": "🪟",
    "Handyman / Punch-Out": "🔩",
  };

  return emojiMap[trade] || "🛠️";
}
