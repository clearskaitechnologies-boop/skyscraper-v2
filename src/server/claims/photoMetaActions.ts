/*
"use server";
import { revalidatePath } from "next/cache";

import { prismaModel } from "@/lib/db/prismaModel";
import { requireAuth } from "@/lib/auth/requireAuth";
import {
  safeServerAction,
  sanitizeInput,
  verifyClaimAccess,
} from "@/lib/security/serverSecurity";

const PhotoMeta = prismaModel<any>(
  "claimPhotoMeta",
  "claim_photo_meta",
  "claimPhotoMetas",
  "ClaimPhotoMeta",
  "photoMeta",
  "claim_photo_metadata"
);

export async function upsertPhotoMeta(input: {
  claimId: string;
  photoId: string;
  tag?: string;
  note?: string;
}) {
  return safeServerAction(async () => {
    const { claimId, photoId, tag, note } = input;

    // Validate required fields
    if (!claimId || !photoId) {
      throw new Error("claimId and photoId required");
    }

    // Authenticate and authorize
    const { userId, orgId } = await requireAuth();
    if (!orgId) {
      throw new Error("Organization access required");
    }

    // Verify user has access to this claim
    const hasAccess = await verifyClaimAccess(claimId, userId, orgId);
    if (!hasAccess) {
      throw new Error("Access denied: You do not have permission to modify this claim");
    }

    // Sanitize text inputs
    const sanitizedTag = tag ? sanitizeInput(tag) : undefined;
    const sanitizedNote = note ? sanitizeInput(note) : undefined;

    // NOTE: `ClaimPhotoMeta` stores metadata keyed by `url` (not photoId).
    const photoUrl = photoId;

    // Attempt to find existing record
    if (!PhotoMeta) {
      return { ok: false, record: null };
    }

    const existing = await PhotoMeta.findFirst({
      where: {
        claimId,
        url: photoUrl,
      },
    });

    const nextMetadata = {
      ...(((existing?.metadata ?? {}) as any) || {}),
      tag: sanitizedTag ?? null,
      note: sanitizedNote ?? null,
      updatedBy: userId,
      updatedAt: new Date().toISOString(),
    };

    const record = existing
      ? await PhotoMeta.update({
          where: { id: existing.id },
          data: {
            metadata: nextMetadata,
          },
        })
      : await PhotoMeta.create({
          data: {
            claimId,
            url: photoUrl,
            metadata: nextMetadata,
          },
        });

    // Revalidate any claim builder pages (if server-rendered variants exist)
    revalidatePath(`/claims/${claimId}`);
    return { ok: true, record };
  });
}

export async function getPhotoMetaForClaim(claimId: string) {
  return safeServerAction(async () => {
    if (!claimId) {
      throw new Error("claimId required");
    }

    // Authenticate and authorize
    const { userId, orgId } = await requireAuth();
    if (!orgId) {
      throw new Error("Organization access required");
    }

    // Verify user has access to this claim
    const hasAccess = await verifyClaimAccess(claimId, userId, orgId);
    if (!hasAccess) {
      throw new Error("Access denied: You do not have permission to access this claim");
    }

    if (!PhotoMeta) {
      return [];
    }

    const metas = await PhotoMeta.findMany({
      where: { claimId },
    });

    return metas.map((m) => ({
      photoId: m.url,
      tag: typeof (m.metadata as any)?.tag === "string" ? (m.metadata as any).tag : undefined,
      note: typeof (m.metadata as any)?.note === "string" ? (m.metadata as any).note : undefined,
    }));
  });
}
*/
