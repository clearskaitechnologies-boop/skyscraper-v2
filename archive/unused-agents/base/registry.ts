import { agentConfigs } from "../config";
import type { AgentConfig, AgentName } from "./types";

export function getAgentConfig(name: AgentName): AgentConfig {
  const cfg = agentConfigs[name];
  if (!cfg) throw new Error(`Unknown agent: ${name}`);
  return cfg;
}
