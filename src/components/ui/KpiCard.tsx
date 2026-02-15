"use client";
import { motion } from "framer-motion";

import { card } from "@/lib/theme";

export default function KpiCard({
  title,
  value,
  sub,
  delay = 0,
}: {
  title: string;
  value: string;
  sub?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay }}
      className={`${card} p-4`}
    >
      <div className="text-sm text-slate-300">{title}</div>
      <div className="mt-1 text-3xl font-semibold text-sky-300">{value}</div>
      {sub && <div className="mt-2 text-xs text-slate-400">{sub}</div>}
    </motion.div>
  );
}
