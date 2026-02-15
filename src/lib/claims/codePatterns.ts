// Enhanced code item detection configuration
const PATTERNS = [
  /(starter|drip edge)/i,
  /(ice[- ]?barrier|ice[- ]?shield)/i,
  /(ridge vent|box vent)/i,
  /(flashing)/i,
  /(valley metal)/i,
  /(pipe boot)/i
];

export function isCodeItem(description: string): boolean {
  return PATTERNS.some(rx => rx.test(description));
}
