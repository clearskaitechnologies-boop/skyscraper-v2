import { LucideIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

import { cn } from "@/lib/utils";

interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  emoji?: string;
  variant?: "default" | "gradient-blue" | "gradient-purple" | "gradient-emerald";
  className?: string;
}

const variants = {
  default: "bg-white border-slate-200 hover:border-blue-300",
  "gradient-blue": "bg-gradient-to-br from-blue-600 to-indigo-600 border-blue-700 text-white",
  "gradient-purple": "bg-gradient-to-br from-purple-600 to-pink-600 border-purple-700 text-white",
  "gradient-emerald":
    "bg-gradient-to-br from-emerald-600 to-teal-600 border-emerald-700 text-white",
};

const iconBadgeVariants = {
  default: "bg-gradient-to-br from-blue-600 to-indigo-600",
  "gradient-blue": "bg-white/20 backdrop-blur-sm",
  "gradient-purple": "bg-white/20 backdrop-blur-sm",
  "gradient-emerald": "bg-white/20 backdrop-blur-sm",
};

export default function ActionCard({
  title,
  description,
  icon: Icon,
  href,
  onClick,
  emoji,
  variant = "default",
  className,
}: ActionCardProps) {
  const content = (
    <div
      className={cn(
        "group block rounded-xl border p-6 shadow-sm transition-all hover:scale-[1.02] hover:shadow-lg",
        variants[variant],
        className
      )}
    >
      <div className="mb-3 flex items-center gap-4">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-lg shadow-md",
            iconBadgeVariants[variant]
          )}
        >
          <Icon className={cn("h-6 w-6", variant === "default" ? "text-white" : "text-white")} />
        </div>
        <div
          className={cn(
            "flex items-center gap-2 text-xl font-semibold",
            variant === "default" ? "text-gray-900" : "text-white"
          )}
        >
          {title}
          {emoji && <span className="text-lg">{emoji}</span>}
        </div>
      </div>
      <p className={cn("text-sm", variant === "default" ? "text-gray-600" : "text-white/90")}>
        {description}
      </p>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left">
        {content}
      </button>
    );
  }

  return content;
}
