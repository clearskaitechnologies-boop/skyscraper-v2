// ============================================================================
// API RESPONSE HELPERS
// Standardized JSON responses for trades microservice
// ============================================================================

export function successResponse<T>(data: T, status = 200) {
  return Response.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}

export function validationError(message: string) {
  return errorResponse(`Validation error: ${message}`, 400);
}

export function unauthorizedError(message = "Unauthorized - Invalid or missing service token") {
  return errorResponse(message, 401);
}

export function notFoundError(resource: string) {
  return errorResponse(`${resource} not found`, 404);
}

export function serverError(message = "Internal server error") {
  console.error("[Server Error]", message);
  return errorResponse(message, 500);
}
