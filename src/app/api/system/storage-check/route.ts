import { NextRequest, NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer();
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET_TEMPLATES || "templates";

    // Test upload
    const testContent = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
    const testPath = `storage-check/${Date.now()}.txt`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(testPath, testContent, {
        upsert: true,
        contentType: "text/plain",
      });

    if (uploadError) {
      return NextResponse.json(
        {
          ok: false,
          error: uploadError.message,
          bucket: bucketName,
        },
        { status: 500 }
      );
    }

    // Clean up test file
    await supabase.storage.from(bucketName).remove([testPath]);

    return NextResponse.json({
      ok: true,
      bucket: bucketName,
      message: "Storage write test successful",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
