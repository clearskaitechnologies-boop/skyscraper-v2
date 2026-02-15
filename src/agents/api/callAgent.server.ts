"use server";
import type { AgentInputBase, AgentName } from "../base/types";
import { runAgent } from "../runtime/agentRunner";

export async function callAgentDirect(name: AgentName, input: AgentInputBase) {
  return runAgent(name, input);
}
