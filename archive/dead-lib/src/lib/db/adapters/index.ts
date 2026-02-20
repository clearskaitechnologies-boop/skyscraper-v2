/**
 * Database Adapters
 *
 * This module provides the boundary between Prisma (snake_case DB reality)
 * and the Application Domain (camelCase DTOs).
 *
 * RULES:
 * ❌ React pages NEVER receive raw Prisma rows
 * ❌ AI engines NEVER receive snake_case
 * ❌ PDF builders NEVER receive snake_case
 * ✅ Everything past API layer consumes DTOs from these adapters
 *
 * USAGE:
 * ```ts
 * import { adaptClaim, adaptClaims, ClaimDTO } from '@/lib/db/adapters'
 *
 * const row = await prisma.claims.findUnique({ where: { id } })
 * const claim: ClaimDTO = adaptClaim(row)
 * ```
 */

// Claim adapters
export {
  adaptClaim,
  adaptClaims,
  adaptContact,
  adaptProperty,
  adaptSupplement,
  adaptSupplements,
  type ClaimDTO,
  type ContactDTO,
  type PropertyDTO,
  type SupplementDTO,
} from "./claimAdapter";

// Billing adapters
export {
  adaptOrgBilling,
  adaptPlan,
  adaptPlans,
  adaptSubscription,
  adaptTokenWallet,
  adaptTokenWallets,
  type OrgBillingDTO,
  type PlanDTO,
  type SubscriptionDTO,
  type TokenWalletDTO,
} from "./billingAdapter";

// Trade adapters
export {
  adaptTradesCompanies,
  adaptTradesCompany,
  adaptTradesMember,
  adaptTradesMembers,
  adaptTradesPost,
  type TradesCompanyDTO,
  type TradesMemberDTO,
  type TradesPostDTO,
} from "./tradeAdapter";

// Report adapters
export {
  adaptAIReport,
  adaptAIReports,
  adaptReportTemplate,
  adaptReportTemplates,
  type AIReportDTO,
  type ReportTemplateDTO,
} from "./reportAdapter";

// User adapters
export {
  adaptOrg,
  adaptOrgs,
  adaptUser,
  adaptUsers,
  type OrgDTO,
  type UserDTO,
} from "./userAdapter";
