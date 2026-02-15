/**
 * Test endpoint to check storage configuration
 * GET /api/upload/test
 */

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const results: any = {
      userId,
      supabase: {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        urlPrefix: supabaseUrl?.substring(0, 30) || null,
      },
      firebase: {
        hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        hasStorageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      },
    };

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // List buckets
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

      if (bucketsError) {
        results.supabase.bucketError = bucketsError.message;
      } else {
        results.supabase.buckets = buckets?.map((b) => ({
          name: b.name,
          public: b.public,
          createdAt: b.created_at,
        }));
      }

      // Try to list files in profile-photos bucket
      const { data: files, error: filesError } = await supabase.storage
        .from("profile-photos")
        .list("avatars", {
          limit: 5,
        });

      if (filesError) {
        results.supabase.profilePhotosError = filesError.message;
      } else {
        results.supabase.profilePhotosFiles = files?.length || 0;
      }
    }

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
