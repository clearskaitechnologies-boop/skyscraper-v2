/**
 * Task 222: Time Series Forecasting
 *
 * Implements advanced forecasting algorithms, seasonality detection,
 * trend analysis, and anomaly prediction.
 */

import prisma from "@/lib/prisma";

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  metadata?: Record<string, any>;
}

export interface ForecastResult {
  timestamp: Date;
  predicted: number;
  lower: number;
  upper: number;
  confidence: number;
}

export interface SeasonalityPattern {
  period: number;
  strength: number;
  component: number[];
}

/**
 * Forecast time series
 */
export async function forecast(
  data: TimeSeriesData[],
  horizon: number,
  options?: {
    seasonality?: boolean;
    confidenceLevel?: number;
  }
): Promise<ForecastResult[]> {
  const values = data.map((d) => d.value);
  const trend = calculateTrend(values);
  const seasonality = options?.seasonality ? detectSeasonality(values) : null;

  const forecasts: ForecastResult[] = [];
  const lastTimestamp = data[data.length - 1].timestamp;

  for (let i = 1; i <= horizon; i++) {
    const trendValue = values[values.length - 1] + trend * i;
    const seasonalEffect = seasonality ? seasonality.component[i % seasonality.period] : 0;
    const predicted = trendValue + seasonalEffect;

    const stdDev = calculateStdDev(values);
    const margin = 1.96 * stdDev * Math.sqrt(i); // 95% confidence

    forecasts.push({
      timestamp: new Date(lastTimestamp.getTime() + i * 3600000),
      predicted,
      lower: predicted - margin,
      upper: predicted + margin,
      confidence: 0.95,
    });
  }

  return forecasts;
}

/**
 * Calculate trend
 */
function calculateTrend(values: number[]): number {
  const n = values.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumX2 += i * i;
  }

  return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Detect seasonality
 */
function detectSeasonality(values: number[]): SeasonalityPattern | null {
  if (values.length < 24) return null;

  const period = 24; // Daily seasonality
  const component: number[] = [];

  for (let i = 0; i < period; i++) {
    const seasonalValues = values.filter((_, idx) => idx % period === i);
    const mean = seasonalValues.reduce((a, b) => a + b, 0) / seasonalValues.length;
    component.push(mean);
  }

  const overallMean = values.reduce((a, b) => a + b, 0) / values.length;
  const normalizedComponent = component.map((v) => v - overallMean);

  const strength = calculateStdDev(normalizedComponent) / calculateStdDev(values);

  return { period, strength, component: normalizedComponent };
}

/**
 * Decompose time series
 */
export function decompose(data: TimeSeriesData[]): {
  trend: number[];
  seasonal: number[];
  residual: number[];
} {
  const values = data.map((d) => d.value);
  const n = values.length;

  // Calculate trend (moving average)
  const windowSize = Math.min(7, Math.floor(n / 3));
  const trend: number[] = [];

  for (let i = 0; i < n; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(n, i + Math.floor(windowSize / 2) + 1);
    const window = values.slice(start, end);
    trend.push(window.reduce((a, b) => a + b, 0) / window.length);
  }

  // Calculate seasonal component
  const detrended = values.map((v, i) => v - trend[i]);
  const seasonality = detectSeasonality(detrended);
  const seasonal = seasonality
    ? values.map((_, i) => seasonality.component[i % seasonality.period])
    : Array(n).fill(0);

  // Calculate residual
  const residual = values.map((v, i) => v - trend[i] - seasonal[i]);

  return { trend, seasonal, residual };
}

export { ForecastResult, SeasonalityPattern,TimeSeriesData };
