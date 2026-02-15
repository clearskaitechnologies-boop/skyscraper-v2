import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getExportableProjects } from "./actions";
import CarrierExportClient from "./CarrierExportClient";

export const dynamic = "force-dynamic";

export default async function CarrierExportPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const projects = await getExportableProjects();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[color:var(--text)]">Carrier Export Builder</h1>
        <p className="mt-2 text-slate-700 dark:text-slate-300">
          Export project files, photos, and reports in carrier-ready format
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-[color:var(--border)] bg-[var(--surface-2)] p-12 text-center">
          <p className="text-lg text-slate-700 dark:text-slate-300">
            No projects available for export
          </p>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
            Create projects with documents to generate carrier exports
          </p>
        </div>
      ) : (
        <CarrierExportClient projects={projects} />
      )}
    </div>
  );
}
