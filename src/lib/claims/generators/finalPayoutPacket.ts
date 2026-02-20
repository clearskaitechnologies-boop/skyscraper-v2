/**
 * Final Payout Packet Generator — Stub
 *
 * Original implementation archived. This stub prevents build errors
 * from the dynamic import in final-payout/actions/route.ts
 */

export interface FinalPayoutPacketOptions {
  includePhotos?: boolean;
  includeSupplements?: boolean;
  includeWeather?: boolean;
  format?: "pdf" | "docx" | "html";
}

export interface FinalPayoutPacket {
  id: string;
  claimId: string;
  generatedAt: Date;
  totalPayout: number;
  url?: string;
  breakdown: {
    baseAmount: number;
    supplements: number;
    deductible: number;
    depreciation: number;
    netPayout: number;
  };
  documents: Array<{
    type: string;
    name: string;
    url: string;
  }>;
}

export async function generateFinalPayoutPacket(
  claimId: string,
  _options?: FinalPayoutPacketOptions
): Promise<FinalPayoutPacket> {
  return {
    id: `fpkt_${claimId}_${Date.now()}`,
    claimId,
    generatedAt: new Date(),
    totalPayout: 0,
    url: undefined,
    breakdown: {
      baseAmount: 0,
      supplements: 0,
      deductible: 0,
      depreciation: 0,
      netPayout: 0,
    },
    documents: [],
  };
}
