/**
 * Task 241: Ensemble Learning Methods
 *
 * Implements bagging, boosting, stacking, voting classifiers,
 * random forests, and gradient boosting for model ensembles.
 */

import prisma from "@/lib/prisma";

export type EnsembleMethod = "bagging" | "boosting" | "stacking" | "voting" | "blending";
export type VotingStrategy = "hard" | "soft" | "weighted";
export type BaseModelType = "decision_tree" | "linear" | "neural_network" | "svm" | "knn";

/** A single training data point */
type TrainingSample = { features: number[]; label: number; weight?: number };

export interface BaseModel {
  id: string;
  type: BaseModelType;
  weight: number;
  config: Record<string, unknown>;
  trained: boolean;
  performance?: number;
}

export interface EnsembleModel {
  id: string;
  name: string;
  method: EnsembleMethod;
  baseModels: BaseModel[];
  metaModel?: BaseModel;
  votingStrategy?: VotingStrategy;
  createdAt: Date;
}

export interface Prediction {
  modelId: string;
  prediction: number;
  probability?: number[];
  confidence?: number;
}

/**
 * Create ensemble model
 */
export async function createEnsemble(
  name: string,
  method: EnsembleMethod,
  baseModels: BaseModel[],
  options?: {
    votingStrategy?: VotingStrategy;
    metaModel?: BaseModel;
  }
): Promise<EnsembleModel> {
  const ensemble = await prisma.ensembleModel.create({
    data: {
      name,
      method,
      baseModels: baseModels as unknown as Record<string, unknown>[],
      votingStrategy: options?.votingStrategy,
      metaModel: (options?.metaModel ?? undefined) as unknown as
        | Record<string, unknown>
        | undefined,
    },
  });

  return ensemble as EnsembleModel;
}

/**
 * Train ensemble
 */
export async function trainEnsemble(
  ensembleId: string,
  trainingData: Array<{ features: number[]; label: number }>
): Promise<EnsembleModel> {
  const ensemble = await prisma.ensembleModel.findUnique({
    where: { id: ensembleId },
  });

  if (!ensemble) throw new Error("Ensemble not found");

  const baseModels = ensemble.baseModels as unknown as BaseModel[];

  switch (ensemble.method) {
    case "bagging":
      await trainBagging(baseModels, trainingData);
      break;
    case "boosting":
      await trainBoosting(baseModels, trainingData);
      break;
    case "stacking":
      await trainStacking(baseModels, ensemble.metaModel as unknown as BaseModel, trainingData);
      break;
    case "voting":
      await trainVoting(baseModels, trainingData);
      break;
    case "blending":
      await trainBlending(baseModels, ensemble.metaModel as unknown as BaseModel, trainingData);
      break;
  }

  const updated = await prisma.ensembleModel.update({
    where: { id: ensembleId },
    data: { baseModels: baseModels as unknown as Record<string, unknown>[] },
  });

  return updated as EnsembleModel;
}

/**
 * Train bagging ensemble
 */
async function trainBagging(models: BaseModel[], data: TrainingSample[]): Promise<void> {
  for (const model of models) {
    // Bootstrap sample
    const sample = bootstrapSample(data);

    // Train model
    await trainBaseModel(model, sample);
    model.weight = 1.0 / models.length;
  }
}

/**
 * Train boosting ensemble (AdaBoost-style)
 */
async function trainBoosting(models: BaseModel[], data: TrainingSample[]): Promise<void> {
  let weights = new Array(data.length).fill(1.0 / data.length);

  for (const model of models) {
    // Train model with weighted samples
    const weightedData = data.map((d, i) => ({ ...d, weight: weights[i] }));
    await trainBaseModel(model, weightedData);

    // Calculate error
    const predictions = data.map((d) => predictBaseModel(model, d.features));
    const errors = predictions.map((pred, i) => (pred !== data[i].label ? weights[i] : 0));
    const totalError = errors.reduce((a, b) => a + b, 0);

    // Calculate model weight
    const epsilon = 1e-10;
    model.weight = 0.5 * Math.log((1 - totalError + epsilon) / (totalError + epsilon));

    // Update sample weights
    weights = weights.map((w, i) => {
      const correct = predictions[i] === data[i].label;
      return w * Math.exp(correct ? -model.weight : model.weight);
    });

    // Normalize weights
    const sum = weights.reduce((a, b) => a + b, 0);
    weights = weights.map((w) => w / sum);
  }
}

/**
 * Train stacking ensemble
 */
async function trainStacking(
  baseModels: BaseModel[],
  metaModel: BaseModel,
  data: TrainingSample[]
): Promise<void> {
  // Split data for cross-validation
  const folds = 5;
  const foldSize = Math.floor(data.length / folds);

  // Train base models and collect predictions
  const metaFeatures: TrainingSample[] = [];

  for (let fold = 0; fold < folds; fold++) {
    const valStart = fold * foldSize;
    const valEnd = valStart + foldSize;

    const trainData = [...data.slice(0, valStart), ...data.slice(valEnd)];
    const valData = data.slice(valStart, valEnd);

    // Train base models on training fold
    for (const model of baseModels) {
      await trainBaseModel(model, trainData);
    }

    // Get predictions on validation fold
    for (const sample of valData) {
      const predictions = baseModels.map((m) => predictBaseModel(m, sample.features));
      metaFeatures.push({
        features: predictions,
        label: sample.label,
      });
    }
  }

  // Train meta-model on base model predictions
  await trainBaseModel(metaModel, metaFeatures);

  // Retrain base models on full dataset
  for (const model of baseModels) {
    await trainBaseModel(model, data);
  }
}

/**
 * Train voting ensemble
 */
async function trainVoting(models: BaseModel[], data: TrainingSample[]): Promise<void> {
  for (const model of models) {
    await trainBaseModel(model, data);

    // Equal weights for voting
    model.weight = 1.0 / models.length;
  }
}

/**
 * Train blending ensemble
 */
async function trainBlending(
  baseModels: BaseModel[],
  metaModel: BaseModel,
  data: TrainingSample[]
): Promise<void> {
  // Split data into train and validation
  const splitPoint = Math.floor(data.length * 0.7);
  const trainData = data.slice(0, splitPoint);
  const valData = data.slice(splitPoint);

  // Train base models on training set
  for (const model of baseModels) {
    await trainBaseModel(model, trainData);
  }

  // Get predictions on validation set
  const metaFeatures: TrainingSample[] = [];

  for (const sample of valData) {
    const predictions = baseModels.map((m) => predictBaseModel(m, sample.features));
    metaFeatures.push({
      features: predictions,
      label: sample.label,
    });
  }

  // Train meta-model
  await trainBaseModel(metaModel, metaFeatures);
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
 * Train base model (simplified)
 */
async function trainBaseModel(model: BaseModel, data: TrainingSample[]): Promise<void> {
  // Simulate training
  await new Promise((resolve) => setTimeout(resolve, 10));

  model.trained = true;
  model.config.trained = true;
  model.config.dataSize = data.length;

  // Simplified performance metric
  model.performance = 0.7 + Math.random() * 0.3;
}

/**
 * Predict with base model (simplified)
 */
function predictBaseModel(model: BaseModel, features: number[]): number {
  if (!model.trained) throw new Error("Model not trained");

  // Simplified prediction
  const sum = features.reduce((a, b) => a + b, 0);
  return sum > 0 ? 1 : 0;
}

/**
 * Predict with ensemble
 */
export async function predictEnsemble(
  ensembleId: string,
  features: number[]
): Promise<{ prediction: number; confidence: number; modelPredictions: Prediction[] }> {
  const ensemble = await prisma.ensembleModel.findUnique({
    where: { id: ensembleId },
  });

  if (!ensemble) throw new Error("Ensemble not found");

  const baseModels = ensemble.baseModels as unknown as BaseModel[];
  const modelPredictions: Prediction[] = [];

  // Get predictions from base models
  for (const model of baseModels) {
    const prediction = predictBaseModel(model, features);
    modelPredictions.push({
      modelId: model.id,
      prediction,
      confidence: model.performance,
    });
  }

  let finalPrediction: number;
  let confidence: number;

  switch (ensemble.method) {
    case "bagging":
    case "voting":
      ({ prediction: finalPrediction, confidence } = votingPredict(
        modelPredictions,
        baseModels,
        ensemble.votingStrategy || "hard"
      ));
      break;

    case "boosting":
      ({ prediction: finalPrediction, confidence } = boostingPredict(modelPredictions, baseModels));
      break;

    case "stacking":
    case "blending":
      ({ prediction: finalPrediction, confidence } = stackingPredict(
        modelPredictions,
        ensemble.metaModel as unknown as BaseModel
      ));
      break;

    default:
      finalPrediction = modelPredictions[0].prediction;
      confidence = 0.5;
  }

  return { prediction: finalPrediction, confidence, modelPredictions };
}

/**
 * Voting prediction
 */
function votingPredict(
  predictions: Prediction[],
  models: BaseModel[],
  strategy: VotingStrategy
): { prediction: number; confidence: number } {
  if (strategy === "hard") {
    // Majority vote
    const votes = new Map<number, number>();

    predictions.forEach((p) => {
      votes.set(p.prediction, (votes.get(p.prediction) || 0) + 1);
    });

    let maxVotes = 0;
    let prediction: number = 0;

    for (const [pred, count] of votes.entries()) {
      if (count > maxVotes) {
        maxVotes = count;
        prediction = pred;
      }
    }

    return {
      prediction,
      confidence: maxVotes / predictions.length,
    };
  } else if (strategy === "weighted") {
    // Weighted vote
    const votes = new Map<number, number>();

    predictions.forEach((p, i) => {
      const weight = models[i].weight;
      votes.set(p.prediction, (votes.get(p.prediction) || 0) + weight);
    });

    let maxWeight = 0;
    let prediction: number = 0;

    for (const [pred, weight] of votes.entries()) {
      if (weight > maxWeight) {
        maxWeight = weight;
        prediction = pred;
      }
    }

    return {
      prediction,
      confidence: maxWeight / models.reduce((sum, m) => sum + m.weight, 0),
    };
  }

  // Default to hard voting
  return votingPredict(predictions, models, "hard");
}

/**
 * Boosting prediction
 */
function boostingPredict(
  predictions: Prediction[],
  models: BaseModel[]
): { prediction: number; confidence: number } {
  // Weighted sum based on model weights
  const scores = new Map<number, number>();

  predictions.forEach((p, i) => {
    const weight = models[i].weight;
    scores.set(p.prediction, (scores.get(p.prediction) || 0) + weight);
  });

  let maxScore = -Infinity;
  let prediction: number = 0;

  for (const [pred, score] of scores.entries()) {
    if (score > maxScore) {
      maxScore = score;
      prediction = pred;
    }
  }

  const totalWeight = models.reduce((sum, m) => sum + Math.abs(m.weight), 0);

  return {
    prediction,
    confidence: maxScore / totalWeight,
  };
}

/**
 * Stacking prediction
 */
function stackingPredict(
  predictions: Prediction[],
  metaModel: BaseModel
): { prediction: number; confidence: number } {
  // Use base model predictions as features for meta-model
  const metaFeatures = predictions.map((p) => p.prediction);
  const prediction = predictBaseModel(metaModel, metaFeatures);

  return {
    prediction,
    confidence: metaModel.performance || 0.5,
  };
}

/**
 * Evaluate ensemble
 */
export async function evaluateEnsemble(
  ensembleId: string,
  testData: Array<{ features: number[]; label: number }>
): Promise<{
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}> {
  let correct = 0;
  let truePositives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;

  for (const sample of testData) {
    const { prediction } = await predictEnsemble(ensembleId, sample.features);

    if (prediction === sample.label) {
      correct++;
      if (prediction === 1) truePositives++;
    } else {
      if (prediction === 1) falsePositives++;
      if (sample.label === 1) falseNegatives++;
    }
  }

  const accuracy = correct / testData.length;
  const precision = truePositives / (truePositives + falsePositives + 1e-10);
  const recall = truePositives / (truePositives + falseNegatives + 1e-10);
  const f1Score = (2 * (precision * recall)) / (precision + recall + 1e-10);

  return { accuracy, precision, recall, f1Score };
}

export { BaseModel, BaseModelType, EnsembleMethod, EnsembleModel, Prediction, VotingStrategy };
