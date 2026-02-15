/**
 * Task 198: Reactive Systems Architecture
 *
 * Implements reactive programming patterns for responsive, resilient systems.
 * Provides observables, backpressure, circuit breakers, and reactive streams.
 */

import prisma from "@/lib/prisma";

export type CircuitState = "closed" | "open" | "half-open";

export interface Observable<T> {
  subscribe(observer: Observer<T>): Subscription;
}

export interface Observer<T> {
  next: (value: T) => void;
  error?: (error: Error) => void;
  complete?: () => void;
}

export interface Subscription {
  unsubscribe: () => void;
}

export interface CircuitBreaker {
  id: string;
  name: string;
  state: CircuitState;
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  failureCount: number;
  successCount: number;
  lastFailure?: Date;
  nextRetry?: Date;
}

export interface BackpressureConfig {
  strategy: "drop" | "buffer" | "latest";
  bufferSize?: number;
}

export interface ReactiveStream<T> {
  id: string;
  name: string;
  backpressure: BackpressureConfig;
  subscribers: number;
  itemsEmitted: number;
  itemsDropped: number;
}

/**
 * Create observable from array
 */
export function fromArray<T>(items: T[]): Observable<T> {
  return {
    subscribe(observer: Observer<T>): Subscription {
      let cancelled = false;

      // Emit items asynchronously
      (async () => {
        for (const item of items) {
          if (cancelled) break;
          observer.next(item);
        }
        if (!cancelled && observer.complete) {
          observer.complete();
        }
      })();

      return {
        unsubscribe: () => {
          cancelled = true;
        },
      };
    },
  };
}

/**
 * Create observable from event emitter
 */
export function fromEvents<T>(eventName: string, emitter: any): Observable<T> {
  return {
    subscribe(observer: Observer<T>): Subscription {
      const handler = (data: T) => observer.next(data);
      emitter.on(eventName, handler);

      return {
        unsubscribe: () => {
          emitter.off(eventName, handler);
        },
      };
    },
  };
}

/**
 * Map operator
 */
export function map<T, R>(source: Observable<T>, transform: (value: T) => R): Observable<R> {
  return {
    subscribe(observer: Observer<R>): Subscription {
      return source.subscribe({
        next: (value) => observer.next(transform(value)),
        error: observer.error,
        complete: observer.complete,
      });
    },
  };
}

/**
 * Filter operator
 */
export function filter<T>(source: Observable<T>, predicate: (value: T) => boolean): Observable<T> {
  return {
    subscribe(observer: Observer<T>): Subscription {
      return source.subscribe({
        next: (value) => {
          if (predicate(value)) {
            observer.next(value);
          }
        },
        error: observer.error,
        complete: observer.complete,
      });
    },
  };
}

/**
 * Debounce operator
 */
export function debounce<T>(source: Observable<T>, delay: number): Observable<T> {
  return {
    subscribe(observer: Observer<T>): Subscription {
      let timeout: NodeJS.Timeout | null = null;
      let lastValue: T;

      const subscription = source.subscribe({
        next: (value) => {
          lastValue = value;
          if (timeout) clearTimeout(timeout);

          timeout = setTimeout(() => {
            observer.next(lastValue);
          }, delay);
        },
        error: observer.error,
        complete: () => {
          if (timeout) clearTimeout(timeout);
          if (observer.complete) observer.complete();
        },
      });

      return {
        unsubscribe: () => {
          if (timeout) clearTimeout(timeout);
          subscription.unsubscribe();
        },
      };
    },
  };
}

/**
 * Throttle operator
 */
export function throttle<T>(source: Observable<T>, interval: number): Observable<T> {
  return {
    subscribe(observer: Observer<T>): Subscription {
      let lastEmit = 0;

      return source.subscribe({
        next: (value) => {
          const now = Date.now();
          if (now - lastEmit >= interval) {
            lastEmit = now;
            observer.next(value);
          }
        },
        error: observer.error,
        complete: observer.complete,
      });
    },
  };
}

/**
 * Merge multiple observables
 */
export function merge<T>(...sources: Observable<T>[]): Observable<T> {
  return {
    subscribe(observer: Observer<T>): Subscription {
      const subscriptions = sources.map((source) =>
        source.subscribe({
          next: observer.next,
          error: observer.error,
        })
      );

      let completedCount = 0;
      subscriptions.forEach((sub, index) => {
        sources[index].subscribe({
          complete: () => {
            completedCount++;
            if (completedCount === sources.length && observer.complete) {
              observer.complete();
            }
          },
        });
      });

      return {
        unsubscribe: () => {
          subscriptions.forEach((sub) => sub.unsubscribe());
        },
      };
    },
  };
}

/**
 * Create circuit breaker
 */
export async function createCircuitBreaker(
  name: string,
  config: {
    failureThreshold?: number;
    successThreshold?: number;
    timeout?: number;
  } = {}
): Promise<CircuitBreaker> {
  const breaker = await prisma.circuitBreaker.create({
    data: {
      name,
      state: "closed",
      failureThreshold: config.failureThreshold || 5,
      successThreshold: config.successThreshold || 2,
      timeout: config.timeout || 60000, // 60 seconds
      failureCount: 0,
      successCount: 0,
    },
  });

  return breaker as CircuitBreaker;
}

/**
 * Execute through circuit breaker
 */
export async function executeWithCircuitBreaker<T>(
  breakerId: string,
  fn: () => Promise<T>
): Promise<T> {
  const breaker = await prisma.circuitBreaker.findUnique({
    where: { id: breakerId },
  });

  if (!breaker) {
    throw new Error("Circuit breaker not found");
  }

  // Check circuit state
  if (breaker.state === "open") {
    // Check if we should try again
    if (breaker.nextRetry && new Date() < breaker.nextRetry) {
      throw new Error("Circuit breaker is open");
    }

    // Move to half-open
    await prisma.circuitBreaker.update({
      where: { id: breakerId },
      data: { state: "half-open" },
    });
  }

  try {
    // Execute function
    const result = await fn();

    // Record success
    await recordSuccess(breakerId);

    return result;
  } catch (error) {
    // Record failure
    await recordFailure(breakerId);
    throw error;
  }
}

/**
 * Record success in circuit breaker
 */
async function recordSuccess(breakerId: string): Promise<void> {
  const breaker = await prisma.circuitBreaker.findUnique({
    where: { id: breakerId },
  });

  if (!breaker) return;

  const newSuccessCount = breaker.successCount + 1;

  // Check if we should close the circuit
  if (breaker.state === "half-open" && newSuccessCount >= breaker.successThreshold) {
    await prisma.circuitBreaker.update({
      where: { id: breakerId },
      data: {
        state: "closed",
        successCount: 0,
        failureCount: 0,
      },
    });
  } else {
    await prisma.circuitBreaker.update({
      where: { id: breakerId },
      data: { successCount: newSuccessCount },
    });
  }
}

/**
 * Record failure in circuit breaker
 */
async function recordFailure(breakerId: string): Promise<void> {
  const breaker = await prisma.circuitBreaker.findUnique({
    where: { id: breakerId },
  });

  if (!breaker) return;

  const newFailureCount = breaker.failureCount + 1;
  const now = new Date();

  // Check if we should open the circuit
  if (newFailureCount >= breaker.failureThreshold) {
    const nextRetry = new Date(now.getTime() + breaker.timeout);

    await prisma.circuitBreaker.update({
      where: { id: breakerId },
      data: {
        state: "open",
        failureCount: 0,
        lastFailure: now,
        nextRetry,
      },
    });
  } else {
    await prisma.circuitBreaker.update({
      where: { id: breakerId },
      data: {
        failureCount: newFailureCount,
        lastFailure: now,
      },
    });
  }
}

/**
 * Create reactive stream
 */
export async function createReactiveStream<T>(
  name: string,
  backpressure: BackpressureConfig
): Promise<ReactiveStream<T>> {
  const stream = await prisma.reactiveStream.create({
    data: {
      name,
      backpressure,
      subscribers: 0,
      itemsEmitted: 0,
      itemsDropped: 0,
    },
  });

  return stream as ReactiveStream<T>;
}

/**
 * Buffer with backpressure
 */
export class BackpressureBuffer<T> {
  private buffer: T[] = [];
  private observers: Observer<T>[] = [];
  private config: BackpressureConfig;

  constructor(config: BackpressureConfig) {
    this.config = config;
  }

  push(item: T): boolean {
    switch (this.config.strategy) {
      case "drop":
        // Drop if buffer full
        if (this.buffer.length >= (this.config.bufferSize || 100)) {
          return false;
        }
        break;

      case "buffer":
        // Block/wait if buffer full (in async context)
        if (this.buffer.length >= (this.config.bufferSize || 100)) {
          return false;
        }
        break;

      case "latest":
        // Keep only latest items
        if (this.buffer.length >= (this.config.bufferSize || 100)) {
          this.buffer.shift();
        }
        break;
    }

    this.buffer.push(item);
    this.emit();
    return true;
  }

  subscribe(observer: Observer<T>): Subscription {
    this.observers.push(observer);

    return {
      unsubscribe: () => {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
          this.observers.splice(index, 1);
        }
      },
    };
  }

  private emit(): void {
    while (this.buffer.length > 0 && this.observers.length > 0) {
      const item = this.buffer.shift()!;
      this.observers.forEach((observer) => observer.next(item));
    }
  }
}

/**
 * Retry operator with exponential backoff
 */
export function retry<T>(
  source: Observable<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Observable<T> {
  return {
    subscribe(observer: Observer<T>): Subscription {
      let retries = 0;
      let subscription: Subscription;

      const attempt = () => {
        subscription = source.subscribe({
          next: observer.next,
          error: (error) => {
            if (retries < maxRetries) {
              retries++;
              const backoffDelay = delay * Math.pow(2, retries - 1);

              setTimeout(() => {
                attempt();
              }, backoffDelay);
            } else {
              if (observer.error) observer.error(error);
            }
          },
          complete: observer.complete,
        });
      };

      attempt();

      return {
        unsubscribe: () => {
          subscription?.unsubscribe();
        },
      };
    },
  };
}

/**
 * Get circuit breaker status
 */
export async function getCircuitBreakerStatus(breakerId: string): Promise<CircuitBreaker> {
  const breaker = await prisma.circuitBreaker.findUnique({
    where: { id: breakerId },
  });

  if (!breaker) {
    throw new Error("Circuit breaker not found");
  }

  return breaker as CircuitBreaker;
}

/**
 * Reset circuit breaker
 */
export async function resetCircuitBreaker(breakerId: string): Promise<void> {
  await prisma.circuitBreaker.update({
    where: { id: breakerId },
    data: {
      state: "closed",
      failureCount: 0,
      successCount: 0,
      lastFailure: null,
      nextRetry: null,
    },
  });
}

/**
 * Get all circuit breakers
 */
export async function getAllCircuitBreakers(): Promise<CircuitBreaker[]> {
  const breakers = await prisma.circuitBreaker.findMany();
  return breakers as CircuitBreaker[];
}
