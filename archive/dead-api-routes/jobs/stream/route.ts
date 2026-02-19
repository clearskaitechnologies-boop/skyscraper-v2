/**
 * Jobs Stream API (Server-Sent Events)
 *
 * GET /api/jobs/stream
 * Streams real-time job status updates using Server-Sent Events.
 * Polls job_events table every 2 seconds and sends snapshot to client.
 *
 * Response (SSE):
 * event: snapshot
 * data: {"rows":[...]}
 *
 * Client usage:
 * const eventSource = new EventSource('/api/jobs/stream');
 * eventSource.addEventListener('snapshot', (event) => {
 *   const { rows } = JSON.parse(event.data);
 *   // Update UI with rows
 * });
 */

// IMPORTANT: Use Node.js runtime for pg compatibility (not Edge)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

import { requireApiAuth } from "@/lib/auth/apiAuth";
import { pgPool } from "@/lib/db";

export async function GET(req: Request) {
  const authResult = await requireApiAuth();
  if (authResult instanceof NextResponse) return authResult;

  const { orgId } = authResult;
  if (!orgId) {
    return NextResponse.json({ error: "Organization required" }, { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      logger.debug("SSE client connected");

      const send = (event: string, data: any) => {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Poll job_events every 2 seconds
      const intervalId = setInterval(async () => {
        // Get a client from the pool for each query
        const client = await pgPool.connect();

        try {
          const result = await client.query(`
            SELECT 
              id,
              job_name,
              job_id,
              status,
              message,
              payload,
              result,
              attempts,
              created_at
            FROM job_events
            ORDER BY created_at DESC
            LIMIT 100
          `);

          send("snapshot", { rows: result.rows });
        } catch (error) {
          logger.error("[SSE ERROR] polling job_events:", error);
          send("error", { description: error.message });
        } finally {
          // Release the client back to pool
          client.release();
        }
      }, 2000);

      // Clean up on disconnect
      req.signal.addEventListener("abort", () => {
        logger.debug("SSE client disconnected");
        clearInterval(intervalId);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
