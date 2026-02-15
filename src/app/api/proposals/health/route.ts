/**
 * PHASE 3.1: Health Check API
 * Tests OpenAI, Firebase Storage, and Puppeteer availability
 */

import { getApps } from "firebase-admin/app";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import puppeteer from "puppeteer";

import { firebaseAdmin } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

// Check Firebase Admin initialization
function initFirebase() {
  if (!getApps().length) {
    throw new Error("Firebase Admin not initialized. Check firebaseAdmin.ts configuration.");
  }
  // Firebase Admin is already initialized via centralized singleton
}

interface HealthStatus {
  openai: boolean;
  firebase: boolean;
  puppeteer: boolean;
  timestamp: string;
  errors?: {
    openai?: string;
    firebase?: string;
    puppeteer?: string;
  };
}

export async function GET() {
  const status: HealthStatus = {
    openai: false,
    firebase: false,
    puppeteer: false,
    timestamp: new Date().toISOString(),
    errors: {},
  };

  // Test OpenAI
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await Promise.race([
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "test" }],
        max_tokens: 5,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("OpenAI timeout")), 5000)
      ),
    ]);

    status.openai = !!response.choices[0]?.message;
  } catch (error) {
    status.errors!.openai = error instanceof Error ? error.message : "Unknown error";
  }

  // Test Firebase Storage
  try {
    initFirebase();
    const bucket = firebaseAdmin.storage().bucket();

    const testPrefix = "proposals/_health_check/";
    const [files] = await Promise.race([
      bucket.getFiles({ prefix: testPrefix, maxResults: 1 }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Firebase timeout")), 5000)
      ),
    ]);

    status.firebase = true; // Successfully listed files (even if empty)
  } catch (error) {
    status.errors!.firebase = error instanceof Error ? error.message : "Unknown error";
  }

  // Test Puppeteer
  try {
    const browser = await Promise.race([
      puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Puppeteer launch timeout")), 8000)
      ),
    ]);

    const page = await browser.newPage();
    await page.goto("about:blank");
    await browser.close();

    status.puppeteer = true;
  } catch (error) {
    status.errors!.puppeteer = error instanceof Error ? error.message : "Unknown error";
  }

  const allHealthy = status.openai && status.firebase && status.puppeteer;
  const httpStatus = allHealthy ? 200 : 503;

  return NextResponse.json(status, { status: httpStatus });
}
