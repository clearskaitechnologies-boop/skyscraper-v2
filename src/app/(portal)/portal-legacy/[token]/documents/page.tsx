import { DocumentTile } from "@/components/portal/DocumentTile";
import { validatePortalToken } from "@/lib/portalAuth";
import prisma from "@/lib/prisma";

export default async function DocumentsPage({ params }: { params: { token: string } }) {
  const tokenData = await validatePortalToken(params.token);
  if (!tokenData) return <div className="py-20 text-center">Invalid or expired link.</div>;
  // Note: documents model doesn't have claimId, using FileAsset instead
  const docs = await prisma.file_assets.findMany({
    where: { claimId: tokenData.claimId },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Documents</h1>
      {docs.length === 0 && <p className="text-sm text-gray-500">No documents yet.</p>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {docs.map((d) => (
          <DocumentTile key={d.id} title={d.filename} type={d.mimeType} url={d.publicUrl} />
        ))}
      </div>
    </div>
  );
}
