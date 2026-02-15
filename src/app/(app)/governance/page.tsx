import { currentUser } from "@clerk/nextjs/server";
import { Shield } from "lucide-react";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHero } from "@/components/layout/PageHero";

// Dynamically import the React Router Governance component
const Governance = dynamic(() => import("@/components/pages/Governance"), {
  ssr: false,
  loading: () => <div className="p-8">Loading governance...</div>,
});

export default async function GovernancePage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  return (
    <PageContainer maxWidth="7xl">
      <PageHero
        section="jobs"
        title="Governance"
        subtitle="Permissions, audit logs, and compliance settings"
        icon={<Shield className="h-5 w-5" />}
      />
      <Governance />
    </PageContainer>
  );
}
