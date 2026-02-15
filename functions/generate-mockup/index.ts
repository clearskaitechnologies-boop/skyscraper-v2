#!/usr/bin/env node
// functions/generate-mockup/index.ts
// Minimal express-based scaffold for a generate-mockup function using sharp
// Loads environment from .env when available
import "dotenv/config";

import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import fetch from "node-fetch";
import { Pool } from "pg";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

// Use the project's S3 helper (supports MinIO)
import { getSignedGetUrl,uploadBuffer } from "../../src/lib/s3";

// Helpful env checks for local dev
const REQUIRED_ENVS = ["APP_URL", "STORAGE_BUCKET"];
for (const k of REQUIRED_ENVS) {
  if (!process.env[k]) {
     
    console.warn(
      `[generate-mockup] warning: missing env ${k} — set it in .env or your shell for local dev`
    );
  }
}

const app = express();
app.use(bodyParser.json({ limit: "10mb" }));

const PORT = process.env.PORT ? Number(process.env.PORT) : 8081;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function uploadToStorage(buffer: Buffer, key: string) {
  // upload to S3/MinIO via shared helper and return a signed URL
  const contentType = "image/png";
  await uploadBuffer(buffer, key, contentType);
  const url = await getSignedGetUrl(key, Number(process.env.S3_PRESIGN_EXPIRES || 3600));
  return url;
}

app.post("/generate", async (req: Request, res: Response) => {
  const { template, tokens, size = { w: 1200, h: 900 }, org_id, background } = req.body || {};
  const rid = uuidv4();
  if (!template) return res.status(400).json({ error: "template required", request_id: rid });

  try {
    const width = Number(size.w || 1200);
    const height = Number(size.h || 900);

    // Create a simple background (white) and overlay text/logo
    const base = sharp({ create: { width, height, channels: 4, background: "#ffffff" } }).png();

    // Compose SVG overlay of tokens (simple)
    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><style>text{font-family:Inter,Arial,sans-serif;fill:#0A1A2F}</style><text x="48" y="96" font-size="36">${tokens?.title ?? "Report Preview"}</text><text x="48" y="150" font-size="18">${tokens?.subtitle ?? ""}</text></svg>`;

    const overlay = Buffer.from(svg);
    const composed = await base.composite([{ input: overlay, top: 0, left: 0 }]).toBuffer();

    const key = `functions/generate-mockup/${org_id || "org"}-${Date.now()}.png`;
    const url = await uploadToStorage(Buffer.from(composed), key);

    // record usage_event
    if (process.env.DATABASE_URL) {
      try {
        const client = await pool.connect();
        await client.query(
          "INSERT INTO usage_events (org_id, event_type, metadata, amount_cents, created_at) VALUES ($1,$2,$3,$4,now())",
          [
            org_id,
            "mockup_generation",
            { template, request_id: rid },
            Number(process.env.MOCKUP_COST_CENTS || 0),
          ]
        );
        client.release();
      } catch (e: unknown) {
         
        console.error("usage_event insert failed", (e as Error)?.message ?? String(e));
      }
    }

    return res.json({ url, key, request_id: rid });
  } catch (err: any) {
     
    console.error("generate-mockup error", err);
    return res.status(500).json({ error: err?.message || "error", request_id: rid });
  }
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
     
    console.log(`generate-mockup function listening on ${PORT}`);
  });
}

export default app;
