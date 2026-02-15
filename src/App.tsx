import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AnnouncementBar from "@/components/AnnouncementBar";
import FooterStatus from "@/components/FooterStatus";
import AIToolsPage from "@/components/pages/AIToolsPage";
import { ToastProvider } from "@/components/toast/ToastProvider";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import ClientDashboard from "./client/ClientDashboard";
import ClientLayout from "./client/ClientLayout";
import ClientOnly from "./client/ClientOnly";
import ClientSignIn from "./client/ClientSignIn";
import AdminAALGuard from "./components/AdminAALGuard";
import AdminOnly from "./components/AdminOnly";
import DashboardGuard from "./components/guards/DashboardGuard";
import BrandingGate from "./components/layout/BrandingGate";
import MockupLaunchGallery from "./components/MockupLaunchGallery";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./layouts/AppShell";
import CRMLayout from "./layouts/CRMLayout";
import PublicLayout from "./layouts/PublicLayout";
import { applyOrgTheme } from "./lib/theme";
import About from "./pages/About";
import AdminFunnels from "./pages/AdminFunnels";
import AdminOpsDashboard from "./pages/AdminOpsDashboard";
import AdminPublicLinks from "./pages/AdminPublicLinks";
import AdminSecurity from "./pages/AdminSecurity";
import AdminSignIn from "./pages/AdminSignIn";
import AiDamagePage from "./pages/AiDamagePage";
import AIInsights from "./pages/AIInsights";
import Analytics from "./pages/Analytics";
import AuthPage from "./pages/AuthPage";
import AuthReset from "./pages/AuthReset";
import BookDemoPage from "./pages/BookDemoPage";
import BrandingPresets from "./pages/BrandingPresets";
// SKaiAssistant fully retired (11/22/2025). No import retained.
import BuildProposal from "./pages/BuildProposal";
import Changelog from "./pages/Changelog";
import ClaimsPage from "./pages/ClaimsPage";
import ClientFolders from "./pages/ClientFolders";
import Contact from "./pages/Contact";
import CRMClaims from "./pages/CRM/Claims";
import CRMDashboard from "./pages/CRM/Dashboard";
import CRMJobs from "./pages/CRM/Jobs";
import CRMLeads from "./pages/CRM/Leads";
import ProposalWizard from "./pages/CRM/leads/[id]/proposal";
import NewLeadCRM from "./pages/CRM/leads/NewLead";
import CRMMap from "./pages/CRM/Map";
import CRMProjects from "./pages/CRM/Projects";
import ReportBuild from "./pages/CRM/reports/[id]/build";
import CRMRevenue from "./pages/CRM/Revenue";
import DamagePage from "./pages/DamagePage";
import DevMe from "./pages/DevMe";
import Features from "./pages/Features";
import Governance from "./pages/Governance";
import GovernanceRules from "./pages/GovernanceRules";
import Index from "./pages/Index";
import InspectionGuided from "./pages/InspectionGuided";
import InspectionStart from "./pages/InspectionStart";
import InsuranceBuild from "./pages/InsuranceBuild";
import InsuranceLanding from "./pages/InsuranceLanding";
import Layouts from "./pages/Layouts";
import LeadNew from "./pages/LeadNew";
import MapPage from "./pages/MapPage";
import MapView from "./pages/MapView";
import NotFound from "./pages/NotFound";
import OAuthCallback from "./pages/OAuthCallback";
import Onboarding from "./pages/Onboarding";
import Operations from "./pages/Operations";
import Pricing from "./pages/Pricing";
import Privacy from "./pages/Privacy";
import ProposalBuilder from "./pages/ProposalBuilder";
import ProposalsPage from "./pages/ProposalsPage";
import PublicSign from "./pages/PublicSign";
import PublicView from "./pages/PublicView";
import FirstReportWizard from "./pages/QuickStart/FirstReportWizard";
import ReportNew from "./pages/ReportNew";
import ReportQuick from "./pages/ReportQuick";
import ReportWorkbench from "./pages/ReportWorkbench";
import Retail from "./pages/Retail";
import RetailBuild from "./pages/RetailBuild";
import ServiceNetwork from "./pages/ServiceNetwork";
import Settings from "./pages/Settings";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Solutions from "./pages/Solutions";
import Status from "./pages/Status";
import StatusAdmin from "./pages/StatusAdmin";
import StatusCheck from "./pages/StatusCheck";
import Terms from "./pages/Terms";
import VendorsPage from "./pages/VendorsPage";
import Welcome from "./pages/Welcome";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Apply org theme once on app load
    applyOrgTheme();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <TooltipProvider>
          <Sonner />
          <BrowserRouter>
            <AnnouncementBar />
            <Routes>
              {/* Public routes (no CRM sidebar) */}
              <Route path="/" element={<Index />} />
              <Route path="/app" element={<PublicLayout />}>
                <Route index element={<Index />} />
              </Route>
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/_debug/me" element={<DevMe />} />
              <Route path="/auth" element={<AuthPage />} />
              {/* Use email/password SignIn as the primary login screen */}
              <Route path="/auth/login" element={<SignIn />} />
              <Route path="/auth/signup" element={<SignUp />} />
              <Route path="/auth/reset" element={<AuthReset />} />
              <Route path="/auth/callback" element={<OAuthCallback />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/status-check" element={<StatusCheck />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/changelog" element={<Changelog />} />
              <Route path="/mockups" element={<MockupLaunchGallery />} />
              <Route path="/quickstart" element={<FirstReportWizard />} />
              <Route path="/solutions" element={<Solutions />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/insurance" element={<InsuranceLanding />} />
              <Route path="/service-network" element={<ServiceNetwork />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/status" element={<Status />} />
              <Route path="/sign/:token" element={<PublicSign />} />
              <Route path="/view" element={<PublicView />} />
              <Route path="/admin/signin" element={<AdminSignIn />} />
              <Route path="/book-demo" element={<BookDemoPage />} />
              <Route path="/client/sign-in" element={<ClientSignIn />} />
              <Route
                path="/client"
                element={
                  <ClientOnly>
                    <ClientLayout>
                      <ClientDashboard />
                    </ClientLayout>
                  </ClientOnly>
                }
              />

              {/* Redirect legacy path to CRM dashboard */}
              <Route path="/dashboard" element={<Navigate to="/crm/dashboard" replace />} />

              {/* CRM routes (protected) - sidebar only appears here */}
              <Route
                path="/crm"
                element={
                  <ProtectedRoute>
                    <BrandingGate>
                      <CRMLayout />
                    </BrandingGate>
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<CRMDashboard />} />
                <Route path="onboarding" element={<Onboarding />} />
                <Route path="jobs" element={<CRMJobs />} />
                <Route path="projects" element={<CRMProjects />} />
                <Route path="claims" element={<CRMClaims />} />
                <Route path="leads" element={<CRMLeads />} />
                <Route path="leads/new" element={<NewLeadCRM />} />
                <Route path="leads/:id/proposal" element={<ProposalWizard />} />
                <Route path="reports/:id/build" element={<ReportBuild />} />
                <Route path="map" element={<CRMMap />} />
                <Route path="revenue" element={<CRMRevenue />} />
              </Route>

              {/* Protected routes remaining under AppShell */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route path="/inspection/start" element={<InspectionStart />} />
                <Route path="/ai-damage" element={<AiDamagePage />} />
                <Route path="/ai-tools" element={<AIToolsPage />} />
                <Route path="/proposals" element={<ProposalsPage />} />
                <Route path="/reports/quick" element={<ReportQuick />} />
                <Route path="/inspection/start" element={<InspectionStart />} />
                <Route path="/ai-damage" element={<AiDamagePage />} />
                <Route path="/ai-tools" element={<AIToolsPage />} />
                <Route path="/proposals" element={<ProposalsPage />} />
                <Route path="/reports/quick" element={<ReportQuick />} />
                <Route path="/retail" element={<Retail />} />
                <Route path="/retail/build" element={<RetailBuild />} />
                <Route path="/lead/new" element={<LeadNew />} />
                <Route path="/insurance/build" element={<InsuranceBuild />} />
                <Route path="/inspection-guided" element={<InspectionGuided />} />
                <Route path="/proposal-builder" element={<ProposalBuilder />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/damage" element={<DamagePage />} />
                <Route path="/claims" element={<ClaimsPage />} />
                <Route path="/vendors" element={<VendorsPage />} />
                <Route path="/build" element={<BuildProposal />} />
                <Route path="/build/new" element={<BuildProposal />} />
                <Route path="/folders" element={<ClientFolders />} />
                <Route path="/map-view" element={<MapView />} />
                <Route path="/report/new" element={<ReportNew />} />
                <Route
                  path="/report-workbench"
                  element={
                    <DashboardGuard>
                      <ReportWorkbench />
                    </DashboardGuard>
                  }
                />
                <Route path="/layouts" element={<Layouts />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/operations" element={<Operations />} />
                <Route path="/status/admin" element={<StatusAdmin />} />
                <Route path="/ai-insights" element={<AIInsights />} />
                <Route path="/governance" element={<Governance />} />
                <Route path="/governance/rules" element={<GovernanceRules />} />
                <Route
                  path="/security"
                  element={
                    <AdminOnly>
                      <AdminAALGuard>
                        <AdminSecurity />
                      </AdminAALGuard>
                    </AdminOnly>
                  }
                />
                <Route
                  path="/ops"
                  element={
                    <AdminOnly>
                      <AdminAALGuard>
                        <AdminOpsDashboard />
                      </AdminAALGuard>
                    </AdminOnly>
                  }
                />
                <Route
                  path="/funnels"
                  element={
                    <AdminOnly>
                      <AdminAALGuard>
                        <AdminFunnels />
                      </AdminAALGuard>
                    </AdminOnly>
                  }
                />
                <Route
                  path="/admin/branding/presets"
                  element={
                    <AdminOnly>
                      <AdminAALGuard>
                        <BrandingPresets />
                      </AdminAALGuard>
                    </AdminOnly>
                  }
                />
                <Route
                  path="/admin/links"
                  element={
                    <AdminOnly>
                      <AdminPublicLinks />
                    </AdminOnly>
                  }
                />
                <Route path="/crm" element={<CRMDashboard />} />
                <Route path="/crm/jobs" element={<CRMJobs />} />
                <Route path="/crm/projects" element={<CRMProjects />} />
                <Route path="/crm/claims" element={<CRMClaims />} />
                <Route path="/crm/leads" element={<CRMLeads />} />
                <Route path="/crm/map" element={<CRMMap />} />
                <Route path="/crm/revenue" element={<CRMRevenue />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>

            <FooterStatus />
          </BrowserRouter>
        </TooltipProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default App;
