import { validatePortalToken } from "@/lib/portalAuth";
import prisma from "@/lib/prisma";

export default async function PhotosPage({ params }: { params: { token: string } }) {
  const tokenData = await validatePortalToken(params.token);
  if (!tokenData) return <div className="py-20 text-center">Invalid or expired link.</div>;
  // Note: documents model doesn't have claimId, using FileAsset instead
  const photos = await prisma.file_assets.findMany({
    where: {
      claimId: tokenData.claimId,
      mimeType: { startsWith: "image/" },
    },
  });
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Photos</h1>
      {photos.length === 0 && <p className="text-sm text-gray-500">No photos yet.</p>}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {photos.map((p) => (
          <a
            key={p.id}
            href={p.publicUrl}
            target="_blank"
            className="group relative aspect-square overflow-hidden rounded border bg-white"
          >
            <img src={p.publicUrl} alt={p.filename} className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 p-1 text-center text-[11px] text-white opacity-0 transition group-hover:opacity-100">
              {p.filename}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
