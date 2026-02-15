import * as React from "react";

import { cn } from "@/lib/utils";

export interface PageSubtitleProps extends React.HTMLAttributes<HTMLParagraphElement> {}

/**
 * PageSubtitle Component
 * Consistent secondary/helper text styling for light backgrounds
 * Uses text-slate-500 for optimal readability on white/light cards
 */
export function PageSubtitle({ className, ...props }: PageSubtitleProps) {
  return (
    <p
      className={cn("text-sm leading-snug text-slate-600 dark:text-slate-400", className)}
      {...props}
    />
  );
}

export interface PageTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3";
}

/**
 * PageTitle Component
 * Consistent page title styling
 */
export function PageTitle({ className, as: Component = "h1", ...props }: PageTitleProps) {
  return (
    <Component
      className={cn("text-3xl font-bold tracking-tight text-foreground md:text-4xl", className)}
      {...props}
    />
  );
}

export interface SectionHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h2" | "h3" | "h4";
}

/**
 * SectionHeading Component
 * Consistent section heading styling
 */
export function SectionHeading({ className, as: Component = "h2", ...props }: SectionHeadingProps) {
  return (
    <Component
      className={cn("text-xl font-semibold tracking-tight text-foreground md:text-2xl", className)}
      {...props}
    />
  );
}
