import { pool } from "@/server/db";

type PlanKey = "solo" | "pro" | "business" | "enterprise";
const PLAN_LIMITS: Record<PlanKey, { posts: number; outreach: number }> = {
  solo: { posts: 2, outreach: 2 },
  pro: { posts: 5, outreach: 5 },
  business: { posts: 15, outreach: 15 },
  enterprise: { posts: 50, outreach: 50 },
};

export async function getOrgPlanSlug(orgId: string): Promise<PlanKey> {
  const r = await pool.query(
    "select p.slug from org_plan op join plans p on p.id=op.plan_id where op.org_id=$1 limit 1",
    [orgId]
  );
  return (r.rows[0]?.slug ?? "solo") as PlanKey;
}

export async function getUsage(orgId: string, yearMonth: string) {
  const r = await pool.query(
    "select posts_used,outreach_used from network_usage_monthly where org_id=$1 and year_month=$2",
    [orgId, yearMonth]
  );
  return { postsUsed: r.rows[0]?.posts_used ?? 0, outreachUsed: r.rows[0]?.outreach_used ?? 0 };
}

export async function canPost(orgId: string, yearMonth: string) {
  const plan = await getOrgPlanSlug(orgId);
  const { postsUsed } = await getUsage(orgId, yearMonth);
  return postsUsed < PLAN_LIMITS[plan].posts;
}

export async function canOutreach(orgId: string, yearMonth: string) {
  const plan = await getOrgPlanSlug(orgId);
  const { outreachUsed } = await getUsage(orgId, yearMonth);
  return outreachUsed < PLAN_LIMITS[plan].outreach;
}
