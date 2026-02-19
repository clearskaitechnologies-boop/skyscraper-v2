import { checkRateLimit } from "@/lib/rate-limit";
import QRCode from "qrcode";

export async function GET(req: Request) {
  // Rate limit: prevent DoS via rapid QR generation (CPU-bound)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const rl = await checkRateLimit(`qr:${ip}`, "API");
  if (!rl.success) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("portal");
    if (!token) return new Response("Missing token", { status: 400 });
    const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const url = `${base}/portal/${token}`;
    const qrDataUrl = await QRCode.toDataURL(url);
    return Response.json({ qr: qrDataUrl, url });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
