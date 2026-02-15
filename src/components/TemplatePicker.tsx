"use client";
import { collection, getDocs } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { db } from "@/lib/firebase";
import { functions } from "@/lib/firebase";

interface PresetData {
  id: string;
  label: string;
  description?: string;
}

export default function TemplatePicker() {
  const [presets, setPresets] = useState<PresetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState<string | null>(null);

  // For demo purposes - replace with real auth
  const uid =
    typeof window !== "undefined" ? localStorage.getItem("uid") || "demo-user" : "demo-user";

  useEffect(() => {
    fetchPresets();
  }, [uid]);

  async function fetchPresets() {
    try {
      const snap = await getDocs(collection(db, "users", uid, "layoutPresets"));
      setPresets(
        snap.docs.map((d) => ({
          id: d.id,
          label: d.data().label || d.id,
          description: getPresetDescription(d.id),
        }))
      );
    } catch (error) {
      console.log("No presets found, using defaults");
      setPresets([
        {
          id: "insuranceClaim",
          label: "Insurance Claim Packet",
          description:
            "Complete claim packet with damage assessment, weather verification, and recommendations",
        },
        {
          id: "retailProject",
          label: "Retail Project Packet",
          description:
            "Professional project proposal with materials, estimate, and financing options",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function getPresetDescription(id: string): string {
    const descriptions: Record<string, string> = {
      insuranceClaim:
        "Complete claim packet with damage assessment, weather verification, and recommendations",
      retailProject:
        "Professional project proposal with materials, estimate, and financing options",
    };
    return descriptions[id] || "Custom packet template";
  }

  async function buildPacket(layoutKey: string) {
    setBuilding(layoutKey);
    try {
      const fn = httpsCallable(functions, "buildPacket");

      // Sample payload data - in production this would come from your project data
      const payload = {
        client: {
          name: "John & Jane Homeowner",
          address: "20158 E Mesa Verde Rd, Mayer, AZ 86333",
        },
        overviewText:
          "Comprehensive roof inspection and damage assessment following recent weather event.",
        summary:
          "AI-powered inspection detected significant hail damage across multiple roof areas requiring immediate attention.",
        damageText:
          "• Hail impacts circled in annotated photos\n• Wind-lifted tabs and missing shingles detected\n• Granule loss consistent with 2+ inch hail\n• Valley metal shows impact marks",
        weather: {
          dol: "07/21/2024",
          hail: '2.00"',
          wind: "65 mph",
        },
        weatherSummary:
          "Severe thunderstorm cell produced golf ball-sized hail and damaging winds. NOAA confirms storm path over property.",
        codes:
          "IRC R905.1.2 – Ice & Water Protection Required\nLocal City Ordinance 12-45 – Roof Deck Fastening Standards\nBuilding Code 2021 IBC Chapter 15 – Roof Assemblies",
        recommendations:
          "Complete roof replacement recommended due to extensive wind and hail damage. Current system compromised beyond economical repair.",
        mockupUrl: "", // Will be populated when AI mockup is generated
        materialSpecs: {
          system: "Asphalt Shingle – Class 4 Impact Resistant",
          manufacturer: "GAF Timberline HDZ",
          color: "Charcoal",
          underlayment: "Synthetic + Ice & Water Shield",
          ventilation: "Ridge vent w/ matching caps",
          accessories: "Starter, drip edge, pipe jacks, valley metal",
        },
        brochureUrls: [], // Vendor product images
        estimate: {
          items: [
            {
              code: "RFG 300",
              desc: "Remove & Replace Shingles (SQ)",
              qty: 28.5,
              price: 345.0,
            },
            {
              code: "RFG 220",
              desc: "Starter Course (LF)",
              qty: 280,
              price: 2.6,
            },
            { code: "RFG 221", desc: "Ridge Cap (LF)", qty: 160, price: 4.25 },
            {
              code: "RFG 105",
              desc: "Ice & Water Shield (SQ)",
              qty: 8,
              price: 125.0,
            },
            {
              code: "RFG 110",
              desc: "Synthetic Underlayment (SQ)",
              qty: 30,
              price: 45.0,
            },
          ],
          taxRate: 0.085,
        },
        finance: {
          paymentType: "Cash/Finance Options Available",
          provider: "Synchrony Home / Wisetack",
          terms: "12–60 months available; no prepayment penalty",
          downPayment: "Varies by program",
        },
        fileName: `${layoutKey}_Packet.pdf`,
      };

      console.log("Building packet:", { userId: uid, layoutKey, payload });

      // For now, we'll simulate the packet building since functions need to be deployed
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate success - replace with actual function call when deployed
      // const res: any = await fn({ userId: uid, layoutKey, payload })
      // window.open(res.data.url, '_blank')

      alert(
        `${
          presets.find((p) => p.id === layoutKey)?.label
        } packet would be generated here!\n\nTo complete setup:\n1. Deploy Firebase Functions\n2. Enable the buildPacket callable\n3. This will generate a full PDF`
      );
    } catch (error) {
      console.error("Error building packet:", error);
      alert("Error building packet. Please ensure Firebase Functions are deployed.");
    } finally {
      setBuilding(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#147BFF] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold text-[#081A2F]">Build Professional Packets</h2>
        <p className="text-neutral-600">
          Generate complete, branded PDFs for insurance claims or retail projects
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {presets.map((preset, index) => (
          <motion.div
            key={preset.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <button
              onClick={() => buildPacket(preset.id)}
              disabled={building !== null}
              className="group w-full rounded-2xl border border-neutral-200 bg-white p-6 text-left transition-all duration-200 hover:border-[#147BFF]/30 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-accent transition-transform group-hover:scale-110">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                {building === preset.id && (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#147BFF] border-t-transparent"></div>
                )}
              </div>

              <h3 className="mb-2 text-lg font-semibold text-neutral-900 transition-colors group-hover:text-[#147BFF]">
                {preset.label}
              </h3>

              <p className="text-sm leading-relaxed text-neutral-600">{preset.description}</p>

              <div className="mt-4 border-t border-neutral-100 pt-4">
                <span className="text-xs font-medium uppercase tracking-wide text-[#147BFF]">
                  Click to Generate PDF
                </span>
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      {presets.length === 0 && (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
            <svg
              className="h-8 w-8 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium text-neutral-900">No Templates Available</h3>
          <p className="text-neutral-600">Deploy Firebase Functions to enable packet generation</p>
        </div>
      )}
    </div>
  );
}
