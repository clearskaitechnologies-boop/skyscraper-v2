import * as Sentry from "@sentry/nextjs";
import { randomUUID } from "crypto";
import { z } from "zod";

import prisma from "@/lib/prisma";

import { AgentExecutionClassification, formatAgentOutput } from "./rootPrompt";

// In-memory flag to disable agent_runs logging if table missing or unrecoverable
let agentRunsAvailable: boolean | null = null;
async function ensureAgentRunsTable() {
  if (agentRunsAvailable === false) return false;
  if (agentRunsAvailable === true) return true;
  try {
    // Lightweight existence check; will throw if relation missing
    await prisma.$queryRaw`SELECT 1 FROM agent_runs LIMIT 1`;
    agentRunsAvailable = true;
    return true;
  } catch (e: any) {
    if (/relation .*agent_runs.* does not exist/i.test(e.message)) {
      console.warn("[agent_runs] Table missing – disabling agent run persistence");
      agentRunsAvailable = false;
      return false;
    }
    // For other transient errors, allow retry next invocation
    console.warn("[agent_runs] Existence check error:", e.message);
    return false;
  }
}

export interface AgentContext {
  orgId?: string;
  userId?: string;
  traceId?: string;
}

export interface AgentMeta {
  name: string;
  version: string;
}

export abstract class BaseAgent<I, O> {
  constructor(public meta: AgentMeta) {}
  abstract inputSchema: z.ZodType<I, any, any>;
  abstract outputSchema: z.ZodType<O, any, any>;
  protected async before(_input: I, _ctx: AgentContext) {}
  protected async after(_input: I, _output: O, _ctx: AgentContext) {}
  protected abstract run(input: I, ctx: AgentContext): Promise<O>;

  async execute(
    rawInput: unknown,
    ctx: AgentContext = {}
  ): Promise<ReturnType<typeof formatAgentOutput<O>>> {
    const started = Date.now();
    const input = this.inputSchema.parse(rawInput);
    let output: O;
    try {
      await this.before(input, ctx);
      output = await this.run(input, ctx);
      output = this.outputSchema.parse(output);
      await this.after(input, output, ctx);
      const duration = Date.now() - started;
      // Persist success run
      try {
        if (await ensureAgentRunsTable()) {
          const id = randomUUID();
          const metadata = JSON.stringify({
            traceId: ctx.traceId,
            outputSummary: summarizeOutput(output),
          });
          await prisma.$executeRaw`INSERT INTO agent_runs (id, agent_name, version, org_id, user_id, claim_id, duration_ms, success, created_at, metadata)
             VALUES (${id}, ${this.meta.name}, ${this.meta.version}, ${ctx.orgId || null}, ${ctx.userId || null}, ${(input as any).claimId || null}, ${duration}, ${true}, ${new Date()}, ${metadata})`;
        }
      } catch (logErr: any) {
        if (/relation .*agent_runs.* does not exist/i.test(logErr.message)) {
          agentRunsAvailable = false; // hard disable further attempts
          console.warn("[agent_runs] Disabled logging (missing table).");
        }
      }
      console.log(`[agent:${this.meta.name}] ms=${duration}`);
      return formatAgentOutput<O>({
        agentName: this.meta.name,
        version: this.meta.version,
        classification: "success",
        response: output,
        startedAt: started,
        memoryHints: [
          "Successful execution",
          ctx.orgId ? `org:${ctx.orgId}` : null,
          this.meta.version.startsWith("1") ? "stable-version-line" : null,
        ],
      });
    } catch (e: any) {
      const err = e instanceof Error ? e : new Error(String(e));
      const classification = classifyError(err);
      const duration = Date.now() - started;
      console.error(`[agent:${this.meta.name}] error`, {
        message: err.message,
        classification,
        duration,
      });
      try {
        Sentry.addBreadcrumb({
          category: "agent",
          message: `${this.meta.name} failed`,
          data: { classification, duration, orgId: ctx.orgId, userId: ctx.userId },
          level: "error",
        });
        if (classification === "structural") {
          Sentry.captureException(err, {
            tags: {
              agent: this.meta.name,
              agent_version: this.meta.version,
              error_class: classification,
            },
            extra: { orgId: ctx.orgId, userId: ctx.userId },
          });
        }
      } catch {}
      // Persist failed run
      try {
        if (await ensureAgentRunsTable()) {
          const id = randomUUID();
          const metadata = JSON.stringify({ traceId: ctx.traceId });
          await prisma.$executeRaw`INSERT INTO agent_runs (id, agent_name, version, org_id, user_id, claim_id, duration_ms, success, error_type, error_msg, created_at, metadata)
             VALUES (${id}, ${this.meta.name}, ${this.meta.version}, ${ctx.orgId || null}, ${ctx.userId || null}, ${(input as any).claimId || null}, ${duration}, ${false}, ${classification}, ${err.message}, ${new Date()}, ${metadata})`;
        }
      } catch (logErr: any) {
        if (/relation .*agent_runs.* does not exist/i.test(logErr.message)) {
          agentRunsAvailable = false;
          console.warn("[agent_runs] Disabled logging (missing table).");
        }
      }
      const lowerMsg = err.message.toLowerCase();
      let mapped: AgentExecutionClassification;
      if (classification === "transient") {
        mapped = "transient_error";
      } else if (classification === "user") {
        mapped = "user_error";
      } else if (classification === "structural") {
        if (
          /relation .* does not exist|table .* does not exist|column .* does not exist|unknown argument|unknown field/.test(
            lowerMsg
          )
        ) {
          mapped = "schema_drift_detected";
        } else {
          mapped = "structural_error";
        }
      } else if (/rate limit|429|too many requests/.test(lowerMsg)) {
        mapped = "rate_limit_error";
      } else if (/quota|cost limit|insufficient_quota/.test(lowerMsg)) {
        mapped = "cost_violation";
      } else {
        mapped = "system_fault";
      }
      return formatAgentOutput<O>({
        agentName: this.meta.name,
        version: this.meta.version,
        classification: mapped,
        response: null as any,
        assumptions: ["Partial failure captured; returning structured error payload"],
        startedAt: started,
        memoryHints: [
          `error:${mapped}`,
          ctx.orgId ? `org:${ctx.orgId}` : null,
          err.message.length < 80 ? `msg:${err.message}` : null,
        ],
      });
    }
  }
}

export function classifyError(err: Error): "transient" | "structural" | "user" | "unknown" {
  const msg = err.message.toLowerCase();
  // Transient / network patterns
  if (
    /(timeout|econnreset|econnrefused|etimedout|rate limit|429|quota|insufficient_quota|aborted|connection (terminated|closed)|network error)/.test(
      msg
    )
  )
    return "transient";
  // Structural / data integrity patterns
  if (
    /validation|parse json|json parse|invalid json|schema|not found|p2021|p2002|unknown argument|table .* does not exist|foreign key|constraint|column .* does not exist|missing column|relation .* does not exist|unknown agent/.test(
      msg
    )
  )
    return "structural";
  if (/unauthorized|forbidden|permission|bad request|invalid input|missing required/i.test(msg))
    return "user";
  return "unknown";
}

// Unified JSON parsing helper for agent model outputs
export function parseJsonSafe(raw: string): any {
  let text = raw.trim();
  // Strip leading code fences
  if (text.startsWith("```")) {
    text = text
      .replace(/^```json/i, "")
      .replace(/^```/, "")
      .replace(/```$/, "")
      .trim();
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    // Attempt salvage by removing trailing fence fragments/newlines
    try {
      const cleaned = text.replace(/```+/g, "").trim();
      return JSON.parse(cleaned);
    } catch {
      throw new Error("Parse JSON failure");
    }
  }
}

function summarizeOutput(output: any): any {
  try {
    if (!output || typeof output !== "object") return output;
    const keys = Object.keys(output).slice(0, 10);
    const summary: Record<string, any> = {};
    for (const k of keys) {
      const v = (output as any)[k];
      if (v && typeof v === "object") {
        summary[k] = Array.isArray(v)
          ? `array(len=${v.length})`
          : `object(keys=${Object.keys(v).length})`;
      } else {
        summary[k] = v;
      }
    }
    return summary;
  } catch {
    return {};
  }
}
