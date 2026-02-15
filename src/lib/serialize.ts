// Utility to produce Flight-safe plain JSON structures
export function toPlainJSON(value: any): any {
  if (value === null || value === undefined) return value === undefined ? null : value;

  if (value instanceof Date) return value.toISOString();
  if (typeof value === "bigint") return value.toString();

  // Prisma Decimal or any object with toString
  if (typeof value === "object" && typeof (value as any).toString === "function") {
    const str = (value as any).toString();
    // If numeric, return number; otherwise string
    const num = Number(str);
    return Number.isNaN(num) ? str : num;
  }

  if (Array.isArray(value)) return value.map((item) => toPlainJSON(item));

  if (typeof value === "object") {
    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      const cleaned = toPlainJSON(v);
      result[k] = cleaned === undefined ? null : cleaned;
    }
    return result;
  }

  return value;
}
