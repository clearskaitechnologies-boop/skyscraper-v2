export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";

import { requireUser } from "@/lib/authz";
import { guardedExternalJson } from "@/lib/net/guardedFetch";

/**
 * Body:
 * {
 *   stops: [{ id, name, lat, lng, serviceMins?: number }],
 *   start?: { lat, lng },
 *   end?: { lat, lng },
 *   roundtrip?: boolean
 * }
 * Returns: { distanceKm, durationMins, order: [stopId...], legs: [...], mapUrl }
 */
export async function POST(req: Request) {
  const { userId } = await requireUser();
  const body = await req.json();
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return NextResponse.json({ error: "Missing MAPBOX token" }, { status: 500 });

  const stops = (body?.stops ?? []).filter(
    (s: any) => typeof s.lat === "number" && typeof s.lng === "number"
  );
  if (stops.length < 2)
    return NextResponse.json({ error: "Need at least 2 stops" }, { status: 400 });

  // Build coordinates string for Mapbox Optimization API (driving)
  // https://docs.mapbox.com/api/navigation/optimization/
  const coords = stops.map((s: any) => `${s.lng},${s.lat}`).join(";");

  // Source/destination options
  const roundtrip = body?.roundtrip !== false; // default true
  const params = new URLSearchParams({
    access_token: token,
    geometries: "polyline6",
    overview: "full",
    roundtrip: String(roundtrip),
  }).toString();

  const url = `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coords}?${params}`;
  const result = await guardedExternalJson<any>(url);
  if (result.skipped) {
    return NextResponse.json({ ok: false, skipped: true, reason: 'build-phase-skip' }, { status: 200 });
  }
  if (!result.ok || !result.data) {
    return NextResponse.json({ error: result.error || "Optimization failed" }, { status: 502 });
  }
  const json = result.data;
  const trip = json?.trips?.[0];
  if (!trip) return NextResponse.json({ error: "No trip found" }, { status: 404 });

  const distanceKm = (trip.distance ?? 0) / 1000;
  const durationMins = Math.round((trip.duration ?? 0) / 60);
  const orderIdxs = (trip.waypoint_order ?? []) as number[]; // indices into input stops

  const order = orderIdxs.map((i) => stops[i]?.id).filter(Boolean);

  // Simple static map with the optimized path center point (optional)
  const center = trip?.geometry?.coordinates?.[0] ?? [stops[0].lng, stops[0].lat];
  const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${center[0]},${center[1]},11,0/800x500?access_token=${token}`;

  return NextResponse.json({
    distanceKm,
    durationMins,
    order,
    legs: trip.legs ?? [],
    mapUrl,
  });
}
