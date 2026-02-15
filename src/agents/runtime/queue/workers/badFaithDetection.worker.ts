import type { Job } from "bullmq";

import type { AgentInputBase } from "../../../base/types";
import { runAgent } from "../../agentRunner";
import { makeWorker } from "../bullmqClient";

makeWorker("agent:badFaithDetection", async (job: Job) => {
  const input = job.data as AgentInputBase;
  return runAgent("badFaithDetection", input);
});
