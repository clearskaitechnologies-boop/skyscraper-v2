/**
 * TASK 165: CONFIGURATION MANAGEMENT
 *
 * Centralized configuration with versioning and rollback.
 */

import prisma from "@/lib/prisma";

export interface ConfigEntry {
  id: string;
  key: string;
  value: any;
  environment: string;
  version: number;
  createdAt: Date;
  createdBy: string;
}

/**
 * Set configuration
 */
export async function setConfig(
  key: string,
  value: any,
  environment: string = "production",
  userId: string
): Promise<number> {
  // Get current version
  const current = await prisma.configEntry.findFirst({
    where: { key, environment },
    orderBy: { version: "desc" },
  });

  const version = (current?.version || 0) + 1;

  await prisma.configEntry.create({
    data: {
      key,
      value: value as any,
      environment,
      version,
      createdBy: userId,
    } as any,
  });

  return version;
}

/**
 * Get configuration
 */
export async function getConfig<T = any>(
  key: string,
  environment: string = "production",
  version?: number
): Promise<T | null> {
  const where: any = { key, environment };

  if (version !== undefined) {
    where.version = version;
  }

  const config = await prisma.configEntry.findFirst({
    where,
    orderBy: { version: "desc" },
  });

  return config?.value as T | null;
}

/**
 * Get all configurations for environment
 */
export async function getAllConfigs(
  environment: string = "production"
): Promise<Record<string, any>> {
  const configs = await prisma.configEntry.findMany({
    where: { environment },
    orderBy: { version: "desc" },
    distinct: ["key"],
  });

  return configs.reduce(
    (acc, c) => {
      acc[c.key] = c.value;
      return acc;
    },
    {} as Record<string, any>
  );
}

/**
 * Delete configuration
 */
export async function deleteConfig(key: string, environment: string = "production"): Promise<void> {
  await prisma.configEntry.deleteMany({
    where: { key, environment },
  });
}

/**
 * Get configuration history
 */
export async function getConfigHistory(
  key: string,
  environment: string = "production",
  limit: number = 10
): Promise<ConfigEntry[]> {
  const history = await prisma.configEntry.findMany({
    where: { key, environment },
    orderBy: { version: "desc" },
    take: limit,
  });

  return history as any;
}

/**
 * Rollback configuration
 */
export async function rollbackConfig(
  key: string,
  toVersion: number,
  environment: string = "production",
  userId: string
): Promise<void> {
  const targetConfig = await prisma.configEntry.findFirst({
    where: { key, environment, version: toVersion },
  });

  if (!targetConfig) {
    throw new Error("Version not found");
  }

  await setConfig(key, targetConfig.value, environment, userId);
}

/**
 * Compare configurations across environments
 */
export async function compareEnvironments(
  key: string,
  env1: string = "staging",
  env2: string = "production"
): Promise<{
  env1Value: any;
  env2Value: any;
  isDifferent: boolean;
}> {
  const [config1, config2] = await Promise.all([getConfig(key, env1), getConfig(key, env2)]);

  return {
    env1Value: config1,
    env2Value: config2,
    isDifferent: JSON.stringify(config1) !== JSON.stringify(config2),
  };
}

/**
 * Sync configuration to environment
 */
export async function syncToEnvironment(
  key: string,
  fromEnv: string,
  toEnv: string,
  userId: string
): Promise<void> {
  const sourceValue = await getConfig(key, fromEnv);

  if (sourceValue === null) {
    throw new Error("Source configuration not found");
  }

  await setConfig(key, sourceValue, toEnv, userId);
}

/**
 * Bulk import configurations
 */
export async function bulkImportConfigs(
  configs: Record<string, any>,
  environment: string = "production",
  userId: string
): Promise<number> {
  let count = 0;

  for (const [key, value] of Object.entries(configs)) {
    await setConfig(key, value, environment, userId);
    count++;
  }

  return count;
}

/**
 * Export configurations
 */
export async function exportConfigs(
  environment: string = "production"
): Promise<Record<string, any>> {
  return getAllConfigs(environment);
}

/**
 * Watch configuration changes
 */
export async function* watchConfig(
  key: string,
  environment: string = "production"
): AsyncGenerator<any> {
  let lastVersion = 0;

  while (true) {
    const config = await prisma.configEntry.findFirst({
      where: { key, environment },
      orderBy: { version: "desc" },
    });

    if (config && config.version > lastVersion) {
      lastVersion = config.version;
      yield config.value;
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}
