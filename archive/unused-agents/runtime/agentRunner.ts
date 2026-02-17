"use server";

import { getAgentConfig } from "../base/registry";
import type { AgentInputBase, AgentName,AgentResult } from "../base/types";

// Placeholder LLM call – integrate with your OpenAI / Anthropic client.
async function callLLM(systemPrompt: string, userPayload: string): Promise<string> {
  // TODO: wire to actual client; include model selection & cost governance outside.
  throw new Error("callLLM not implemented: integrate with your LLM client");
}

function buildUserPayload(input: AgentInputBase): string {
  return JSON.stringify(
    {
      SYSTEM_INSTRUCTIONS: "Follow system + agent prompt strictly.",
      USER_MESSAGE: input.userMessage ?? null,
      ORG_CONTEXT: input.orgContext ?? null,
      CLAIM_CONTEXT: input.claimContext ?? null,
      LEAD_CONTEXT: input.leadContext ?? null,
      DOC_CONTEXT: input.docContext ?? null,
      AGENT_MEMORY: input.agentMemory ?? null,
      OUTPUT_INSTRUCTIONS: input.outputInstructions ?? null,
      REQUEST_ID: input.requestId ?? null,
    },
    null,
    2
  );
}

function safeParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function extractMemoryUpdate(text: string): string[] | null {
  // Optionally parse Suggested Memory Update section.
  return null;
}

export async function runAgent(
  name: AgentName,
  input: AgentInputBase
): Promise<AgentResult> {
  const config = getAgentConfig(name);

  if (input.safeOrgContext.status !== "ok") {
    return {
      agent: name,
      ok: false,
      errorClass: "org_context_error",
      errorMessage: "Invalid or missing organization context.",
      rawOutput: "",
      structuredOutput: undefined,
      assumptions: ["safeOrgContext.status was not 'ok'"],
      suggestedMemoryUpdate: ["None"],
    };
  }

  const systemPrompt = config.prompt;
  const userPayload = buildUserPayload(input);

  let responseText: string;
  try {
    responseText = await callLLM(systemPrompt, userPayload);
  } catch (err: any) {
    return {
      agent: name,
      ok: false,
      errorClass: "system_fault",
      errorMessage: err?.message || "LLM call failed",
      rawOutput: "",
      structuredOutput: undefined,
      assumptions: [],
      suggestedMemoryUpdate: ["None"],
    };
  }

  const structuredOutput =
    input.outputInstructions?.format === "json" ? safeParseJson(responseText) : undefined;
  const suggestedMemoryUpdate = extractMemoryUpdate(responseText);

  return {
    agent: name,
    ok: true,
    errorClass: "success",
    rawOutput: responseText,
    structuredOutput,
    assumptions: [],
    suggestedMemoryUpdate,
  };
}
