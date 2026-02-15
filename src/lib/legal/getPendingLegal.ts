import prisma from "@/lib/prisma";

import { LEGAL_DOCUMENTS, LegalDocConfig } from "./config";

export type PendingLegalDoc = Pick<LegalDocConfig, "id" | "title" | "latestVersion">;

interface GetPendingOptions {
  userId: string;
  audience?: "all" | "contractor" | "homeowner" | "internal";
}

export async function getPendingLegalForUser(opts: GetPendingOptions): Promise<PendingLegalDoc[]> {
  const { userId, audience = "all" } = opts;

  const requiredDocs = LEGAL_DOCUMENTS.filter((doc) => {
    if (!doc.required) return false;
    if (doc.audience === "all") return true;
    return doc.audience === audience;
  });

  if (!requiredDocs.length) return [];

  const acceptances = await prisma.legal_acceptances.findMany({
    where: {
      userId,
      documentId: { in: requiredDocs.map((d) => d.id) },
    },
  });

  const acceptanceMap = new Map<string, string>();
  for (const a of acceptances) {
    acceptanceMap.set(a.documentId, a.version);
  }

  const pending = requiredDocs.filter((doc) => {
    const acceptedVersion = acceptanceMap.get(doc.id);
    return acceptedVersion !== doc.latestVersion;
  });

  return pending.map((doc) => ({
    id: doc.id,
    title: doc.title,
    latestVersion: doc.latestVersion,
  }));
}
