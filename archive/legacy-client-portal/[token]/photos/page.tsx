import { validatePortalToken } from "@/lib/portalAuth";
import prisma from "@/lib/prisma";

export default async function PhotosPage({ params }: { params: { token: string } }) {
  const tokenData = await validatePortalToken(params.token);
  if (!tokenData) return <div className="py-20 text-center">Invalid or expired link.</div>;
  // Placeholder: reuse claim_documents filtered by mimeType starting with image/
  const photos = await prisma.claim_documents.findMany({ where: { claimId: tokenData.claimId, visibleToClient: true, mimeType: { startsWith: "image/" } } });
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Photos</h1>
      {photos.length === 0 && <p className="text-sm text-muted-foreground">No photos visible yet.</p>}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {photos.map(p => (
          <a key={p.id} href={p.url} target="_blank" className="group relative aspect-square border rounded overflow-hidden bg-muted">
            <img src={p.url} alt={p.title} className="object-cover w-full h-full" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-[11px] text-white p-1 text-center">{p.title}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
