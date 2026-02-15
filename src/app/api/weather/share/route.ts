import { auth } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reportId } = await req.json();

    if (!reportId) {
      return NextResponse.json({ error: "reportId required" }, { status: 400 });
    }

    const token = randomUUID();

    // Update the weather report with share token
    // Note: You may need to add shareToken field to WeatherReport model
    await prisma.weather_reports.update({
      where: { id: reportId },
      data: { 
        // shareToken: token, // Uncomment when field is added to schema
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const shareUrl = `${baseUrl}/share/weather/${token}`;

    return NextResponse.json({
      success: true,
      url: shareUrl,
      token,
    });
  } catch (err: any) {
    console.error("WEATHER SHARE ERROR:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create share link" },
      { status: 500 }
    );
  }
}
