"use server";
import type { AgentInputBase, AgentName } from "../base/types";
import {
  badFaithDetectionQueue,
  claimsAnalysisQueue,
  costGovernanceQueue,
  dataQualityQueue,
  healthMonitoringQueue,
  ingestionQueue,
  notificationQueue,
  proposalOptimizationQueue,
  rebuttalBuilderQueue,
  reportAssemblyQueue,
  securityComplianceQueue,
  tokenLedgerQueue,
} from "../runtime/queue/queues";

const queueMap: Record<AgentName, any> = {
  ingestion: ingestionQueue,
  claimsAnalysis: claimsAnalysisQueue,
  rebuttalBuilder: rebuttalBuilderQueue,
  badFaithDetection: badFaithDetectionQueue,
  reportAssembly: reportAssemblyQueue,
  proposalOptimization: proposalOptimizationQueue,
  tokenLedger: tokenLedgerQueue,
  dataQuality: dataQualityQueue,
  securityCompliance: securityComplianceQueue,
  healthMonitoring: healthMonitoringQueue,
  notification: notificationQueue,
  costGovernance: costGovernanceQueue,
};

export async function enqueueAgentJob(name: AgentName, input: AgentInputBase) {
  const queue = queueMap[name];
  if (!queue) throw new Error(`No queue configured for agent ${name}`);
  return queue.add(name, input, { removeOnComplete: true, removeOnFail: false });
}
