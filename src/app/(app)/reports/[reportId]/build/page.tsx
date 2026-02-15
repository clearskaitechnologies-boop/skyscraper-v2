import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import BuilderShell from "./BuilderShell";

export default async function ReportBuilderPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  return <BuilderShell templateId="proposal" />;
}
