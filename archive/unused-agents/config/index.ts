import type { AgentConfig, AgentName } from "../base/types";
import { badFaithDetectionAgentConfig } from "./badFaithDetection.config";
import { claimsAnalysisAgentConfig } from "./claimsAnalysis.config";
import { costGovernanceAgentConfig } from "./costGovernance.config";
import { dataQualityAgentConfig } from "./dataQuality.config";
import { healthMonitoringAgentConfig } from "./healthMonitoring.config";
import { ingestionAgentConfig } from "./ingestion.config";
import { notificationAgentConfig } from "./notification.config";
import { proposalOptimizationAgentConfig } from "./proposalOptimization.config";
import { rebuttalBuilderAgentConfig } from "./rebuttalBuilder.config";
import { reportAssemblyAgentConfig } from "./reportAssembly.config";
import { securityComplianceAgentConfig } from "./securityCompliance.config";
import { tokenLedgerAgentConfig } from "./tokenLedger.config";

export const agentConfigs: Record<AgentName, AgentConfig> = {
  ingestion: ingestionAgentConfig,
  claimsAnalysis: claimsAnalysisAgentConfig,
  rebuttalBuilder: rebuttalBuilderAgentConfig,
  badFaithDetection: badFaithDetectionAgentConfig,
  reportAssembly: reportAssemblyAgentConfig,
  proposalOptimization: proposalOptimizationAgentConfig,
  tokenLedger: tokenLedgerAgentConfig,
  dataQuality: dataQualityAgentConfig,
  securityCompliance: securityComplianceAgentConfig,
  healthMonitoring: healthMonitoringAgentConfig,
  notification: notificationAgentConfig,
  costGovernance: costGovernanceAgentConfig,
};
