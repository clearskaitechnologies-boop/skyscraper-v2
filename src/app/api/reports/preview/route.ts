import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * REPORT PREVIEW ENDPOINT
 *
 * Pre-flight validation before PDF generation.
 * Calls /api/reports/context and validates required placeholders.
 *
 * Returns:
 * - Full merged context
 * - Missing fields warnings
 * - Template structure
 */

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ ok: false, error: "AUTH_REQUIRED" }, { status: 401 });
    }

    const body = await request.json();
    const { claimId, templateId } = body;

    if (!claimId) {
      return NextResponse.json({ ok: false, error: "CLAIM_ID_REQUIRED" }, { status: 400 });
    }

    // Call the master context API
    const contextRes = await fetch(new URL("/api/reports/context", request.url).toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
      body: JSON.stringify({
        claimId,
        templateId,
      }),
    });

    if (!contextRes.ok) {
      const error = await contextRes.json();
      return NextResponse.json(
        { ok: false, error: error.error || "CONTEXT_FETCH_FAILED" },
        { status: contextRes.status }
      );
    }

    const { context } = await contextRes.json();

    if (!context) {
      return NextResponse.json({ ok: false, error: "CONTEXT_EMPTY" }, { status: 500 });
    }

    // Validate required fields based on template placeholders
    const missingFields: string[] = [];

    if (context.template && context.template.placeholders) {
      const placeholders = context.template.placeholders;

      placeholders.forEach((placeholder: string) => {
        const parts = placeholder.split(".");

        if (parts.length >= 2) {
          const [group, field] = parts;
          const value = context[group]?.[field];

          if (value === null || value === undefined || value === "") {
            missingFields.push(placeholder);
          }
        }
      });
    }

    // Check critical fields
    if (!context.company.logo) {
      missingFields.push("company.logo");
    }

    if (!context.weather) {
      missingFields.push("weather (auto-pull failed)");
    }

    if (context.media.totalPhotos === 0) {
      missingFields.push("media.photos");
    }

    return NextResponse.json({
      ok: true,
      context,
      missingFields,
      warnings: {
        noLogo: !context.company.logo,
        noWeather: !context.weather,
        noPhotos: context.media.totalPhotos === 0,
        noNotes: context.notes.length === 0,
        noFindings: context.findings.length === 0,
      },
      ready: missingFields.length === 0,
    });
  } catch (error) {
    logger.error("[PREVIEW] Error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
      },
      { status: 500 }
    );
  }
}
