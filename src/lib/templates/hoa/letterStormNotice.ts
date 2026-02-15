/**
 * HOA Storm Notice Letter Template Stub
 *
 * TODO: Implement HOA letter generation
 * This is a placeholder to allow builds to succeed
 */

export interface StormNoticeData {
  hoaName: string;
  propertyAddress: string;
  stormDate: string;
  damageDescription: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
}

/**
 * Generate HOA storm notice letter
 * Stub implementation
 */
export function generateStormNoticeLetter(data: StormNoticeData): string {
  console.log("[HOALetter] Stub: Would generate storm notice letter");
  return `
    Dear ${data.hoaName},
    
    This letter is to notify you of storm damage at ${data.propertyAddress}.
    
    Date of Storm: ${data.stormDate}
    Description: ${data.damageDescription}
    
    Sincerely,
    ${data.contactName || "Property Owner"}
  `;
}

/**
 * Generate letter as PDF buffer
 */
export async function generateStormNoticePDF(data: StormNoticeData): Promise<Buffer> {
  console.log("[HOALetter] Stub: Would generate PDF");
  return Buffer.from(generateStormNoticeLetter(data));
}

/**
 * Render HOA storm letter - alias for generateStormNoticeLetter
 */
export const renderHoaStormLetter = generateStormNoticeLetter;
