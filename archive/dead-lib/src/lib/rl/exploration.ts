// src/lib/rl/exploration.ts
// Exploration Strategies in RL Module
// Implements UCB, Thompson sampling, curiosity-driven exploration, and intrinsic motivation

/**
 * Result of an exploration strategy
 */
export interface ExplorationStrategyResult {
  strategy: string;
  explorationRate: number;
  performance: number;
  actionsExplored: number;
  regret: number;
  coverageScore: number;
}

/**
 * Configuration for exploration strategies
 */
export interface ExplorationConfig {
  strategy: "epsilon-greedy" | "ucb" | "thompson" | "curiosity" | "entropy" | "count-based";
  epsilon?: number;
  ucbConstant?: number;
  thompsonPrior?: [number, number];
  curiosityCoefficient?: number;
  intrinsicRewardWeight?: number;
  decayRate?: number;
}

/**
 * Upper Confidence Bound (UCB) state
 */
export interface UCBState {
  actionCounts: number[];
  actionValues: number[];
  totalSteps: number;
  confidence: number[];
  ucbValues: number[];
}

/**
 * Thompson sampling state
 */
export interface ThompsonState {
  alphaBeta: Array<[number, number]>;
  posteriorMeans: number[];
  posteriorVariances: number[];
  samples: number[];
}

/**
 * Curiosity-driven exploration state
 */
export interface CuriosityState {
  forwardModel: number[];
  inverseModel: number[];
  predictionErrors: number[];
  intrinsicRewards: number[];
  noveltyScores: Map<string, number>;
}

/**
 * Intrinsic motivation metrics
 */
export interface IntrinsicMotivation {
  novelty: number;
  surprise: number;
  learningProgress: number;
  empowerment: number;
  curiosityReward: number;
}

/**
 * Count-based exploration state
 */
export interface CountBasedState {
  stateCounts: Map<string, number>;
  stateActionCounts: Map<string, number>;
  pseudoCounts: Map<string, number>;
  bonusCoefficient: number;
}

/**
 * Entropy-based exploration metrics
 */
export interface EntropyMetrics {
  policyEntropy: number;
  stateVisitationEntropy: number;
  actionEntropy: number[];
  diversityScore: number;
}

/**
 * Exploration history entry
 */
export interface ExplorationEntry {
  step: number;
  state: number[];
  action: number;
  reward: number;
  intrinsicReward: number;
  wasExploration: boolean;
  uncertainty: number;
}

/**
 * Exploration Strategies implementation
 * Provides various exploration methods for RL agents
 */
export class ExplorationStrategies {
  private config: ExplorationConfig;
  private ucbState: UCBState | null = null;
  private thompsonState: ThompsonState | null = null;
  private curiosityState: CuriosityState | null = null;
  private countState: CountBasedState | null = null;
  private explorationHistory: ExplorationEntry[] = [];
  private currentStep: number = 0;

  constructor(config: Partial<ExplorationConfig> = {}) {
    this.config = {
      strategy: "epsilon-greedy",
      epsilon: 0.1,
      ucbConstant: 2.0,
      thompsonPrior: [1.0, 1.0],
      curiosityCoefficient: 0.5,
      intrinsicRewardWeight: 0.1,
      decayRate: 0.99,
      ...config,
    };
  }

  /**
   * Epsilon-greedy exploration
   * Simple but effective: explore randomly with probability epsilon
   */
  epsilonGreedy(qValues: number[], epsilon?: number): ExplorationStrategyResult {
    try {
      const eps = epsilon ?? this.config.epsilon ?? 0.1;
      let action: number;
      let wasExploration = false;

      if (Math.random() < eps) {
        action = Math.floor(Math.random() * qValues.length);
        wasExploration = true;
      } else {
        action = this.argmax(qValues);
      }

      const performance = qValues[action];
      const coverageScore = this.computeCoverageScore();

      return {
        strategy: "epsilon-greedy",
        explorationRate: eps,
        performance,
        actionsExplored: wasExploration ? 1 : 0,
        regret: Math.max(...qValues) - performance,
        coverageScore,
      };
    } catch (error) {
      throw new Error(
        `Epsilon-greedy exploration failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Upper Confidence Bound (UCB) exploration
   * Optimistic exploration based on uncertainty
   */
  ucb(qValues: number[], actionCounts: number[], totalSteps: number): ExplorationStrategyResult {
    try {
      if (!this.ucbState || this.ucbState.actionValues.length !== qValues.length) {
        this.initializeUCB(qValues.length);
      }

      const c = this.config.ucbConstant ?? 2.0;
      const ucbValues = qValues.map((q, i) => {
        const count = actionCounts[i] || 1;
        const bonus = c * Math.sqrt(Math.log(totalSteps + 1) / count);
        return q + bonus;
      });

      this.ucbState!.ucbValues = ucbValues;
      this.ucbState!.actionValues = qValues;
      this.ucbState!.actionCounts = actionCounts;
      this.ucbState!.totalSteps = totalSteps;

      // Compute confidence bounds
      this.ucbState!.confidence = qValues.map((q, i) => {
        const count = actionCounts[i] || 1;
        return c * Math.sqrt(Math.log(totalSteps + 1) / count);
      });

      const action = this.argmax(ucbValues);
      const performance = qValues[action];
      const explorationBonus = this.ucbState!.confidence[action];

      return {
        strategy: "ucb",
        explorationRate: explorationBonus,
        performance,
        actionsExplored: 1,
        regret: Math.max(...qValues) - performance,
        coverageScore: this.computeUCBCoverage(actionCounts),
      };
    } catch (error) {
      throw new Error(
        `UCB exploration failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Thompson Sampling
   * Bayesian exploration using posterior sampling
   */
  thompsonSampling(
    actionRewards: Array<{ action: number; reward: number }[]>
  ): ExplorationStrategyResult {
    try {
      if (!this.thompsonState || this.thompsonState.alphaBeta.length !== actionRewards.length) {
        this.initializeThompson(actionRewards.length);
      }

      // Update posterior distributions
      for (let a = 0; a < actionRewards.length; a++) {
        const rewards = actionRewards[a];
        for (const { reward } of rewards) {
          if (reward > 0) {
            this.thompsonState!.alphaBeta[a][0] += reward;
          } else {
            this.thompsonState!.alphaBeta[a][1] += 1 - reward;
          }
        }
      }

      // Sample from posterior
      const samples = this.thompsonState!.alphaBeta.map(([alpha, beta]) =>
        this.betaSample(alpha, beta)
      );
      this.thompsonState!.samples = samples;

      // Select action with highest sample
      const action = this.argmax(samples);
      const performance = samples[action];

      // Compute posterior statistics
      this.thompsonState!.posteriorMeans = this.thompsonState!.alphaBeta.map(
        ([alpha, beta]) => alpha / (alpha + beta)
      );
      this.thompsonState!.posteriorVariances = this.thompsonState!.alphaBeta.map(
        ([alpha, beta]) => (alpha * beta) / ((alpha + beta) ** 2 * (alpha + beta + 1))
      );

      const explorationRate = Math.sqrt(this.thompsonState!.posteriorVariances[action]);

      return {
        strategy: "thompson",
        explorationRate,
        performance,
        actionsExplored: 1,
        regret: Math.max(...this.thompsonState!.posteriorMeans) - performance,
        coverageScore: this.computeThompsonCoverage(),
      };
    } catch (error) {
      throw new Error(
        `Thompson sampling failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Curiosity-driven exploration
   * Uses prediction error as intrinsic reward
   */
  curiosityDriven(
    state: number[],
    nextState: number[],
    action: number,
    extrinsicReward: number
  ): ExplorationStrategyResult & { intrinsicMotivation: IntrinsicMotivation } {
    try {
      if (!this.curiosityState) {
        this.initializeCuriosity(state.length);
      }

      // Forward model: predict next state from current state and action
      const predictedNextState = this.forwardPredict(state, action);
      const predictionError = this.computePredictionError(predictedNextState, nextState);

      // Inverse model: predict action from state transition
      const predictedAction = this.inversePredict(state, nextState);
      const inversePredictionError = Math.abs(action - predictedAction);

      // Compute intrinsic reward based on prediction error (novelty)
      const intrinsicReward = this.config.curiosityCoefficient! * predictionError;

      // Update models
      this.updateForwardModel(state, action, nextState, predictionError);
      this.updateInverseModel(state, nextState, action);

      // Track novelty
      const stateKey = this.stateToString(state);
      const novelty = this.computeNovelty(state);
      this.curiosityState.noveltyScores.set(stateKey, novelty);
      this.curiosityState.predictionErrors.push(predictionError);
      this.curiosityState.intrinsicRewards.push(intrinsicReward);

      // Compute intrinsic motivation components
      const intrinsicMotivation: IntrinsicMotivation = {
        novelty,
        surprise: predictionError,
        learningProgress: this.computeLearningProgress(),
        empowerment: this.computeEmpowerment(state),
        curiosityReward: intrinsicReward,
      };

      const totalReward = extrinsicReward + this.config.intrinsicRewardWeight! * intrinsicReward;

      return {
        strategy: "curiosity",
        explorationRate: novelty,
        performance: totalReward,
        actionsExplored: 1,
        regret: 0, // N/A for curiosity
        coverageScore: this.curiosityState.noveltyScores.size / 100, // Normalize
        intrinsicMotivation,
      };
    } catch (error) {
      throw new Error(
        `Curiosity-driven exploration failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Count-based exploration
   * Bonuses based on state visit counts (pseudo-counts)
   */
  countBased(state: number[], action: number, qValues: number[]): ExplorationStrategyResult {
    try {
      if (!this.countState) {
        this.initializeCountBased();
      }

      const stateKey = this.stateToString(state);
      const stateActionKey = `${stateKey}_${action}`;

      // Update counts
      const stateCount = (this.countState.stateCounts.get(stateKey) || 0) + 1;
      const stateActionCount = (this.countState.stateActionCounts.get(stateActionKey) || 0) + 1;

      this.countState.stateCounts.set(stateKey, stateCount);
      this.countState.stateActionCounts.set(stateActionKey, stateActionCount);

      // Compute exploration bonus (higher for less visited state-actions)
      const bonus = this.countState.bonusCoefficient / Math.sqrt(stateActionCount);

      // Augmented Q-values with exploration bonus
      const augmentedQValues = qValues.map((q, a) => {
        const saKey = `${stateKey}_${a}`;
        const count = this.countState!.stateActionCounts.get(saKey) || 1;
        return q + this.countState!.bonusCoefficient / Math.sqrt(count);
      });

      const selectedAction = this.argmax(augmentedQValues);
      const performance = qValues[selectedAction];

      return {
        strategy: "count-based",
        explorationRate: bonus,
        performance,
        actionsExplored: 1,
        regret: Math.max(...qValues) - performance,
        coverageScore: this.countState.stateCounts.size / 100, // Normalize
      };
    } catch (error) {
      throw new Error(
        `Count-based exploration failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Entropy-based exploration
   * Maximizes policy entropy for diverse behavior
   */
  entropyBased(
    policyLogits: number[],
    stateHistory: number[][]
  ): ExplorationStrategyResult & { entropyMetrics: EntropyMetrics } {
    try {
      // Compute policy entropy
      const probs = this.softmax(policyLogits);
      const policyEntropy = -probs.reduce((sum, p) => sum + (p > 0 ? p * Math.log(p) : 0), 0);

      // Compute state visitation entropy
      const stateCounts = new Map<string, number>();
      for (const state of stateHistory) {
        const key = this.stateToString(state);
        stateCounts.set(key, (stateCounts.get(key) || 0) + 1);
      }

      const totalVisits = stateHistory.length;
      let stateVisitationEntropy = 0;
      for (const count of stateCounts.values()) {
        const p = count / totalVisits;
        stateVisitationEntropy -= p * Math.log(p);
      }

      // Action entropy per state
      const actionEntropy = probs.map((p) => (p > 0 ? -p * Math.log(p) : 0));

      // Diversity score
      const diversityScore = (policyEntropy + stateVisitationEntropy) / 2;

      // Sample action from policy
      const action = this.sampleFromDistribution(probs);
      const performance = probs[action];

      const entropyMetrics: EntropyMetrics = {
        policyEntropy,
        stateVisitationEntropy,
        actionEntropy,
        diversityScore,
      };

      return {
        strategy: "entropy",
        explorationRate: policyEntropy,
        performance,
        actionsExplored: 1,
        regret: 0, // N/A
        coverageScore: diversityScore,
        entropyMetrics,
      };
    } catch (error) {
      throw new Error(
        `Entropy-based exploration failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Softmax exploration (Boltzmann exploration)
   * Temperature-controlled stochastic policy
   */
  softmax(qValues: number[], temperature: number = 1.0): number[] {
    const maxQ = Math.max(...qValues);
    const exps = qValues.map((q) => Math.exp((q - maxQ) / temperature));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map((e) => e / sum);
  }

  /**
   * Softmax exploration strategy result
   */
  softmaxExploration(qValues: number[], temperature: number = 1.0): ExplorationStrategyResult {
    try {
      const probs = this.softmax(qValues, temperature);
      const action = this.sampleFromDistribution(probs);
      const performance = qValues[action];

      // Entropy as exploration rate
      const entropy = -probs.reduce((sum, p) => sum + (p > 0 ? p * Math.log(p) : 0), 0);

      return {
        strategy: "softmax",
        explorationRate: temperature,
        performance,
        actionsExplored: 1,
        regret: Math.max(...qValues) - performance,
        coverageScore: entropy / Math.log(qValues.length),
      };
    } catch (error) {
      throw new Error(
        `Softmax exploration failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // Initialization methods

  private initializeUCB(numActions: number): void {
    this.ucbState = {
      actionCounts: new Array(numActions).fill(0),
      actionValues: new Array(numActions).fill(0),
      totalSteps: 0,
      confidence: new Array(numActions).fill(Infinity),
      ucbValues: new Array(numActions).fill(Infinity),
    };
  }

  private initializeThompson(numActions: number): void {
    const prior = this.config.thompsonPrior!;
    this.thompsonState = {
      alphaBeta: Array(numActions)
        .fill(0)
        .map(() => [...prior] as [number, number]),
      posteriorMeans: Array(numActions).fill(0.5),
      posteriorVariances: Array(numActions).fill(0.25),
      samples: Array(numActions).fill(0),
    };
  }

  private initializeCuriosity(stateSize: number): void {
    this.curiosityState = {
      forwardModel: new Array(stateSize * 2).fill(0).map(() => (Math.random() - 0.5) * 0.1),
      inverseModel: new Array(stateSize * 2).fill(0).map(() => (Math.random() - 0.5) * 0.1),
      predictionErrors: [],
      intrinsicRewards: [],
      noveltyScores: new Map(),
    };
  }

  private initializeCountBased(): void {
    this.countState = {
      stateCounts: new Map(),
      stateActionCounts: new Map(),
      pseudoCounts: new Map(),
      bonusCoefficient: 1.0,
    };
  }

  // Helper methods

  private forwardPredict(state: number[], action: number): number[] {
    const model = this.curiosityState!.forwardModel;
    const input = [...state, action];
    const prediction: number[] = [];

    for (let i = 0; i < state.length; i++) {
      let sum = 0;
      for (let j = 0; j < input.length; j++) {
        const idx = (i * input.length + j) % model.length;
        sum += model[idx] * input[j];
      }
      prediction.push(Math.tanh(sum));
    }

    return prediction;
  }

  private inversePredict(state: number[], nextState: number[]): number {
    const model = this.curiosityState!.inverseModel;
    const input = [...state, ...nextState];

    let sum = 0;
    for (let i = 0; i < input.length; i++) {
      sum += model[i % model.length] * input[i];
    }

    return Math.tanh(sum);
  }

  private computePredictionError(predicted: number[], actual: number[]): number {
    let error = 0;
    for (let i = 0; i < predicted.length; i++) {
      error += Math.pow(predicted[i] - actual[i], 2);
    }
    return Math.sqrt(error / predicted.length);
  }

  private updateForwardModel(
    state: number[],
    action: number,
    nextState: number[],
    error: number
  ): void {
    const learningRate = 0.01;
    const input = [...state, action];

    for (let i = 0; i < this.curiosityState!.forwardModel.length; i++) {
      const gradient = error * input[i % input.length];
      this.curiosityState!.forwardModel[i] -= learningRate * gradient;
    }
  }

  private updateInverseModel(state: number[], nextState: number[], action: number): void {
    const learningRate = 0.01;
    const input = [...state, ...nextState];
    const predicted = this.inversePredict(state, nextState);
    const error = action - predicted;

    for (let i = 0; i < this.curiosityState!.inverseModel.length; i++) {
      const gradient = error * input[i % input.length];
      this.curiosityState!.inverseModel[i] += learningRate * gradient;
    }
  }

  private computeNovelty(state: number[]): number {
    const stateKey = this.stateToString(state);
    const existingNovelty = this.curiosityState!.noveltyScores.get(stateKey);

    if (existingNovelty !== undefined) {
      // Decay novelty over time
      return existingNovelty * this.config.decayRate!;
    }

    // New state is highly novel
    return 1.0;
  }

  private computeLearningProgress(): number {
    const errors = this.curiosityState!.predictionErrors;
    if (errors.length < 10) return 0;

    const recent = errors.slice(-10);
    const older = errors.slice(-20, -10);

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    return Math.max(0, olderAvg - recentAvg); // Positive if learning
  }

  private computeEmpowerment(state: number[]): number {
    // Simplified empowerment: diversity of reachable states
    // In practice, would require forward model simulations
    return 0.5 + Math.random() * 0.5;
  }

  private betaSample(alpha: number, beta: number): number {
    // Simplified beta sampling using ratio of gamma distributions
    const x = this.gammaSample(alpha, 1);
    const y = this.gammaSample(beta, 1);
    return x / (x + y);
  }

  private gammaSample(shape: number, scale: number): number {
    // Simplified gamma sampling using Marsaglia and Tsang's method
    if (shape < 1) {
      return this.gammaSample(shape + 1, scale) * Math.pow(Math.random(), 1 / shape);
    }

    const d = shape - 1 / 3;
    const c = 1 / Math.sqrt(9 * d);

    while (true) {
      let x, v;
      do {
        x = this.normalSample();
        v = 1 + c * x;
      } while (v <= 0);

      v = v * v * v;
      const u = Math.random();

      if (u < 1 - 0.0331 * x * x * x * x) {
        return d * v * scale;
      }

      if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
        return d * v * scale;
      }
    }
  }

  private normalSample(): number {
    // Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  private computeUCBCoverage(actionCounts: number[]): number {
    const total = actionCounts.reduce((a, b) => a + b, 0);
    if (total === 0) return 0;

    // Entropy-based coverage
    let entropy = 0;
    for (const count of actionCounts) {
      if (count > 0) {
        const p = count / total;
        entropy -= p * Math.log(p);
      }
    }

    return entropy / Math.log(actionCounts.length);
  }

  private computeThompsonCoverage(): number {
    if (!this.thompsonState) return 0;

    const variances = this.thompsonState.posteriorVariances;
    const avgVariance = variances.reduce((a, b) => a + b, 0) / variances.length;

    // Lower variance means better coverage
    return 1 / (1 + avgVariance);
  }

  private computeCoverageScore(): number {
    const uniqueStates = new Set(this.explorationHistory.map((e) => this.stateToString(e.state)))
      .size;

    return uniqueStates / (uniqueStates + 100); // Normalize
  }

  private argmax(arr: number[]): number {
    return arr.indexOf(Math.max(...arr));
  }

  private sampleFromDistribution(probs: number[]): number {
    const rand = Math.random();
    let cumulative = 0;

    for (let i = 0; i < probs.length; i++) {
      cumulative += probs[i];
      if (rand <= cumulative) {
        return i;
      }
    }

    return probs.length - 1;
  }

  private stateToString(state: number[]): string {
    return state.map((s) => s.toFixed(3)).join(",");
  }

  /**
   * Record exploration entry
   */
  recordExploration(entry: ExplorationEntry): void {
    this.explorationHistory.push(entry);
    this.currentStep++;
  }

  /**
   * Get exploration history
   */
  getHistory(): ExplorationEntry[] {
    return [...this.explorationHistory];
  }

  /**
   * Reset exploration state
   */
  reset(): void {
    this.ucbState = null;
    this.thompsonState = null;
    this.curiosityState = null;
    this.countState = null;
    this.explorationHistory = [];
    this.currentStep = 0;
  }
}
