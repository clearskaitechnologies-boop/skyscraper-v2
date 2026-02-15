"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import GlassCard from "@/components/ui/GlassCard";

export default function JoinClientNetworkPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    zipCode: "",
    tradeNeeded: "",
    description: "",
    urgency: "standard",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/client-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit inquiry");
      }

      // Success - redirect to confirmation
      router.push("/network/join-client/thank-you");
    } catch (error) {
      console.error("Error submitting client lead:", error);
      alert("Failed to submit your inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-[var(--background)] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent mb-4">
            Find Your Perfect Contractor
          </h1>
          <p className="text-slate-700 dark:text-slate-700 dark:text-slate-300 text-lg">
            Connect with verified, licensed professionals in your area
          </p>
        </div>

        <GlassCard>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-[color:var(--text)] mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[color:var(--text)] mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-semibold text-[color:var(--text)] mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="zipCode" className="block text-sm font-semibold text-[color:var(--text)] mb-2">
                ZIP Code *
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                required
                value={formData.zipCode}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="12345"
                maxLength={10}
              />
            </div>

            <div>
              <label htmlFor="tradeNeeded" className="block text-sm font-semibold text-[color:var(--text)] mb-2">
                Type of Contractor Needed *
              </label>
              <select
                id="tradeNeeded"
                name="tradeNeeded"
                required
                value={formData.tradeNeeded}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Select a trade...</option>
                <option value="Roofing">Roofing</option>
                <option value="Siding">Siding</option>
                <option value="Windows & Doors">Windows & Doors</option>
                <option value="HVAC">HVAC</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Flooring">Flooring</option>
                <option value="Painting">Painting</option>
                <option value="Kitchen & Bath">Kitchen & Bath</option>
                <option value="General Contractor">General Contractor</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="urgency" className="block text-sm font-semibold text-[color:var(--text)] mb-2">
                Timeline *
              </label>
              <select
                id="urgency"
                name="urgency"
                required
                value={formData.urgency}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="immediate">Immediate (Within 1 week)</option>
                <option value="urgent">Urgent (1-2 weeks)</option>
                <option value="standard">Standard (2-4 weeks)</option>
                <option value="flexible">Flexible (1+ months)</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-[color:var(--text)] mb-2">
                Project Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Tell us about your project..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl font-bold text-lg hover:scale-[1.02] transition shadow-[var(--glow)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Find Contractors"}
            </button>

            <p className="text-center text-sm text-slate-700 dark:text-slate-700 dark:text-slate-300">
              By submitting this form, you agree to be contacted by verified contractors.
            </p>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
