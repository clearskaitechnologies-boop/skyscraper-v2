"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type BaseProps = {
  children: React.ReactNode;
  className?: string;
};

export const PageTitle = React.forwardRef<HTMLHeadingElement, BaseProps>(
  ({ children, className }, ref) => (
    <h1
      ref={ref}
      className={cn(
        "text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl",
        className
      )}
    >
      {children}
    </h1>
  )
);
PageTitle.displayName = "PageTitle";

export const SectionTitle = React.forwardRef<HTMLHeadingElement, BaseProps>(
  ({ children, className }, ref) => (
    <h2
      ref={ref}
      className={cn(
        "text-xl font-semibold leading-tight text-slate-900 dark:text-white md:text-2xl",
        className
      )}
    >
      {children}
    </h2>
  )
);
SectionTitle.displayName = "SectionTitle";

export const MetricValue = React.forwardRef<HTMLSpanElement, BaseProps>(
  ({ children, className }, ref) => (
    <span
      ref={ref}
      className={cn(
        "text-2xl font-extrabold tabular-nums text-slate-900 dark:text-white md:text-3xl",
        className
      )}
    >
      {children}
    </span>
  )
);
MetricValue.displayName = "MetricValue";

/**
 * Typography Primitives
 * ---------------------
 * PageTitle     Large page-level heading (h1) — use once per view.
 * SectionTitle  Section heading (h2) — use for major subdivisions.
 * MetricValue   Prominent numeric/value display — replaces ad hoc text-2xl font-bold spans.
 *
 * All primitives enforce consistent font sizing, weight, and high-contrast color via the design token `text-text-primary`.
 * Extend cautiously; prefer passing a `className` override instead of editing base styles.
 */
