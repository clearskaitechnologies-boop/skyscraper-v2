import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { TemplateEditor } from "../_components/TemplateEditor";

export default async function NewTemplatePage() {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    redirect("/sign-in");
  }

  return <TemplateEditor orgId={orgId} userId={userId} />;
}
