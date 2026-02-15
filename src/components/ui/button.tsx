import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Button Component - Unified Design System
 *
 * VARIANTS:
 * - default:      Primary action (sky blue)
 * - primaryBubble: Pill-shaped CTA
 * - secondary:    Secondary/alternative actions (gray)
 * - outline:      Bordered, transparent bg
 * - ghost:        No border, no bg until hover
 * - destructive:  Danger/delete actions (red)
 * - success:      Confirmation/approve actions (green)
 * - warning:      Caution actions (amber)
 * - info:         Informational actions (blue)
 * - link:         Text-only link style
 *
 * SIZES: default | sm | lg | icon | xs
 *
 * USAGE: Always prefer <Button variant="..." size="..."> over raw Tailwind
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold shadow-sm transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white shadow-sm hover:bg-blue-700",
        primaryBubble:
          "rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 hover:shadow-xl active:bg-blue-700",
        secondary:
          "bg-slate-200 text-slate-700 shadow-sm hover:bg-slate-300 dark:bg-slate-700/60 dark:text-slate-200 dark:hover:bg-slate-700",
        outline:
          "border border-slate-300/40 bg-white/80 text-slate-900 shadow-sm hover:bg-slate-50 dark:border-slate-700/40 dark:bg-slate-900/70 dark:text-slate-50 dark:hover:bg-slate-800",
        ghost:
          "bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800",
        destructive: "bg-red-600 text-white shadow-sm hover:bg-red-700",
        success: "bg-green-600 text-white shadow-sm hover:bg-green-700",
        warning: "bg-amber-500 text-white shadow-sm hover:bg-amber-600",
        info: "bg-blue-600 text-white shadow-sm hover:bg-blue-700",
        link: "text-blue-600 underline-offset-4 hover:underline dark:text-blue-400",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        xs: "h-6 rounded-lg px-2 text-xs",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
