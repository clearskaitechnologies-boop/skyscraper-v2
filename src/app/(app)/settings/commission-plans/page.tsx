"use client";

import {
  BadgeDollarSign,
  Check,
  Layers,
  Percent,
  Plus,
  Settings,
  Star,
  Trash2,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { COMMISSION_PRESETS } from "@/lib/finance/commissionEngine";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  ruleType: string;
  structure: any;
  isActive: boolean;
  isDefault: boolean;
  appliesTo: string;
  userIds: string[];
  createdAt: string;
}

const ruleTypeLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  percentage_revenue: {
    label: "% Revenue",
    icon: <Percent className="h-4 w-4" />,
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  profit_share: {
    label: "Profit Share",
    icon: <TrendingUp className="h-4 w-4" />,
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  tiered: {
    label: "Tiered",
    icon: <Layers className="h-4 w-4" />,
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  flat_bonus: {
    label: "Flat Bonus",
    icon: <BadgeDollarSign className="h-4 w-4" />,
    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  hybrid: {
    label: "Hybrid",
    icon: <Zap className="h-4 w-4" />,
    color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
};

export default function CommissionPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/finance/commission-plans");
      const data = await res.json();
      if (data.success) setPlans(data.data);
    } catch (e) {
      console.error("Failed to fetch plans:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const createFromPreset = async (presetKey: string) => {
    const preset = COMMISSION_PRESETS[presetKey];
    if (!preset) return;
    setSaving(true);
    try {
      const res = await fetch("/api/finance/commission-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customName || preset.name,
          description: preset.description,
          ruleType: preset.ruleType,
          structure: preset.structure,
          isDefault: plans.length === 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreate(false);
        setSelectedPreset(null);
        setCustomName("");
        fetchPlans();
      }
    } catch (e) {
      console.error("Failed to create plan:", e);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (planId: string, currentActive: boolean) => {
    try {
      await fetch(`/api/finance/commission-plans/${planId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      fetchPlans();
    } catch (e) {
      console.error("Failed to toggle plan:", e);
    }
  };

  const setDefault = async (planId: string) => {
    try {
      await fetch(`/api/finance/commission-plans/${planId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      fetchPlans();
    } catch (e) {
      console.error("Failed to set default:", e);
    }
  };

  const deletePlan = async (planId: string) => {
    if (!confirm("Delete this commission plan?")) return;
    try {
      await fetch(`/api/finance/commission-plans/${planId}`, { method: "DELETE" });
      fetchPlans();
    } catch (e) {
      console.error("Failed to delete plan:", e);
    }
  };

  const describeStructure = (ruleType: string, structure: any): string => {
    switch (ruleType) {
      case "percentage_revenue":
        return `${(structure.rate * 100).toFixed(1)}% of total revenue`;
      case "profit_share":
        return `${(structure.rate * 100).toFixed(0)}% share after ${(structure.overheadPct * 100).toFixed(0)}% overhead`;
      case "tiered":
        return structure.tiers
          ?.map(
            (t: any) =>
              `${(t.rate * 100).toFixed(0)}% ($${(t.min / 1000).toFixed(0)}k–${t.max ? `$${(t.max / 1000).toFixed(0)}k` : "∞"})`
          )
          .join(", ");
      case "flat_bonus":
        return `$${structure.amount?.toLocaleString()} per ${structure.trigger?.replace(/_/g, " ")}`;
      case "hybrid":
        return `${(structure.baseRate * 100).toFixed(0)}% base + ${structure.profitShareRate ? `${(structure.profitShareRate * 100).toFixed(0)}% profit share` : "bonuses"}`;
      default:
        return "Custom";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHero
        section="settings"
        title="Commission Plans"
        subtitle="Configure how your sales reps earn commissions — supports 10/50, 10/60, 10/70, tiered, bonus, and hybrid structures"
        icon={<Settings className="h-6 w-6" />}
      >
        <Button
          onClick={() => setShowCreate(!showCreate)}
          className="gap-2 bg-white/20 hover:bg-white/30"
        >
          <Plus className="h-4 w-4" /> New Plan
        </Button>
      </PageHero>

      {/* Create Plan Panel */}
      {showCreate && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6 dark:border-blue-800/40 dark:bg-blue-950/20">
          <h3 className="mb-4 text-lg font-semibold text-[color:var(--text)]">
            Choose a Commission Structure
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(COMMISSION_PRESETS).map(([key, preset]) => {
              const meta = ruleTypeLabels[preset.ruleType];
              return (
                <button
                  key={key}
                  onClick={() => setSelectedPreset(key)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    selectedPreset === key
                      ? "border-blue-500 bg-blue-100/50 ring-2 ring-blue-500/30 dark:bg-blue-900/30"
                      : "border-[color:var(--border)] bg-[var(--surface-glass)] hover:border-blue-300"
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`rounded-lg p-1.5 ${meta?.color ?? ""}`}>{meta?.icon}</span>
                    <span className="font-semibold text-[color:var(--text)]">{preset.name}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{preset.description}</p>
                </button>
              );
            })}
          </div>

          {selectedPreset && (
            <div className="mt-4 flex items-center gap-3">
              <input
                type="text"
                placeholder={COMMISSION_PRESETS[selectedPreset]?.name ?? "Plan name"}
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-1)] px-4 py-2 text-sm text-[color:var(--text)]"
              />
              <Button onClick={() => createFromPreset(selectedPreset)} disabled={saving}>
                {saving ? "Creating…" : "Create Plan"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowCreate(false);
                  setSelectedPreset(null);
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Plans List */}
      {plans.length === 0 ? (
        <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-12 text-center backdrop-blur-xl">
          <BadgeDollarSign className="mx-auto mb-4 h-12 w-12 text-slate-400" />
          <h3 className="text-lg font-semibold text-[color:var(--text)]">
            No Commission Plans Yet
          </h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Create your first plan to start tracking how your team earns commissions
          </p>
          <Button className="mt-4" onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create First Plan
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => {
            const meta = ruleTypeLabels[plan.ruleType];
            return (
              <div
                key={plan.id}
                className={`rounded-2xl border p-5 transition-all ${
                  plan.isActive
                    ? "border-[color:var(--border)] bg-[var(--surface-glass)]"
                    : "border-slate-200/50 bg-slate-100/50 opacity-60 dark:border-slate-800/50 dark:bg-slate-900/30"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`rounded-lg p-2 ${meta?.color ?? ""}`}>{meta?.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[color:var(--text)]">{plan.name}</h3>
                        {plan.isDefault && (
                          <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-bold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                            <Star className="h-3 w-3" /> DEFAULT
                          </span>
                        )}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${meta?.color ?? ""}`}
                        >
                          {meta?.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {describeStructure(plan.ruleType, plan.structure)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!plan.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDefault(plan.id)}
                        title="Set as default"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(plan.id, plan.isActive)}
                    >
                      {plan.isActive ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <span className="text-xs text-slate-400">Disabled</span>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePlan(plan.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
