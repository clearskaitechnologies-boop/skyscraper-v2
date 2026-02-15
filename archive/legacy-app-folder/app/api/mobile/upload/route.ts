// ============================================================================
// H-17: Mobile API - Photo Upload with Compression
// ============================================================================

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { jwtVerify } from "jose";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "skaiscrape-mobile-secret");

async function verifyMobileToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    // Verify JWT token
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = await verifyMobileToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const claimId = formData.get("claimId") as string;
    const category = (formData.get("category") as string) || "general";

    if (!file || !claimId) {
      return NextResponse.json({ error: "File and claimId required" }, { status: 400 });
    }

    // Validate file size (max 10MB for mobile uploads)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum 10MB allowed." }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 9);
    const ext = file.name.split(".").pop();
    const fileName = `${claimId}/${category}/${timestamp}-${randomStr}.${ext}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from("photos").upload(fileName, file, {
      contentType: file.type,
      cacheControl: "3600",
    });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("photos").getPublicUrl(fileName);

    // TODO: Create database record for photo
    // await db.claimPhoto.create({ ... });

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      fileName: data.path,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[MOBILE_UPLOAD_ERROR]", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
