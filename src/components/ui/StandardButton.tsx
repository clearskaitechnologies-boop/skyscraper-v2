import { Loader2 } from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils";

export interface StandardButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "ghost"
    | "outline"
    | "purple"
    | "indigo"
    | "cyan";
  size?: "sm" | "md" | "lg";
  gradient?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

/**
 * StandardButton - Unified button component for SkaiScraper platform
 *
 * Usage:
 * <StandardButton variant="primary" size="md">Click me</StandardButton>
 * <StandardButton variant="success" gradient>Save Changes</StandardButton>
 * <StandardButton variant="ghost" size="sm">Cancel</StandardButton>
 */
export function StandardButton({
  variant = "primary",
  size = "md",
  gradient = false,
  loading = false,
  className,
  children,
  disabled,
  ...props
}: StandardButtonProps) {
  // Base styles
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  // Size variants
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  // Variant styles with design tokens
  const variantStyles = {
    primary: gradient
      ? "bg-gradient-primary text-white shadow-lg hover:opacity-95"
      : "bg-primary text-primary-foreground shadow hover:bg-primary/90",
    secondary: gradient
      ? "bg-gradient-blue text-white shadow-lg hover:opacity-95"
      : "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
    success: gradient
      ? "bg-gradient-success text-white shadow-lg hover:opacity-95"
      : "bg-success text-success-foreground shadow-sm hover:bg-success/90",
    danger: gradient
      ? "bg-gradient-error text-white shadow-lg hover:opacity-95"
      : "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
    purple: gradient
      ? "bg-gradient-purple text-white shadow-lg hover:opacity-95"
      : "bg-purple-600 text-white shadow-sm hover:bg-purple-700",
    indigo: gradient
      ? "bg-gradient-indigo text-white shadow-lg hover:opacity-95"
      : "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700",
    cyan: gradient
      ? "bg-gradient-cyan text-white shadow-lg hover:opacity-95"
      : "bg-cyan-600 text-white shadow-sm hover:bg-cyan-700",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  };

  return (
    <button
      className={cn(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        loading && "cursor-wait",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
