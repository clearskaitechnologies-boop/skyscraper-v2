import type { AgentInputBase } from "../../../base/types";
import { runAgent } from "../../agentRunner";
import { makeWorker } from "../bullmqClient";

makeWorker("agent:claimsAnalysis", async (job: any) => {
  const input = job.data as AgentInputBase;
  return runAgent("claimsAnalysis", input);
});
