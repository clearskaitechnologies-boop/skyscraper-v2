"use client";
import { motion } from "framer-motion";

import { card } from "@/lib/theme";

export default function MotionSection({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay }}
      className={`${card} p-4`}
    >
      <div className="mb-2 font-medium text-slate-200">{title}</div>
      {children}
    </motion.section>
  );
}
