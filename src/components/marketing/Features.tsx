"use client";

import { motion } from "framer-motion";
import { BarChart3, Camera, Check, Cloud, Cpu, FileText } from "lucide-react";

const features = [
  {
    name: "AI Scope Analysis",
    description:
      "Advanced computer vision technology automatically analyzes job site photos — from storm damage to retail renovations.",
    icon: Cpu,
  },
  {
    name: "Instant Proposal Generation",
    description:
      "Generate professional proposals and project docs in minutes, not hours. Complete with photos and detailed breakdowns.",
    icon: FileText,
  },
  {
    name: "Smart Photo Management",
    description:
      "Organize and categorize thousands of photos with AI-powered tagging and scope detection.",
    icon: Camera,
  },
  {
    name: "Complete CRM",
    description:
      "Manage leads, projects, and jobs all in one place. Track progress from first contact to final payment.",
    icon: BarChart3,
  },
  {
    name: "Cloud Storage",
    description:
      "Secure cloud storage for all your projects, accessible anywhere. Never lose important documentation.",
    icon: Cloud,
  },
  {
    name: "Pro-Ready Output",
    description:
      "Documentation meets industry standards and insurance requirements. Built for modern trades professionals.",
    icon: Check,
  },
];

export default function Features() {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Everything you need for the modern trades operation
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            SkaiScraper provides all the tools you need to modernize your trades business and
            deliver exceptional results — whether it's claims, retail, or out-of-pocket work.
          </p>
        </motion.div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="flex flex-col"
              >
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                  <feature.icon className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
