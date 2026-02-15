import QRCode from "qrcode";

export async function GET(req: Request) {
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