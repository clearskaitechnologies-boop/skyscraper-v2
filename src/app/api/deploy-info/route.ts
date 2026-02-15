import { promises as fs } from "fs";
import path from "path";

import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Deployment Info Endpoint
 * Shows which commit is actually deployed to production
 */
export async function GET() {
  let binaryTargets: string[] = [];
  try {
    const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
    const schema = await fs.readFile(schemaPath, "utf8");
    const match = schema.match(/binaryTargets\s*=\s*\[([^\]]+)\]/);
    if (match?.[1]) {
      binaryTargets = match[1]
        .split(",")
        .map((t) => t.replace(/"/g, "").trim())
        .filter(Boolean);
    }
  } catch (error) {
    console.warn("[deploy-info] Unable to read binaryTargets", error);
  }

  return NextResponse.json({
    commitSha: process.env.NEXT_PUBLIC_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || "unknown",
    commitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE || "unknown",
    branch: process.env.VERCEL_GIT_COMMIT_REF || process.env.NEXT_PUBLIC_BRANCH || "unknown",
    vercelEnv: process.env.VERCEL_ENV || "unknown",
    buildTime: new Date().toISOString(),
    nodeVersion: process.version,
    nextVersion: process.env.npm_package_dependencies_next || "unknown",
    prismaVersion: Prisma.prismaVersion,
    binaryTargets,
  });
}
