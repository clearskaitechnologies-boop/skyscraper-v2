/**
 * Generate a unique claim number
 * Format: CLM-YYYYMMDD-XXXX
 */

export function generateClaimNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const arr = new Uint16Array(1);
  crypto.getRandomValues(arr);
  const random = (arr[0] % 10000).toString().padStart(4, "0");

  return `CLM-${year}${month}${day}-${random}`;
}
