import React from "react";

import { withSmartErrorBoundary } from "./SmartErrorBoundary";

export { default as ApiErrorBoundary } from "./ApiErrorBoundary";
export { default as AuthErrorBoundary } from "./AuthErrorBoundary";
export { default as PaymentErrorBoundary } from "./PaymentErrorBoundary";
export {
  ErrorBoundaryWrapper,
  SmartErrorBoundary,
  withSmartErrorBoundary,
} from "./SmartErrorBoundary";

// Common error boundary configurations
export const errorBoundaryConfig = {
  // For authentication-related pages
  auth: { context: "auth" as const },

  // For payment and billing pages
  payment: { context: "payment" as const },

  // For API-heavy components
  api: { context: "api" as const },

  // General purpose
  general: { context: "general" as const },
};

// Pre-configured HOCs for common use cases
export const withAuthErrorBoundary = <P extends object>(Component: React.ComponentType<P>) =>
  withSmartErrorBoundary(Component, "auth");

export const withPaymentErrorBoundary = <P extends object>(Component: React.ComponentType<P>) =>
  withSmartErrorBoundary(Component, "payment");

export const withApiErrorBoundary = <P extends object>(Component: React.ComponentType<P>) =>
  withSmartErrorBoundary(Component, "api");
