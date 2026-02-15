// types/correlation.ts

export interface CorrelatedDamageFinding {
  damageType: string;
  weatherCause: string;
  likelihood: number;
  evidence: string[];
  explanation: string;
}

export interface CorrelationAnalysis {
  summary: string;
  hailCorrelation: {
    likelihood: number;
    explanation: string;
    evidence: string[];
  };
  windCorrelation: {
    likelihood: number;
    explanation: string;
    evidence: string[];
  };
  rainLeakCorrelation: {
    likelihood: number;
    explanation: string;
    evidence: string[];
  };
  freezeThawCorrelation: {
    likelihood: number;
    explanation: string;
    evidence: string[];
  };
  timelineMatch: {
    score: number;
    explanation: string;
  };
  finalCausationConclusion: string;
  recommendations: string[];
}

export interface CorrelationRequest {
  claimId: string;
  weather?: any;
  damage?: any;
  specs?: any;
  codes?: any;
}

export interface CorrelationReport {
  id: string;
  claimId: string;
  orgId: string;
  createdById: string;
  payload: CorrelationAnalysis;
  createdAt: Date;
  updatedAt: Date;
}
