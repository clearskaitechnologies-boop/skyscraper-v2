"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    content:
      "SkaiScraper has revolutionized our inspection process. What used to take hours now takes minutes, and our reports are more professional than ever.",
    author: {
      name: "Mike Johnson",
      role: "Owner, Johnson Roofing",
    },
    rating: 5,
  },
  {
    content:
      "The AI damage detection is incredibly accurate. It's caught things we might have missed and has improved our claim success rate significantly.",
    author: {
      name: "Sarah Chen",
      role: "Project Manager, Elite Roofing",
    },
    rating: 5,
  },
  {
    content:
      "Our customers love the detailed reports with photos and analysis. It's helped us build trust and win more projects.",
    author: {
      name: "David Rodriguez",
      role: "Estimator, Summit Contractors",
    },
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="bg-slate-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Trusted by trades professionals
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            See what our customers have to say about SkaiScraper
          </p>
        </motion.div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
            >
              <div className="mb-4 flex items-center gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <blockquote className="mb-6 text-slate-600">"{testimonial.content}"</blockquote>

              <div>
                <div className="font-semibold text-slate-900">{testimonial.author.name}</div>
                <div className="text-sm text-slate-500">{testimonial.author.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
