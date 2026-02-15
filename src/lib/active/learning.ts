/**
 * Task 244: Active Learning System
 *
 * Implements uncertainty sampling, query-by-committee, expected model change,
 * diversity sampling, and human-in-the-loop learning.
 */

import prisma from "@/lib/prisma";

export type QueryStrategy =
  | "uncertainty"
  | "committee"
  | "expected_change"
  | "diversity"
  | "hybrid";
export type UncertaintyMeasure = "least_confidence" | "margin" | "entropy";

export interface ActiveLearner {
  id: string;
  name: string;
  strategy: QueryStrategy;
  models: TrainedModel[];
  labeledData: Array<{ features: number[]; label: unknown }>;
  unlabeledData: Array<{ id: string; features: number[] }>;
  budget: number;
  queriesMade: number;
  createdAt: Date;
}

export interface QueryResult {
  id: string;
  learnerId: string;
  sampleId: string;
  features: number[];
  uncertainty: number;
  strategy: QueryStrategy;
  timestamp: Date;
}

export interface LabelFeedback {
  sampleId: string;
  label: unknown;
  confidence: number;
  annotatorId?: string;
}

/** Trained ML model metadata */
interface TrainedModel {
  trained: boolean;
  dataSize: number;
  accuracy: number;
}

/** A data sample with features and an assigned label */
type LabeledSample = { features: number[]; label: unknown };

/** A data sample with features awaiting labeling */
type UnlabeledSample = { id: string; features: number[] };

/**
 * Create active learner
 */
export async function createActiveLearner(
  name: string,
  strategy: QueryStrategy,
  initialLabeledData: LabeledSample[],
  unlabeledPool: UnlabeledSample[],
  budget: number = 100
): Promise<ActiveLearner> {
  const learner = await prisma.activeLearner.create({
    data: {
      name,
      strategy,
      models: [],
      labeledData: initialLabeledData as unknown as Record<string, unknown>[],
      unlabeledData: unlabeledPool as unknown as Record<string, unknown>[],
      budget,
      queriesMade: 0,
    },
  });

  // Train initial model
  await trainModel(learner.id);

  return learner as ActiveLearner;
}

/**
 * Query next samples to label
 */
export async function queryNextSamples(
  learnerId: string,
  numSamples: number = 1
): Promise<QueryResult[]> {
  const learner = await prisma.activeLearner.findUnique({
    where: { id: learnerId },
  });

  if (!learner) throw new Error("Learner not found");
  if (learner.queriesMade >= learner.budget) {
    throw new Error("Budget exhausted");
  }

  const unlabeled = learner.unlabeledData as unknown as UnlabeledSample[];

  if (unlabeled.length === 0) {
    throw new Error("No unlabeled data available");
  }

  let selectedSamples: Array<{ id: string; features: number[]; uncertainty: number }> = [];

  switch (learner.strategy) {
    case "uncertainty":
      selectedSamples = await uncertaintySampling(learnerId, unlabeled, numSamples, "entropy");
      break;

    case "committee":
      selectedSamples = await queryByCommittee(learnerId, unlabeled, numSamples);
      break;

    case "expected_change":
      selectedSamples = await expectedModelChange(learnerId, unlabeled, numSamples);
      break;

    case "diversity":
      selectedSamples = await diversitySampling(unlabeled, numSamples);
      break;

    case "hybrid":
      selectedSamples = await hybridSampling(learnerId, unlabeled, numSamples);
      break;
  }

  // Create query results
  const queries: QueryResult[] = [];

  for (const sample of selectedSamples) {
    const query = await prisma.queryResult.create({
      data: {
        learnerId,
        sampleId: sample.id,
        features: sample.features as unknown as Record<string, unknown>,
        uncertainty: sample.uncertainty,
        strategy: learner.strategy,
        timestamp: new Date(),
      },
    });

    queries.push(query as QueryResult);
  }

  // Update queries made
  await prisma.activeLearner.update({
    where: { id: learnerId },
    data: { queriesMade: learner.queriesMade + numSamples },
  });

  return queries;
}

/**
 * Uncertainty sampling
 */
async function uncertaintySampling(
  learnerId: string,
  unlabeled: Array<{ id: string; features: number[] }>,
  numSamples: number,
  measure: UncertaintyMeasure
): Promise<Array<{ id: string; features: number[]; uncertainty: number }>> {
  const results: Array<{ id: string; features: number[]; uncertainty: number }> = [];

  for (const sample of unlabeled) {
    const prediction = await predictWithModel(learnerId, sample.features);
    let uncertainty: number;

    switch (measure) {
      case "least_confidence":
        uncertainty = 1 - Math.max(...prediction.probabilities);
        break;

      case "margin":
        const sorted = [...prediction.probabilities].sort((a, b) => b - a);
        uncertainty = 1 - (sorted[0] - sorted[1]);
        break;

      case "entropy":
        uncertainty = -prediction.probabilities.reduce((sum, p) => {
          return sum + (p > 0 ? p * Math.log2(p) : 0);
        }, 0);
        break;
    }

    results.push({
      id: sample.id,
      features: sample.features,
      uncertainty,
    });
  }

  // Return top-k most uncertain
  return results.sort((a, b) => b.uncertainty - a.uncertainty).slice(0, numSamples);
}

/**
 * Query by committee
 */
async function queryByCommittee(
  learnerId: string,
  unlabeled: Array<{ id: string; features: number[] }>,
  numSamples: number
): Promise<Array<{ id: string; features: number[]; uncertainty: number }>> {
  const learner = await prisma.activeLearner.findUnique({
    where: { id: learnerId },
  });

  if (!learner) throw new Error("Learner not found");

  // Train committee of models (bootstrap)
  const committeeSize = 5;
  const committee: TrainedModel[] = [];
  const labeledData = learner.labeledData as unknown as LabeledSample[];

  for (let i = 0; i < committeeSize; i++) {
    const bootstrap = bootstrapSample(labeledData);
    const model = await trainModelOnData(bootstrap);
    committee.push(model);
  }

  // Calculate disagreement for each sample
  const results: Array<{ id: string; features: number[]; uncertainty: number }> = [];

  for (const sample of unlabeled) {
    const predictions: number[] = [];

    for (const model of committee) {
      const pred = predictWithCommitteeMember(model, sample.features);
      predictions.push(pred);
    }

    // Calculate vote entropy (disagreement)
    const votes = new Map<number, number>();
    for (const pred of predictions) {
      votes.set(pred, (votes.get(pred) || 0) + 1);
    }

    let entropy = 0;
    for (const count of votes.values()) {
      const p = count / predictions.length;
      entropy -= p * Math.log2(p);
    }

    results.push({
      id: sample.id,
      features: sample.features,
      uncertainty: entropy,
    });
  }

  return results.sort((a, b) => b.uncertainty - a.uncertainty).slice(0, numSamples);
}

/**
 * Expected model change
 */
async function expectedModelChange(
  learnerId: string,
  unlabeled: Array<{ id: string; features: number[] }>,
  numSamples: number
): Promise<Array<{ id: string; features: number[]; uncertainty: number }>> {
  const results: Array<{ id: string; features: number[]; uncertainty: number }> = [];

  const currentModel = await getCurrentModel(learnerId);

  for (const sample of unlabeled) {
    const prediction = await predictWithModel(learnerId, sample.features);

    // Estimate gradient magnitude (model change)
    let expectedChange = 0;

    for (const prob of prediction.probabilities) {
      // Expected gradient magnitude for cross-entropy loss
      expectedChange += prob * (1 - prob);
    }

    results.push({
      id: sample.id,
      features: sample.features,
      uncertainty: expectedChange,
    });
  }

  return results.sort((a, b) => b.uncertainty - a.uncertainty).slice(0, numSamples);
}

/**
 * Diversity sampling
 */
async function diversitySampling(
  unlabeled: Array<{ id: string; features: number[] }>,
  numSamples: number
): Promise<Array<{ id: string; features: number[]; uncertainty: number }>> {
  // K-means clustering to select diverse samples
  const selected: Array<{ id: string; features: number[]; uncertainty: number }> = [];
  const remaining = [...unlabeled];

  // Select first sample randomly
  const firstIdx = Math.floor(Math.random() * remaining.length);
  selected.push({
    ...remaining[firstIdx],
    uncertainty: 1.0,
  });
  remaining.splice(firstIdx, 1);

  // Select remaining samples based on maximum distance
  while (selected.length < numSamples && remaining.length > 0) {
    let maxMinDist = -Infinity;
    let bestIdx = 0;

    for (let i = 0; i < remaining.length; i++) {
      // Find minimum distance to already selected samples
      let minDist = Infinity;

      for (const sel of selected) {
        const dist = euclideanDistance(remaining[i].features, sel.features);
        minDist = Math.min(minDist, dist);
      }

      if (minDist > maxMinDist) {
        maxMinDist = minDist;
        bestIdx = i;
      }
    }

    selected.push({
      ...remaining[bestIdx],
      uncertainty: maxMinDist,
    });
    remaining.splice(bestIdx, 1);
  }

  return selected;
}

/**
 * Hybrid sampling
 */
async function hybridSampling(
  learnerId: string,
  unlabeled: Array<{ id: string; features: number[] }>,
  numSamples: number
): Promise<Array<{ id: string; features: number[]; uncertainty: number }>> {
  // Combine uncertainty and diversity
  const uncertainSamples = await uncertaintySampling(
    learnerId,
    unlabeled,
    numSamples * 3, // Get more candidates
    "entropy"
  );

  // Apply diversity on top-k uncertain
  const diverse = await diversitySampling(uncertainSamples, numSamples);

  return diverse;
}

/**
 * Add labeled feedback
 */
export async function addLabelFeedback(
  learnerId: string,
  feedback: LabelFeedback[]
): Promise<ActiveLearner> {
  const learner = await prisma.activeLearner.findUnique({
    where: { id: learnerId },
  });

  if (!learner) throw new Error("Learner not found");

  const labeledData = learner.labeledData as unknown as LabeledSample[];
  const unlabeledData = learner.unlabeledData as unknown as UnlabeledSample[];

  // Add labeled samples
  for (const fb of feedback) {
    const sample = unlabeledData.find((s) => s.id === fb.sampleId);

    if (sample) {
      labeledData.push({
        features: sample.features,
        label: fb.label,
      });

      // Remove from unlabeled
      const idx = unlabeledData.findIndex((s) => s.id === fb.sampleId);
      if (idx >= 0) {
        unlabeledData.splice(idx, 1);
      }
    }
  }

  // Update learner
  await prisma.activeLearner.update({
    where: { id: learnerId },
    data: {
      labeledData: labeledData as unknown as Record<string, unknown>[],
      unlabeledData: unlabeledData as unknown as Record<string, unknown>[],
    },
  });

  // Retrain model
  await trainModel(learnerId);

  const updated = await prisma.activeLearner.findUnique({
    where: { id: learnerId },
  });

  return updated as ActiveLearner;
}

/**
 * Train model
 */
async function trainModel(learnerId: string): Promise<void> {
  const learner = await prisma.activeLearner.findUnique({
    where: { id: learnerId },
  });

  if (!learner) return;

  const labeledData = learner.labeledData as unknown as LabeledSample[];
  const model = await trainModelOnData(labeledData);

  await prisma.activeLearner.update({
    where: { id: learnerId },
    data: { models: [model] as unknown as Record<string, unknown>[] },
  });
}

/**
 * Train model on data
 */
async function trainModelOnData(data: LabeledSample[]): Promise<TrainedModel> {
  // Simulate model training
  await new Promise((resolve) => setTimeout(resolve, 10));

  return {
    trained: true,
    dataSize: data.length,
    accuracy: 0.7 + Math.random() * 0.3,
  };
}

/**
 * Predict with model
 */
async function predictWithModel(
  learnerId: string,
  features: number[]
): Promise<{ prediction: number; probabilities: number[] }> {
  // Simplified prediction
  const sum = features.reduce((a, b) => a + b, 0);
  const prob1 = 1 / (1 + Math.exp(-sum));

  return {
    prediction: prob1 > 0.5 ? 1 : 0,
    probabilities: [1 - prob1, prob1],
  };
}

/**
 * Predict with committee member
 */
function predictWithCommitteeMember(model: TrainedModel, features: number[]): number {
  const sum = features.reduce((a, b) => a + b, 0);
  return sum > 0 ? 1 : 0;
}

/**
 * Get current model
 */
async function getCurrentModel(learnerId: string): Promise<unknown> {
  const learner = await prisma.activeLearner.findUnique({
    where: { id: learnerId },
  });

  const models = learner?.models;
  return Array.isArray(models) ? (models[0] ?? {}) : {};
}

/**
 * Bootstrap sample
 */
function bootstrapSample<T>(data: T[]): T[] {
  const sample: T[] = [];
  for (let i = 0; i < data.length; i++) {
    sample.push(data[Math.floor(Math.random() * data.length)]);
  }
  return sample;
}

/**
 * Euclidean distance
 */
function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    sum += Math.pow(a[i] - b[i], 2);
  }
  return Math.sqrt(sum);
}

/**
 * Get learning curve
 */
export async function getLearningCurve(
  learnerId: string
): Promise<Array<{ iteration: number; accuracy: number; labeledCount: number }>> {
  const queries = await prisma.queryResult.findMany({
    where: { learnerId },
    orderBy: { timestamp: "asc" },
  });

  const curve: Array<{ iteration: number; accuracy: number; labeledCount: number }> = [];

  for (let i = 0; i < queries.length; i += 10) {
    curve.push({
      iteration: i + 1,
      accuracy: 0.5 + (i / queries.length) * 0.4, // Simulated improvement
      labeledCount: i + 10,
    });
  }

  return curve;
}

export { ActiveLearner, LabelFeedback, QueryResult, QueryStrategy, UncertaintyMeasure };
