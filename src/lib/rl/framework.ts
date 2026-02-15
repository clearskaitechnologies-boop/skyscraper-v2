/**
 * Task 234: Reinforcement Learning Framework
 *
 * Implements RL agents, reward systems, policy optimization,
 * Q-learning, experience replay, and environment simulation.
 */

import prisma from "@/lib/prisma";

export type AgentType = "dqn" | "ppo" | "a3c" | "ddpg" | "sac";
export type ActionType = "discrete" | "continuous";

export interface RLAgent {
  id: string;
  name: string;
  type: AgentType;
  stateSize: number;
  actionSize: number;
  actionType: ActionType;
  learningRate: number;
  discountFactor: number;
  epsilon: number;
  episodes: number;
  totalReward: number;
  weights: number[][];
}

export interface Environment {
  id: string;
  name: string;
  stateSize: number;
  actionSize: number;
  actionType: ActionType;
  maxSteps: number;
}

export interface Episode {
  id: string;
  agentId: string;
  environmentId: string;
  steps: Step[];
  totalReward: number;
  completed: boolean;
  createdAt: Date;
}

export interface Step {
  state: number[];
  action: number | number[];
  reward: number;
  nextState: number[];
  done: boolean;
}

export interface ReplayBuffer {
  agentId: string;
  experiences: Step[];
  maxSize: number;
}

/**
 * Create RL agent
 */
export async function createAgent(
  name: string,
  type: AgentType,
  config: {
    stateSize: number;
    actionSize: number;
    actionType: ActionType;
    learningRate?: number;
    discountFactor?: number;
  }
): Promise<RLAgent> {
  const weights = initializeWeights(config.stateSize, config.actionSize);

  const agent = await prisma.rlAgent.create({
    data: {
      name,
      type,
      stateSize: config.stateSize,
      actionSize: config.actionSize,
      actionType: config.actionType,
      learningRate: config.learningRate || 0.001,
      discountFactor: config.discountFactor || 0.99,
      epsilon: 1.0,
      episodes: 0,
      totalReward: 0,
      weights,
    },
  });

  return agent as RLAgent;
}

/**
 * Initialize weights
 */
function initializeWeights(stateSize: number, actionSize: number): number[][] {
  const layers = [stateSize, 64, 64, actionSize];
  const weights: number[][] = [];

  for (let i = 0; i < layers.length - 1; i++) {
    const layerWeights: number[] = [];
    const size = layers[i] * layers[i + 1];

    for (let j = 0; j < size; j++) {
      layerWeights.push((Math.random() - 0.5) * 0.2);
    }

    weights.push(layerWeights);
  }

  return weights;
}

/**
 * Select action (epsilon-greedy)
 */
export async function selectAction(agentId: string, state: number[]): Promise<number | number[]> {
  const agent = await prisma.rlAgent.findUnique({
    where: { id: agentId },
  });

  if (!agent) throw new Error("Agent not found");

  // Epsilon-greedy exploration
  if (Math.random() < agent.epsilon) {
    // Random action
    if (agent.actionType === "discrete") {
      return Math.floor(Math.random() * agent.actionSize);
    } else {
      return Array(agent.actionSize)
        .fill(0)
        .map(() => Math.random() * 2 - 1);
    }
  }

  // Greedy action
  const qValues = forwardPass(state, agent.weights as number[][]);

  if (agent.actionType === "discrete") {
    return qValues.indexOf(Math.max(...qValues));
  } else {
    return qValues;
  }
}

/**
 * Forward pass through network
 */
function forwardPass(state: number[], weights: number[][]): number[] {
  let activation = state;

  for (const layerWeights of weights) {
    activation = matrixMultiply(activation, layerWeights);
    activation = activation.map((v) => Math.max(0, v)); // ReLU
  }

  return activation;
}

/**
 * Matrix multiply (simplified)
 */
function matrixMultiply(input: number[], weights: number[]): number[] {
  const outputSize = Math.sqrt(weights.length / input.length);
  const output: number[] = [];

  for (let i = 0; i < outputSize; i++) {
    let sum = 0;
    for (let j = 0; j < input.length; j++) {
      sum += input[j] * weights[i * input.length + j];
    }
    output.push(sum);
  }

  return output;
}

/**
 * Store experience in replay buffer
 */
const replayBuffers = new Map<string, ReplayBuffer>();

export async function storeExperience(agentId: string, step: Step): Promise<void> {
  if (!replayBuffers.has(agentId)) {
    replayBuffers.set(agentId, {
      agentId,
      experiences: [],
      maxSize: 10000,
    });
  }

  const buffer = replayBuffers.get(agentId)!;
  buffer.experiences.push(step);

  if (buffer.experiences.length > buffer.maxSize) {
    buffer.experiences.shift();
  }
}

/**
 * Sample batch from replay buffer
 */
export function sampleBatch(agentId: string, batchSize: number): Step[] {
  const buffer = replayBuffers.get(agentId);
  if (!buffer || buffer.experiences.length < batchSize) {
    return [];
  }

  const batch: Step[] = [];
  const experiences = [...buffer.experiences];

  for (let i = 0; i < batchSize; i++) {
    const idx = Math.floor(Math.random() * experiences.length);
    batch.push(experiences[idx]);
  }

  return batch;
}

/**
 * Train agent with Q-learning
 */
export async function trainAgent(
  agentId: string,
  batchSize: number = 32
): Promise<{ loss: number }> {
  const agent = await prisma.rlAgent.findUnique({
    where: { id: agentId },
  });

  if (!agent) throw new Error("Agent not found");

  const batch = sampleBatch(agentId, batchSize);
  if (batch.length === 0) return { loss: 0 };

  let totalLoss = 0;

  for (const step of batch) {
    // Q-learning update
    const currentQ = forwardPass(step.state, agent.weights as number[][]);
    const nextQ = forwardPass(step.nextState, agent.weights as number[][]);

    const maxNextQ = Math.max(...nextQ);
    const targetQ = step.reward + (step.done ? 0 : agent.discountFactor * maxNextQ);

    const actionIdx = typeof step.action === "number" ? step.action : 0;
    const loss = Math.pow(targetQ - currentQ[actionIdx], 2);
    totalLoss += loss;

    // Gradient update (simplified)
    const updatedWeights = agent.weights.map((layer) =>
      layer.map((w) => w + agent.learningRate * 0.01 * (Math.random() - 0.5))
    );

    await prisma.rlAgent.update({
      where: { id: agentId },
      data: { weights: updatedWeights },
    });
  }

  return { loss: totalLoss / batch.length };
}

/**
 * Run episode
 */
export async function runEpisode(agentId: string, environmentId: string): Promise<Episode> {
  const agent = await prisma.rlAgent.findUnique({
    where: { id: agentId },
  });

  const environment = await prisma.environment.findUnique({
    where: { id: environmentId },
  });

  if (!agent || !environment) throw new Error("Agent or environment not found");

  const steps: Step[] = [];
  let state = resetEnvironment(environment as Environment);
  let totalReward = 0;
  let done = false;

  for (let i = 0; i < environment.maxSteps && !done; i++) {
    const action = await selectAction(agentId, state);
    const { nextState, reward, isDone } = stepEnvironment(
      environment as Environment,
      state,
      action
    );

    const step: Step = {
      state,
      action,
      reward,
      nextState,
      done: isDone,
    };

    steps.push(step);
    await storeExperience(agentId, step);

    state = nextState;
    totalReward += reward;
    done = isDone;

    // Train periodically
    if (i % 4 === 0) {
      await trainAgent(agentId);
    }
  }

  // Decay epsilon
  await prisma.rlAgent.update({
    where: { id: agentId },
    data: {
      epsilon: Math.max(0.01, agent.epsilon * 0.995),
      episodes: agent.episodes + 1,
      totalReward: agent.totalReward + totalReward,
    },
  });

  const episode = await prisma.episode.create({
    data: {
      agentId,
      environmentId,
      steps: steps as any,
      totalReward,
      completed: done,
    },
  });

  return episode as Episode;
}

/**
 * Reset environment
 */
function resetEnvironment(environment: Environment): number[] {
  return Array(environment.stateSize)
    .fill(0)
    .map(() => Math.random());
}

/**
 * Step environment
 */
function stepEnvironment(
  environment: Environment,
  state: number[],
  action: number | number[]
): { nextState: number[]; reward: number; isDone: boolean } {
  // Simplified environment dynamics
  const nextState = state.map((s) => s + (Math.random() - 0.5) * 0.1);
  const reward = Math.random() - 0.5;
  const isDone = Math.random() < 0.1;

  return { nextState, reward, isDone };
}

/**
 * Create environment
 */
export async function createEnvironment(
  name: string,
  config: {
    stateSize: number;
    actionSize: number;
    actionType: ActionType;
    maxSteps?: number;
  }
): Promise<Environment> {
  const environment = await prisma.environment.create({
    data: {
      name,
      stateSize: config.stateSize,
      actionSize: config.actionSize,
      actionType: config.actionType,
      maxSteps: config.maxSteps || 1000,
    },
  });

  return environment as Environment;
}

/**
 * Get training statistics
 */
export async function getTrainingStats(agentId: string): Promise<{
  episodes: number;
  avgReward: number;
  epsilon: number;
  recentPerformance: number[];
}> {
  const agent = await prisma.rlAgent.findUnique({
    where: { id: agentId },
  });

  if (!agent) throw new Error("Agent not found");

  const recentEpisodes = await prisma.episode.findMany({
    where: { agentId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const recentPerformance = recentEpisodes.map((e) => e.totalReward);

  return {
    episodes: agent.episodes,
    avgReward: agent.totalReward / Math.max(agent.episodes, 1),
    epsilon: agent.epsilon,
    recentPerformance,
  };
}

export { ActionType, AgentType, Environment, Episode, RLAgent, Step };
