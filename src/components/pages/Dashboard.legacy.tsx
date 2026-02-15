import { AlertCircle, FileText, Shield, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { JobHistoryPanel } from "@/components/dashboard/JobHistoryPanel";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import DashboardGuard from "@/components/guards/DashboardGuard";
import KPIChart from "@/components/KPIChart";
import { OnboardingOverlay } from "@/components/onboarding/OnboardingOverlay";
import RecentLeadsTable from "@/components/RecentLeadsTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WelcomeModal from "@/components/WelcomeModal";
import { useQueryParams } from "@/hooks/useQueryParams";
import { supabase } from "@/integrations/supabase/client";
import { useOnboardingStore } from "@/stores/onboardingStore";

export default function Dashboard() {
  const navigate = useNavigate();
  const queryParams = useQueryParams();
  const [leads, setLeads] = useState<any[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);
  const [metrics, setMetrics] = useState<any>({
    activeProjects: 0,
    propertiesMapped: 0,
    totalRevenue: 0,
    claimsFiled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [branding, setBranding] = useState<{
    logo_url?: string;
    primary_color?: string;
    accent_color?: string;
  } | null>(null);

  // Phase 2: Onboarding
  const { hasCompletedOnboarding, startOnboarding } = useOnboardingStore();

  useEffect(() => {
    if (queryParams.get("welcome") === "1") {
      setShowWelcome(true);
      // Start onboarding for first-time users
      if (!hasCompletedOnboarding) {
        setTimeout(() => startOnboarding(), 2000);
      }
    }
  }, [queryParams, hasCompletedOnboarding, startOnboarding]);

  useEffect(() => {
    (async () => {
      // Fetch branding
      const { data: brandData } = await supabase
        .from("org_branding")
        .select("logo_url, primary_color, accent_color")
        .maybeSingle();
      if (brandData)
        setBranding({
          logo_url: brandData.logo_url || undefined,
          primary_color: brandData.primary_color || undefined,
          accent_color: brandData.accent_color || undefined,
        });

      // Fetch metrics
      const { data: metricsData } = await supabase.rpc("crm_metrics" as any);
      if (metricsData) setMetrics(metricsData as any);

      // Fetch recent leads
      const { data: leadsData } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (leadsData) setLeads(leadsData);

      // Phase 2: Fetch token balance
      await fetchBalance();

      setLoading(false);
    })();
  }, []);
  // Note: fetchBalance is an outer scope value, not a React state/prop dependency

  const reportTypes = [
    {
      title: "Claims-Ready Report",
      desc: "Carrier-ready docs with storm & code checks",
      to: "/report-workbench?mode=insurance",
      primary: true,
    },
    {
      title: "Retail Proposal",
      desc: "Branded proposals with mockups & options",
      to: "/report-workbench?mode=retail",
      primary: false,
    },
    {
      title: "AI Inspection",
      desc: "Fast findings, photos & summary",
      to: "/report-workbench?mode=inspection",
      primary: false,
    },
  ];

  const stats = [
    {
      title: "Active Projects",
      value: loading ? "—" : metrics.activeProjects,
      icon: FileText,
      color: "text-primary",
    },
    {
      title: "Properties Mapped",
      value: loading ? "—" : metrics.propertiesMapped,
      icon: AlertCircle,
      color: "text-accent",
    },
    {
      title: "Total Revenue",
      value: loading ? "—" : `$${Math.round(metrics.totalRevenue || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: "text-success",
    },
    {
      title: "Claims Filed",
      value: loading ? "—" : metrics.claimsFiled,
      icon: Shield,
      color: "text-warning",
    },
  ];

  return (
    <DashboardGuard>
      <div className="space-y-8">
        {/* Phase 2: Header with Token Counter & Notifications */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {branding?.logo_url && (
              <img src={branding.logo_url} alt="Company Logo" className="h-12 rounded" />
            )}
            <div>
              <h1 className="mb-2 text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome to your AI-powered roofing intelligence platform
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
          </div>
        </div>

        {/* Phase 2: AI Job Wizard CTA */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🚀</span>
              New: AI Job Wizard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Create professional roof inspection reports in minutes with our AI-powered wizard.
              Answer one question at a time - we&apos;ll handle the rest!
            </p>
            <Button
              data-onboarding="create-job-button"
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate("/wizard")}
            >
              Start AI Wizard →
            </Button>
          </CardContent>
        </Card>

        {/* Report Types - Claims-First */}
        <div className="grid gap-6 md:grid-cols-3">
          {reportTypes.map((type) => (
            <Card
              key={type.title}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                type.primary ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => navigate(type.to)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {type.title}
                  {type.primary && (
                    <span className="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                      Recommended
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{type.desc}</p>
                <Button variant={type.primary ? "default" : "outline"} className="w-full">
                  Start →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          {stats.map((stat) => (
            <Card
              key={stat.title}
              style={{
                borderTop: branding?.accent_color
                  ? `4px solid ${branding.accent_color}`
                  : undefined,
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Job History */}
        <div className="grid gap-6 lg:grid-cols-2" data-onboarding="dashboard-link">
          <JobHistoryPanel />
        </div>

        <KPIChart />

        {/* Resume Drafts & Recent Reports */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Resume Drafts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your in-progress reports will appear here
                </p>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your completed reports will appear here
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <RecentLeadsTable leads={leads} />

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => navigate("/lead/new")}>
              Create New Lead
            </Button>
            <Button variant="outline" onClick={() => navigate("/inspection-guided")}>
              Start AI Inspection
            </Button>
            <Button variant="outline" onClick={() => navigate("/map")}>
              View Map
            </Button>
            <Button variant="outline" onClick={() => navigate("/claims")}>
              Manage Claims
            </Button>
          </CardContent>
        </Card>

        <WelcomeModal open={showWelcome} onClose={() => setShowWelcome(false)} />

        {/* Phase 2: Overlays */}
        <OnboardingOverlay />
      </div>
    </DashboardGuard>
  );
}
