// lib/intel/financial/save.ts
import prisma from "@/lib/prisma";

import { FinancialAnalysisResult } from "./engine";

export interface FinancialSnapshot {
  id: string;
  claimId: string;
  mathResult: any;
  aiResult: FinancialAnalysisResult;
  createdAt: Date;
}

export async function saveFinancialSnapshot({
  claimId,
  mathResult,
  aiResult,
}: {
  claimId: string;
  mathResult: any;
  aiResult: FinancialAnalysisResult;
}): Promise<FinancialSnapshot> {
  // Create snapshot object
  const snapshot: FinancialSnapshot = {
    id: crypto.randomUUID(),
    claimId,
    mathResult,
    aiResult,
    createdAt: new Date(),
  };

  // Get claim info for orgId and userId
  const claim = await prisma.claims.findUnique({
    where: { id: claimId },
    select: { orgId: true, assignedTo: true },
  });

  if (!claim) {
    throw new Error(`Claim ${claimId} not found`);
  }

  // Store the financial snapshot in an AiReport for persistence
  await prisma.ai_reports.create({
    data: {
      orgId: claim.orgId,
      claimId,
      type: "financial_analysis",
      title: "Financial Analysis Snapshot",
      prompt: "Financial Intelligence Engine analysis",
      content: JSON.stringify({
        snapshot,
        mathResult,
        aiResult,
        generatedAt: new Date().toISOString(),
      }),
      tokensUsed: 0,
      model: "gpt-4o",
      userId: claim.assignedTo || "system",
      userName: "Financial Engine",
      status: "generated",
      attachments: JSON.parse(
        JSON.stringify({
          mathResult,
          aiResult,
        })
      ),
    },
  });

  return snapshot;
}
