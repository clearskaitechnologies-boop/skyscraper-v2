import { PageContainer } from "@/components/layout/PageContainer";
import { getActiveOrgContext } from "@/lib/org/getActiveOrgContext";

import { RetailJobWizard } from "./RetailJobWizard";

export const dynamic = "force-dynamic";

export default async function NewRetailJobPage() {
  const orgResult = await getActiveOrgContext({ required: true });
  const orgId = orgResult.ok ? orgResult.orgId : "";

  return (
    <PageContainer maxWidth="5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Retail Job</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Set up a new out-of-pocket, financed, or repair job
        </p>
      </div>
      <RetailJobWizard orgId={orgId} />
    </PageContainer>
  );
}
