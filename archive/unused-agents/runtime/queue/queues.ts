import { makeQueue } from "./bullmqClient";

export const ingestionQueue = makeQueue("agent:ingestion");
export const claimsAnalysisQueue = makeQueue("agent:claimsAnalysis");
export const rebuttalBuilderQueue = makeQueue("agent:rebuttalBuilder");
export const badFaithDetectionQueue = makeQueue("agent:badFaithDetection");
export const reportAssemblyQueue = makeQueue("agent:reportAssembly");
export const proposalOptimizationQueue = makeQueue("agent:proposalOptimization");
export const tokenLedgerQueue = makeQueue("agent:tokenLedger");
export const dataQualityQueue = makeQueue("agent:dataQuality");
export const securityComplianceQueue = makeQueue("agent:securityCompliance");
export const healthMonitoringQueue = makeQueue("agent:healthMonitoring");
export const notificationQueue = makeQueue("agent:notification");
export const costGovernanceQueue = makeQueue("agent:costGovernance");
