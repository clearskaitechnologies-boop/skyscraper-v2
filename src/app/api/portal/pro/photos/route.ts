/**
 * Pro Cover Photo Upload API
 *
 * Handles cover photo uploads for trades professionals/companies
 * Stores in Supabase storage with signed URLs
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BUCKET_NAME = "pro-assets";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "cover"; // cover, avatar, logo

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF",
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "File too large. Maximum size is 10MB",
        },
        { status: 400 }
      );
    }

    // Get the trades company member for this user
    const member = await prisma.tradesCompanyMember.findUnique({
      where: { userId },
      select: {
        id: true,
        companyId: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        {
          error: "Pro profile not found. Please complete your profile first.",
        },
        { status: 404 }
      );
    }

    // Generate file path
    const timestamp = Date.now();
    const extension = file.name.split(".").pop() || "jpg";
    const fileName = `${type}_${timestamp}.${extension}`;
    const filePath = `${member.companyId || member.id}/${fileName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("[COVER_PHOTO] Upload error:", uploadError);
      return NextResponse.json(
        {
          error: "Failed to upload file",
        },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // Update the member/company record based on type
    if (type === "cover") {
      await prisma.tradesCompanyMember.update({
        where: { id: member.id },
        data: {
          coverPhoto: publicUrl,
          updatedAt: new Date(),
        },
      });

      // Also update company coverimage if user is owner/admin
      if (member.companyId) {
        await prisma.tradesCompany.update({
          where: { id: member.companyId },
          data: {
            coverimage: publicUrl,
            updatedAt: new Date(),
          },
        });
      }
    } else if (type === "avatar") {
      await prisma.tradesCompanyMember.update({
        where: { id: member.id },
        data: {
          avatar: publicUrl,
          profilePhoto: publicUrl,
          updatedAt: new Date(),
        },
      });
    } else if (type === "logo" && member.companyId) {
      await prisma.tradesCompany.update({
        where: { id: member.companyId },
        data: {
          logo: publicUrl,
          updatedAt: new Date(),
        },
      });
    }

    console.log(`[COVER_PHOTO] Uploaded ${type} for member ${member.id}: ${publicUrl}`);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      type,
      fileName,
      size: file.size,
    });
  } catch (error) {
    console.error("[COVER_PHOTO] Error:", error);
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 });
  }
}

// GET - Return current cover/avatar URLs
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const member = await prisma.tradesCompanyMember.findUnique({
      where: { userId },
      select: {
        id: true,
        coverPhoto: true,
        avatar: true,
        profilePhoto: true,
        company: {
          select: {
            id: true,
            coverimage: true,
            logo: true,
          },
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Pro profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      coverPhoto: member.coverPhoto || member.company?.coverimage,
      avatar: member.avatar || member.profilePhoto,
      logo: member.company?.logo,
      companyId: member.company?.id,
    });
  } catch (error) {
    console.error("[COVER_PHOTO GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 });
  }
}

// DELETE - Remove a photo
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const type = url.searchParams.get("type") || "cover";

    const member = await prisma.tradesCompanyMember.findUnique({
      where: { userId },
      select: {
        id: true,
        companyId: true,
        coverPhoto: true,
        avatar: true,
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Pro profile not found" }, { status: 404 });
    }

    // Clear the appropriate field
    if (type === "cover") {
      await prisma.tradesCompanyMember.update({
        where: { id: member.id },
        data: { coverPhoto: null },
      });
      if (member.companyId) {
        await prisma.tradesCompany.update({
          where: { id: member.companyId },
          data: { coverimage: null },
        });
      }
    } else if (type === "avatar") {
      await prisma.tradesCompanyMember.update({
        where: { id: member.id },
        data: { avatar: null, profilePhoto: null },
      });
    } else if (type === "logo" && member.companyId) {
      await prisma.tradesCompany.update({
        where: { id: member.companyId },
        data: { logo: null },
      });
    }

    return NextResponse.json({ success: true, type });
  } catch (error) {
    console.error("[COVER_PHOTO DELETE] Error:", error);
    return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 });
  }
}
