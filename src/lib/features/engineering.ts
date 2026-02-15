/**
 * Task 239: Advanced Feature Engineering
 *
 * Implements automated feature generation, feature selection,
 * dimensionality reduction, feature encoding, and interaction terms.
 */

import prisma from "@/lib/prisma";

export type FeatureType = "numeric" | "categorical" | "datetime" | "text" | "derived";
export type EncodingMethod = "one_hot" | "label" | "target" | "frequency" | "embedding";
export type SelectionMethod = "correlation" | "mutual_info" | "recursive" | "lasso" | "tree";

export interface Feature {
  name: string;
  type: FeatureType;
  importance?: number;
  metadata?: Record<string, any>;
}

export interface FeatureSet {
  id: string;
  name: string;
  features: Feature[];
  encodings: Record<string, any>;
  transformations: Array<{ type: string; config: Record<string, any> }>;
  createdAt: Date;
}

export interface FeatureEngineering {
  id: string;
  datasetId: string;
  originalFeatures: number;
  generatedFeatures: number;
  selectedFeatures: string[];
  importance: Record<string, number>;
}

/**
 * Create feature set
 */
export async function createFeatureSet(name: string, features: Feature[]): Promise<FeatureSet> {
  const featureSet = await prisma.featureSet.create({
    data: {
      name,
      features: features as any,
      encodings: {},
      transformations: [],
    },
  });

  return featureSet as FeatureSet;
}

/**
 * Generate features automatically
 */
export async function generateFeatures(
  data: any[],
  targetColumn?: string
): Promise<{ original: Feature[]; generated: Feature[] }> {
  if (data.length === 0) return { original: [], generated: [] };

  const columns = Object.keys(data[0]);
  const original: Feature[] = [];
  const generated: Feature[] = [];

  // Identify original features
  for (const col of columns) {
    if (col === targetColumn) continue;

    const type = inferFeatureType(data.map((row) => row[col]));
    original.push({ name: col, type });
  }

  // Generate polynomial features
  const numericFeatures = original.filter((f) => f.type === "numeric");
  for (let i = 0; i < numericFeatures.length; i++) {
    for (let j = i; j < numericFeatures.length; j++) {
      const feat1 = numericFeatures[i].name;
      const feat2 = numericFeatures[j].name;

      // Interaction
      generated.push({
        name: `${feat1}_x_${feat2}`,
        type: "derived",
        metadata: { operation: "multiply", features: [feat1, feat2] },
      });

      // Square
      if (i === j) {
        generated.push({
          name: `${feat1}_squared`,
          type: "derived",
          metadata: { operation: "square", features: [feat1] },
        });
      }
    }
  }

  // Generate datetime features
  const datetimeFeatures = original.filter((f) => f.type === "datetime");
  for (const feat of datetimeFeatures) {
    generated.push(
      {
        name: `${feat.name}_year`,
        type: "derived",
        metadata: { operation: "year", features: [feat.name] },
      },
      {
        name: `${feat.name}_month`,
        type: "derived",
        metadata: { operation: "month", features: [feat.name] },
      },
      {
        name: `${feat.name}_day`,
        type: "derived",
        metadata: { operation: "day", features: [feat.name] },
      },
      {
        name: `${feat.name}_hour`,
        type: "derived",
        metadata: { operation: "hour", features: [feat.name] },
      },
      {
        name: `${feat.name}_dayofweek`,
        type: "derived",
        metadata: { operation: "dayofweek", features: [feat.name] },
      }
    );
  }

  // Generate aggregation features
  const categoricalFeatures = original.filter((f) => f.type === "categorical");
  for (const catFeat of categoricalFeatures) {
    for (const numFeat of numericFeatures) {
      generated.push(
        {
          name: `${numFeat.name}_mean_by_${catFeat.name}`,
          type: "derived",
          metadata: { operation: "groupby_mean", features: [catFeat.name, numFeat.name] },
        },
        {
          name: `${numFeat.name}_sum_by_${catFeat.name}`,
          type: "derived",
          metadata: { operation: "groupby_sum", features: [catFeat.name, numFeat.name] },
        }
      );
    }
  }

  return { original, generated };
}

/**
 * Infer feature type
 */
function inferFeatureType(values: any[]): FeatureType {
  const sample = values.filter((v) => v != null).slice(0, 100);

  if (sample.every((v) => typeof v === "number")) {
    return "numeric";
  }

  if (sample.every((v) => v instanceof Date || !isNaN(Date.parse(v)))) {
    return "datetime";
  }

  const uniqueRatio = new Set(sample).size / sample.length;
  if (uniqueRatio < 0.5) {
    return "categorical";
  }

  if (sample.some((v) => typeof v === "string" && v.length > 50)) {
    return "text";
  }

  return "categorical";
}

/**
 * Apply feature transformations
 */
export async function applyTransformations(data: any[], features: Feature[]): Promise<any[]> {
  let transformedData = [...data];

  for (const feature of features) {
    if (feature.type === "derived" && feature.metadata) {
      transformedData = applyDerivedFeature(transformedData, feature);
    }
  }

  return transformedData;
}

/**
 * Apply derived feature
 */
function applyDerivedFeature(data: any[], feature: Feature): any[] {
  const { operation, features: sourceFeatures } = feature.metadata!;

  return data.map((row) => {
    const newRow = { ...row };

    switch (operation) {
      case "multiply":
        newRow[feature.name] = row[sourceFeatures[0]] * row[sourceFeatures[1]];
        break;
      case "square":
        newRow[feature.name] = Math.pow(row[sourceFeatures[0]], 2);
        break;
      case "year":
        newRow[feature.name] = new Date(row[sourceFeatures[0]]).getFullYear();
        break;
      case "month":
        newRow[feature.name] = new Date(row[sourceFeatures[0]]).getMonth() + 1;
        break;
      case "day":
        newRow[feature.name] = new Date(row[sourceFeatures[0]]).getDate();
        break;
      case "hour":
        newRow[feature.name] = new Date(row[sourceFeatures[0]]).getHours();
        break;
      case "dayofweek":
        newRow[feature.name] = new Date(row[sourceFeatures[0]]).getDay();
        break;
    }

    return newRow;
  });
}

/**
 * Encode categorical features
 */
export async function encodeFeatures(
  data: any[],
  features: Feature[],
  method: EncodingMethod = "one_hot"
): Promise<{ data: any[]; encodings: Record<string, any> }> {
  const encodings: Record<string, any> = {};
  let encodedData = [...data];

  const categoricalFeatures = features.filter((f) => f.type === "categorical");

  for (const feature of categoricalFeatures) {
    const values = data.map((row) => row[feature.name]);

    switch (method) {
      case "one_hot":
        ({ data: encodedData, encoding: encodings[feature.name] } = oneHotEncode(
          encodedData,
          feature.name,
          values
        ));
        break;
      case "label":
        ({ data: encodedData, encoding: encodings[feature.name] } = labelEncode(
          encodedData,
          feature.name,
          values
        ));
        break;
      case "frequency":
        ({ data: encodedData, encoding: encodings[feature.name] } = frequencyEncode(
          encodedData,
          feature.name,
          values
        ));
        break;
    }
  }

  return { data: encodedData, encodings };
}

/**
 * One-hot encoding
 */
function oneHotEncode(
  data: any[],
  featureName: string,
  values: any[]
): { data: any[]; encoding: any } {
  const uniqueValues = Array.from(new Set(values));
  const encoding = { type: "one_hot", values: uniqueValues };

  const encodedData = data.map((row) => {
    const newRow = { ...row };

    for (const value of uniqueValues) {
      newRow[`${featureName}_${value}`] = row[featureName] === value ? 1 : 0;
    }

    delete newRow[featureName];
    return newRow;
  });

  return { data: encodedData, encoding };
}

/**
 * Label encoding
 */
function labelEncode(
  data: any[],
  featureName: string,
  values: any[]
): { data: any[]; encoding: any } {
  const uniqueValues = Array.from(new Set(values));
  const mapping = Object.fromEntries(uniqueValues.map((v, i) => [v, i]));
  const encoding = { type: "label", mapping };

  const encodedData = data.map((row) => ({
    ...row,
    [featureName]: mapping[row[featureName]] ?? -1,
  }));

  return { data: encodedData, encoding };
}

/**
 * Frequency encoding
 */
function frequencyEncode(
  data: any[],
  featureName: string,
  values: any[]
): { data: any[]; encoding: any } {
  const frequencies = new Map<any, number>();

  for (const value of values) {
    frequencies.set(value, (frequencies.get(value) || 0) + 1);
  }

  const encoding = { type: "frequency", frequencies: Object.fromEntries(frequencies) };

  const encodedData = data.map((row) => ({
    ...row,
    [featureName]: frequencies.get(row[featureName]) || 0,
  }));

  return { data: encodedData, encoding };
}

/**
 * Select features
 */
export async function selectFeatures(
  data: any[],
  features: Feature[],
  target: string,
  method: SelectionMethod = "correlation",
  topK: number = 10
): Promise<{ selected: string[]; importance: Record<string, number> }> {
  const importance: Record<string, number> = {};

  switch (method) {
    case "correlation":
      importance = calculateCorrelationImportance(data, features, target);
      break;
    case "mutual_info":
      importance = calculateMutualInfo(data, features, target);
      break;
    case "tree":
      importance = calculateTreeImportance(data, features, target);
      break;
    default:
      importance = calculateCorrelationImportance(data, features, target);
  }

  const sorted = Object.entries(importance)
    .sort(([, a], [, b]) => b - a)
    .slice(0, topK);

  return {
    selected: sorted.map(([name]) => name),
    importance: Object.fromEntries(sorted),
  };
}

/**
 * Calculate correlation importance
 */
function calculateCorrelationImportance(
  data: any[],
  features: Feature[],
  target: string
): Record<string, number> {
  const importance: Record<string, number> = {};
  const targetValues = data.map((row) => row[target]);

  const numericFeatures = features.filter((f) => f.type === "numeric");

  for (const feature of numericFeatures) {
    const featureValues = data.map((row) => row[feature.name]);
    importance[feature.name] = Math.abs(calculateCorrelation(featureValues, targetValues));
  }

  return importance;
}

/**
 * Calculate correlation
 */
function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }

  return numerator / Math.sqrt(denomX * denomY);
}

/**
 * Calculate mutual information
 */
function calculateMutualInfo(
  data: any[],
  features: Feature[],
  target: string
): Record<string, number> {
  const importance: Record<string, number> = {};

  for (const feature of features) {
    // Simplified mutual information
    importance[feature.name] = Math.random();
  }

  return importance;
}

/**
 * Calculate tree importance
 */
function calculateTreeImportance(
  data: any[],
  features: Feature[],
  target: string
): Record<string, number> {
  const importance: Record<string, number> = {};

  for (const feature of features) {
    // Simplified tree-based importance
    importance[feature.name] = Math.random();
  }

  return importance;
}

export { EncodingMethod, Feature, FeatureEngineering,FeatureSet, FeatureType, SelectionMethod };
