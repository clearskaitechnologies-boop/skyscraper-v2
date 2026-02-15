// lib/depreciation/finalInvoiceBuilder.ts
/**
 * 🔥 PHASE 13.4 - FINAL INVOICE BUILDER
 *
 * Generates carrier-ready final invoice with:
 * - Line-item detail (Xactimate-style)
 * - Original estimate vs actual costs
 * - Approved supplements
 * - Depreciation calculations
 * - Tax + O&P
 * - Final amount owed
 */

import { generateFinancialAnalysis } from "@/lib/intel/financial/generateFinancial";
import prisma from "@/lib/prisma";

export interface FinalInvoice {
  claimNumber: string;
  contractor: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    license?: string;
  };
  customer: {
    name: string;
    address: string;
  };
  carrier: {
    name: string;
    adjusterName?: string;
    adjusterEmail?: string;
  };

  // Financial Breakdown
  originalEstimate: {
    rcv: number;
    acv: number;
    depreciation: number;
  };
  approvedSupplements: {
    rcv: number;
    description: string;
  }[];

  // Line Items
  lineItems: {
    code: string;
    description: string;
    quantity: number;
    unit: string;
    unitCost: number;
    totalCost: number;
    category: string;
  }[];

  // Calculations
  subtotal: number;
  overheadAndProfit: number;
  taxRate: number;
  tax: number;
  totalRcv: number;

  // Payments
  acvPaid: number;
  deductible: number;
  supplementsPaid: number;
  totalPaid: number;

  // Final Amount
  depreciationOwed: number;
  finalInvoiceTotal: number;

  // Metadata
  lossDate: string;
  completionDate: string;
  generatedDate: string;
}

export async function buildFinalInvoice(claim_id: string, orgId: string): Promise<FinalInvoice> {
  console.log(`[Final Invoice Builder] Building for claim ${claimId}`);

  // Fetch claim with all related data
  const claim = await prisma.claims.findFirst({
    where: { id: claimId, orgId },
    include: {
      property: true,
      claimPayments: true,
      supplements: {
        include: {
          items: true,
        },
      },
    },
  });

  if (!claim) {
    throw new Error("Claim not found");
  }

  // Fetch financial analysis
  const financialAnalysis = await generateFinancialAnalysis(claimId, orgId);

  // Fetch approved supplements
  const approvedSupplements = claim.supplements.filter((s: any) => s.status === "APPROVED");

  // Calculate supplement totals
  const supplementTotal = approvedSupplements.reduce((sum: number, supp: any) => {
    const suppTotal = supp.lineItems.reduce(
      (lineSum: number, item: any) => lineSum + Number(item.approvedAmount || item.totalCost),
      0
    );
    return sum + suppTotal;
  }, 0);

  // Get Org details for contractor info
  const Org = await prisma.org.findUnique({
    where: { id: orgId },
  });

  // Build line items from financial analysis
  const lineItems = financialAnalysis.comparisonTable.map((row: any) => ({
    code: row.lineItem || "MISC",
    description: row.description || row.lineItem,
    quantity: row.contractorQty || 0,
    unit: "UNIT",
    unitCost: row.contractorQty > 0 ? row.contractorRCV / row.contractorQty : 0,
    totalCost: row.contractorRCV,
    category: "ROOFING",
  }));

  // Calculate totals
  const subtotal = lineItems.reduce((sum: number, item: any) => sum + item.totalCost, 0);
  const overheadAndProfit = subtotal * 0.1; // 10% O&P
  const taxRate = 0.0885; // Arizona - Chino Valley
  const tax = (subtotal + overheadAndProfit) * taxRate;
  const totalRcv = subtotal + overheadAndProfit + tax;

  // Payments received
  const acvPaid = claim.claim_payments.reduce(
    (sum: any, payment: any) => sum + (payment.acvPaid || 0),
    0
  );
  const deductible = claim.deductible || 0;
  const supplementsPaid = 0; // Track separately if needed
  const totalPaid = acvPaid + supplementsPaid;

  // Depreciation calculation
  const depreciationOwed = totalRcv - totalPaid - deductible;
  const finalInvoiceTotal = totalRcv;

  const invoice: FinalInvoice = {
    claimNumber: claim.claimNumber,
    contractor: {
      name: Org?.name || "Contractor",
      address: "",
      phone: "",
      email: "",
      license: "",
    },
    customer: {
      name: claim.insured_name || "Homeowner",
      address: claim.property
        ? `${claim.properties.street}, ${claim.properties.city}, ${claim.properties.state} ${claim.properties.zipCode}`
        : "",
    },
    carrier: {
      name: claim.carrier || "Insurance Carrier",
      adjusterName: claim.adjusterName || undefined,
      adjusterEmail: claim.adjusterEmail || undefined,
    },
    originalEstimate: {
      rcv: financialAnalysis.carrierRCV,
      acv: financialAnalysis.carrierACV,
      depreciation: financialAnalysis.carrierRCV - financialAnalysis.carrierACV,
    },
    approvedSupplements: approvedSupplements.map((supp: any) => ({
      rcv: supp.items.reduce(
        (sum: number, item: any) => sum + Number(item.approvedAmount || item.totalCost),
        0
      ),
      description: supp.requestReason || "Additional items",
    })),
    lineItems,
    subtotal,
    overheadAndProfit,
    taxRate,
    tax,
    totalRcv,
    acvPaid,
    deductible,
    supplementsPaid,
    totalPaid,
    depreciationOwed,
    finalInvoiceTotal,
    lossDate: claim.dateOfLoss?.toISOString().split("T")[0] || "",
    completionDate: new Date().toISOString().split("T")[0],
    generatedDate: new Date().toISOString().split("T")[0],
  };

  console.log(`[Final Invoice Builder] Invoice total: $${finalInvoiceTotal.toFixed(2)}`);
  console.log(`[Final Invoice Builder] Depreciation owed: $${depreciationOwed.toFixed(2)}`);

  return invoice;
}
