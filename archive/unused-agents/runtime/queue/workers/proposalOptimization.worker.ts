import type { AgentInputBase } from "../../../base/types";
import { runAgent } from "../../agentRunner";
import { makeWorker } from "../bullmqClient";

makeWorker("agent:proposalOptimization", async (job: any) => {
  const input = job.data as AgentInputBase;
  return runAgent("proposalOptimization", input);
});
