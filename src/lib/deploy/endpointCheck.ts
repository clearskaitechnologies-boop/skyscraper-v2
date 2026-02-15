// src/lib/deploy/endpointCheck.ts
// Helper for checking endpoint health status

export type EndpointStatus = {
  endpoint: string;
  status: "ok" | "auth-required" | "not-found" | "error" | "unreachable";
  statusCode: number | null;
  message?: string;
};

/**
 * Check endpoint health by making a HEAD request
 * Returns normalized status for UI display
 */
export async function checkEndpoint(
  baseUrl: string,
  endpoint: string,
  timeout: number = 10000
): Promise<EndpointStatus> {
  const url = `${baseUrl}${endpoint}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    const statusCode = response.status;

    // Determine status category
    if (statusCode === 200) {
      return {
        endpoint,
        status: "ok",
        statusCode,
        message: "Healthy",
      };
    } else if (statusCode === 401 || statusCode === 403) {
      return {
        endpoint,
        status: "auth-required",
        statusCode,
        message: "Exists (auth required)",
      };
    } else if (statusCode === 404) {
      return {
        endpoint,
        status: "not-found",
        statusCode,
        message: "Not deployed",
      };
    } else if (statusCode >= 500) {
      return {
        endpoint,
        status: "error",
        statusCode,
        message: `Server error (${statusCode})`,
      };
    } else {
      return {
        endpoint,
        status: "ok",
        statusCode,
        message: `Responding (${statusCode})`,
      };
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        endpoint,
        status: "unreachable",
        statusCode: null,
        message: "Timeout",
      };
    }

    return {
      endpoint,
      status: "unreachable",
      statusCode: null,
      message: error instanceof Error ? error.message : "Unreachable",
    };
  }
}

/**
 * Check multiple endpoints in parallel
 */
export async function checkEndpoints(
  baseUrl: string,
  endpoints: string[]
): Promise<EndpointStatus[]> {
  const checks = endpoints.map((endpoint) => checkEndpoint(baseUrl, endpoint));
  return Promise.all(checks);
}

/**
 * Get status emoji for UI display
 */
export function getStatusEmoji(status: EndpointStatus["status"]): string {
  switch (status) {
    case "ok":
      return "✅";
    case "auth-required":
      return "✅";
    case "not-found":
      return "❌";
    case "error":
      return "❌";
    case "unreachable":
      return "⚠️";
    default:
      return "❓";
  }
}

/**
 * Get status color for UI display
 */
export function getStatusColor(status: EndpointStatus["status"]): "green" | "yellow" | "red" {
  switch (status) {
    case "ok":
    case "auth-required":
      return "green";
    case "unreachable":
      return "yellow";
    case "not-found":
    case "error":
      return "red";
    default:
      return "yellow";
  }
}
