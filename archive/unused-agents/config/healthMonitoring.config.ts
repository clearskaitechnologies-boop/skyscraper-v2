import type { AgentConfig } from "../base/types";
import { HEALTH_MONITORING_AGENT_PROMPT } from "../prompts/healthMonitoring.prompt";

export const healthMonitoringAgentConfig: AgentConfig = {
  name: "healthMonitoring",
  description: "Monitors route latency, queue lag, error rates, system readiness.",
  queueName: "agent:healthMonitoring",
  maxAttempts: 3,
  backoffMs: 5000,
  allowSync: false,
  prompt: HEALTH_MONITORING_AGENT_PROMPT,
};
