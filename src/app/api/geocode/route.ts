export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";

import { requireUser } from "@/lib/authz";
import { db } from "@/lib/db";
import { guardedExternalJson } from "@/lib/net/guardedFetch";

export async function POST(req: Request) {
  const { userId } = await requireUser();
  const { kind, id, address } = (await req.json()) as {
    kind: "lead" | "job";
    id: string;
    address: string;
  };
  if (!kind || !id || !address)
    return NextResponse.json({ error: "Missing kind/id/address" }, { status: 400 });

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return NextResponse.json({ error: "Missing MAPBOX token" }, { status: 500 });

  const q = encodeURIComponent(address);
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json?access_token=${token}&limit=1`;
  const result = await guardedExternalJson<any>(url);
  if (result.skipped) {
    return NextResponse.json({ ok: false, skipped: true, reason: 'build-phase-skip' }, { status: 200 });
  }
  if (!result.ok || !result.data) {
    return NextResponse.json({ error: result.error || "Geocode failed" }, { status: 502 });
  }
  const json = result.data;
  const feat = json?.features?.[0];
  if (!feat) return NextResponse.json({ error: "No result" }, { status: 404 });

  const [lng, lat] = feat.center;
  const w = 800,
    h = 500,
    z = 14;
  const base = "https://api.mapbox.com/styles/v1/mapbox/streets-v12/static";
  const pin = `pin-l+FF0000(${lng},${lat})`;
  const snap = `${base}/${pin}/${lng},${lat},${z}/${w}x${h}?access_token=${token}`;

  if (kind === "lead") {
    await db.query(`update leads set latitude=$1, longitude=$2, map_snapshot_url=$3 where id=$4`, [
      lat,
      lng,
      snap,
      id,
    ]);
  } else {
    await db.query(`update jobs set latitude=$1, longitude=$2, map_snapshot_url=$3 where id=$4`, [
      lat,
      lng,
      snap,
      id,
    ]);
  }

  return NextResponse.json({ ok: true, lat, lng, mapUrl: snap });
}
