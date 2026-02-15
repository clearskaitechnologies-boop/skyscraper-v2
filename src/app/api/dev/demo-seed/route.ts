/**
 * Demo Seed API — Development Only
 * POST /api/dev/demo-seed
 *
 * Seeds the current org with realistic demo data for investor demos.
 * Creates claims, photos references, branding, and feed posts.
 *
 * ⚠️ Only available in development mode (NODE_ENV !== "production")
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { getResolvedOrgId } from "@/lib/auth/getResolvedOrgId";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // Block in production
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_DEMO_SEED) {
    return NextResponse.json(
      { error: "Demo seed is not available in production" },
      { status: 403 }
    );
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = await getResolvedOrgId();
    if (!orgId) {
      return NextResponse.json({ error: "No organization context" }, { status: 400 });
    }

    const results: string[] = [];

    // 1. Seed Organization Branding (if missing)
    const existingBranding = await db.query(
      `SELECT id FROM organization_branding WHERE organization_id = $1 LIMIT 1`,
      [orgId]
    );

    if (existingBranding.rows.length === 0) {
      await db.query(
        `INSERT INTO organization_branding (
          organization_id, company_name, brand_color, accent_color, 
          phone, email, website, license_number, address
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (organization_id) DO NOTHING`,
        [
          orgId,
          "ClearSkai Roofing & Restoration",
          "#1e40af",
          "#16a34a",
          "(928) 555-0142",
          "admin@clearskai.com",
          "https://clearskai.com",
          "ROC #330219",
          "1234 N. Prescott Lakes Pkwy, Prescott, AZ 86301",
        ]
      );
      results.push("✅ Organization branding seeded");
    } else {
      results.push("⏭️ Branding already exists — skipped");
    }

    // 2. Seed Demo Claims
    const demoClaims = [
      {
        claim_number: "DEMO-2024-001",
        property_address: "4521 E. Granite Dells Rd, Prescott Valley, AZ 86314",
        date_of_loss: "2024-07-15",
        loss_type: "HAIL",
        status: "IN_PROGRESS",
        homeowner_name: "Sarah Mitchell",
        homeowner_email: "sarah.mitchell@example.com",
        homeowner_phone: "(928) 555-0198",
        carrier_name: "State Farm",
        policy_number: "SF-AZ-887432",
      },
      {
        claim_number: "DEMO-2024-002",
        property_address: "2890 W. Prescott Lakes Blvd, Prescott, AZ 86301",
        date_of_loss: "2024-08-22",
        loss_type: "WIND",
        status: "SUPPLEMENT",
        homeowner_name: "Michael Torres",
        homeowner_email: "m.torres@example.com",
        homeowner_phone: "(928) 555-0211",
        carrier_name: "Allstate",
        policy_number: "AL-AZ-551890",
      },
      {
        claim_number: "DEMO-2024-003",
        property_address: "7102 N. Williamson Valley Rd, Prescott, AZ 86305",
        date_of_loss: "2024-09-10",
        loss_type: "ROOF_INSPECTION",
        status: "COMPLETED",
        homeowner_name: "Jennifer & Robert Adams",
        homeowner_email: "j.adams@example.com",
        homeowner_phone: "(928) 555-0177",
        carrier_name: "USAA",
        policy_number: "USAA-AZ-992103",
      },
    ];

    let claimsCreated = 0;
    for (const claim of demoClaims) {
      const exists = await db.query(
        `SELECT id FROM claims WHERE claim_number = $1 AND organization_id = $2 LIMIT 1`,
        [claim.claim_number, orgId]
      );

      if (exists.rows.length === 0) {
        await db.query(
          `INSERT INTO claims (
            organization_id, claim_number, property_address, date_of_loss,
            loss_type, status, homeowner_name, homeowner_email, homeowner_phone,
            carrier_name, policy_number, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            orgId,
            claim.claim_number,
            claim.property_address,
            claim.date_of_loss,
            claim.loss_type,
            claim.status,
            claim.homeowner_name,
            claim.homeowner_email,
            claim.homeowner_phone,
            claim.carrier_name,
            claim.policy_number,
            userId,
          ]
        );
        claimsCreated++;
      }
    }
    results.push(
      claimsCreated > 0
        ? `✅ ${claimsCreated} demo claims seeded`
        : "⏭️ Demo claims already exist — skipped"
    );

    // 3. Seed Trades Feed Posts
    const tradeProfileRes = await db.query(
      `SELECT id FROM trades_company_profile 
       WHERE organization_id = $1 OR created_by = $2 
       LIMIT 1`,
      [orgId, userId]
    );

    if (tradeProfileRes.rows.length > 0) {
      const profileId = tradeProfileRes.rows[0].id;
      const existingPosts = await db.query(
        `SELECT COUNT(*) as count FROM trades_feed_posts WHERE profile_id = $1`,
        [profileId]
      );

      if (parseInt(existingPosts.rows[0]?.count || "0") === 0) {
        const seedPosts = [
          {
            content:
              "Just completed a 45,000 sq ft commercial re-roof in downtown Prescott. GAF HDZ Charcoal shingles — 25-year golden pledge warranty. Ahead of schedule by 3 days! 🏗️ #CommercialRoofing #Prescott",
            type: "project_showcase",
          },
          {
            content:
              "Storm season prep tip: Get your roof inspected BEFORE monsoon season hits. We're booking free inspections for April & May. DM us! ☀️🌧️ #RoofInspection #ArizonaRoofing",
            type: "update",
          },
        ];

        for (const post of seedPosts) {
          await db.query(
            `INSERT INTO trades_feed_posts (profile_id, content, type, created_at) 
             VALUES ($1, $2, $3, NOW())`,
            [profileId, post.content, post.type]
          );
        }
        results.push("✅ 2 demo feed posts seeded");
      } else {
        results.push("⏭️ Feed posts already exist — skipped");
      }
    } else {
      results.push("⏭️ No trades profile found — skipped feed posts");
    }

    return NextResponse.json({
      success: true,
      message: "Demo seed complete",
      results,
      orgId,
    });
  } catch (error: any) {
    console.error("[Demo Seed] Error:", error);
    return NextResponse.json({ error: error.message || "Demo seed failed" }, { status: 500 });
  }
}
