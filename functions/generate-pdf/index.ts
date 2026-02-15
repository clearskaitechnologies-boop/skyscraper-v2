#!/usr/bin/env node
// functions/generate-pdf/index.ts
// Minimal express-based scaffold for a generate-pdf function.
// NOTE: Replace Supabase client calls with your platform's storage client & secure keys.
import "dotenv/config";

import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import fetch from "node-fetch";
import { Pool } from "pg";
import playwright from "playwright";
import { v4 as uuidv4 } from "uuid";

// Use the project's S3 helper (supports MinIO)
import { getSignedGetUrl,uploadBuffer } from "../../src/lib/s3";

// Helpful env checks for local dev
const REQUIRED_ENVS = ["APP_URL", "STORAGE_BUCKET"];
for (const k of REQUIRED_ENVS) {
  if (!process.env[k]) {
     
    console.warn(
      `[generate-pdf] warning: missing env ${k} — set it in .env or your shell for local dev`
    );
  }
}

const app = express();
app.use(bodyParser.json({ limit: "10mb" }));

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;

// Simple Postgres pool (used to insert usage_event). Use DATABASE_URL env.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function uploadToStorage(buffer: Buffer, key: string) {
  // upload to S3/MinIO via shared helper and return a signed URL
  const contentType = "application/pdf";
  await uploadBuffer(buffer, key, contentType);
  const url = await getSignedGetUrl(key, Number(process.env.S3_PRESIGN_EXPIRES || 3600));
  return url;
}

function hydrateTemplate(html: string, tokens: Record<string, any>) {
  let out = html;
  for (const k of Object.keys(tokens || {})) {
    const pattern = new RegExp(`{{\\s*${k}\\s*}}`, "g");
    out = out.replace(pattern, String(tokens[k] ?? ""));
  }
  return out;
}

app.post("/generate", async (req: Request, res: Response) => {
  const { template, tokens, org_id, request_id } = req.body || {};
  const rid = request_id || uuidv4();
  if (!template) return res.status(400).json({ error: "template required", request_id: rid });

  try {
    // Load template file from functions/generate-pdf/templates/{template}.html
    const fs = await import("fs/promises");
    const tplPath = new URL(`./templates/${template}.html`, import.meta.url).pathname;
    const html = await fs.readFile(tplPath, "utf-8").catch(() => null);
    if (!html) return res.status(404).json({ error: "template not found", request_id: rid });

    const rendered = hydrateTemplate(html, tokens || {});

    // Launch Playwright and render to PDF
    const browser = await playwright.chromium.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.setContent(rendered, { waitUntil: "networkidle" });
    // Wait briefly for images/fonts
    await page.waitForTimeout(250);
    const pdfBuffer = await page.pdf({ format: "letter", printBackground: true });
    await browser.close();

    // upload
    const key = `functions/generate-pdf/${org_id || "org"}-${Date.now()}.pdf`;
    const url = await uploadToStorage(Buffer.from(pdfBuffer), key);

    // record usage_event
    if (process.env.DATABASE_URL) {
      try {
        const client = await pool.connect();
        await client.query(
          "INSERT INTO usage_events (org_id, event_type, metadata, amount_cents, created_at) VALUES ($1,$2,$3,$4,now())",
          [
            org_id,
            "pdf_generation",
            { template, request_id: rid },
            Number(process.env.PDF_COST_CENTS || 0),
          ]
        );
        client.release();
      } catch (e: unknown) {
        // log but don't fail
         
        console.error("usage_event insert failed", (e as Error)?.message ?? String(e));
      }
    }

    return res.json({ url, key, request_id: rid });
  } catch (err: any) {
     
    console.error("generate-pdf error", err);
    return res.status(500).json({ error: err.message || "render_failed", request_id: rid });
  }
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
     
    console.log(`generate-pdf function listening on ${PORT}`);
  });
}

export default app;
