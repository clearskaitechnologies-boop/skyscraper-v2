import { nanoid } from "nanoid";

/**
 * Generate a unique slug for a contact record.
 * Pattern: "firstname-lastname-<6-char nanoid>"
 * Always unique due to the nanoid suffix.
 */
export function generateContactSlug(firstName: string, lastName: string): string {
  const base = `${firstName}-${lastName}`
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  return `${base}-${nanoid(6)}`;
}
