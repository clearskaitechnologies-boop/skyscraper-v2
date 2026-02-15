/**
 * Job Photo Gallery
 *
 * Photo management for jobs with before/after/progress tracking
 * Categorization, annotations, timeline view
 */

import { logActivity } from "@/lib/activity/activityFeed";
import prisma from "@/lib/prisma";

export type PhotoCategory =
  | "BEFORE"
  | "DURING"
  | "AFTER"
  | "DAMAGE"
  | "PROGRESS"
  | "COMPLETION"
  | "OTHER";

export interface JobPhoto {
  id: string;
  jobId: string;
  orgId: string;
  url: string;
  thumbnailUrl?: string;
  category: PhotoCategory;
  caption?: string;
  location?: string;
  takenAt?: Date;
  uploadedBy: string;
  uploadedAt: Date;
  metadata?: {
    width?: number;
    height?: number;
    size?: number;
    exif?: Record<string, any>;
  };
}

/**
 * Upload job photo
 */
export async function uploadJobPhoto(
  orgId: string,
  jobId: string,
  data: {
    url: string;
    thumbnailUrl?: string;
    category: PhotoCategory;
    caption?: string;
    location?: string;
    takenAt?: Date;
    metadata?: Record<string, any>;
  },
  userId: string
): Promise<JobPhoto> {
  try {
    const photo = await prisma.jobPhotos
      .create({
        data: {
          jobId,
          orgId,
          url: data.url,
          thumbnailUrl: data.thumbnailUrl,
          category: data.category,
          caption: data.caption,
          location: data.location,
          takenAt: data.takenAt,
          metadata: data.metadata || {},
          uploadedBy: userId,
        },
      })
      .catch(() => {
        throw new Error("Failed to upload photo");
      });

    // Log activity
    await logActivity(orgId, {
      type: "NEW_DOCUMENT",
      userId,
      resourceType: "JOB",
      resourceId: jobId,
      action: "Photo Uploaded",
      description: `${data.category} photo`,
    });

    return photo as JobPhoto;
  } catch (error) {
    console.error("Failed to upload job photo:", error);
    throw error;
  }
}

/**
 * Get job photos
 */
export async function getJobPhotos(
  jobId: string,
  orgId: string,
  category?: PhotoCategory
): Promise<JobPhoto[]> {
  try {
    return (await prisma.jobPhotos.findMany({
      where: {
        jobId,
        orgId,
        ...(category && { category }),
      },
      orderBy: {
        takenAt: "desc",
      },
    })) as JobPhoto[];
  } catch {
    return [];
  }
}

/**
 * Get photos by category
 */
export async function getPhotosByCategory(
  jobId: string,
  orgId: string
): Promise<Record<PhotoCategory, JobPhoto[]>> {
  const photos = await getJobPhotos(jobId, orgId);

  const byCategory: Record<string, JobPhoto[]> = {};

  for (const photo of photos) {
    if (!byCategory[photo.category]) {
      byCategory[photo.category] = [];
    }
    byCategory[photo.category].push(photo);
  }

  return byCategory as Record<PhotoCategory, JobPhoto[]>;
}

/**
 * Get before/after comparison
 */
export async function getBeforeAfterPhotos(
  jobId: string,
  orgId: string
): Promise<{
  before: JobPhoto[];
  after: JobPhoto[];
}> {
  const [before, after] = await Promise.all([
    getJobPhotos(jobId, orgId, "BEFORE"),
    getJobPhotos(jobId, orgId, "AFTER"),
  ]);

  return { before, after };
}

/**
 * Update photo details
 */
export async function updatePhoto(
  photoId: string,
  orgId: string,
  updates: {
    category?: PhotoCategory;
    caption?: string;
    location?: string;
    takenAt?: Date;
  },
  userId: string
): Promise<void> {
  try {
    const photo = await prisma.jobPhotos.findFirst({
      where: { id: photoId, orgId },
    });

    if (!photo) {
      throw new Error("Photo not found");
    }

    await prisma.jobPhotos.update({
      where: { id: photoId },
      data: updates,
    });

    // Log activity
    await logActivity(orgId, {
      type: "UPDATED",
      userId,
      resourceType: "JOB",
      resourceId: photo.jobId,
      action: "Photo Updated",
      description: updates.caption || "Photo details updated",
    });
  } catch (error) {
    console.error("Failed to update photo:", error);
    throw error;
  }
}

/**
 * Delete photo
 */
export async function deletePhoto(photoId: string, orgId: string, userId: string): Promise<void> {
  try {
    const photo = await prisma.jobPhotos.findFirst({
      where: { id: photoId, orgId },
    });

    if (!photo) {
      throw new Error("Photo not found");
    }

    await prisma.jobPhotos.delete({
      where: { id: photoId },
    });

    // TODO: Delete from storage (S3/R2)

    // Log activity
    await logActivity(orgId, {
      type: "DELETED",
      userId,
      resourceType: "JOB",
      resourceId: photo.jobId,
      action: "Photo Deleted",
    });
  } catch (error) {
    console.error("Failed to delete photo:", error);
    throw error;
  }
}

/**
 * Bulk upload photos
 */
export async function bulkUploadPhotos(
  orgId: string,
  jobId: string,
  photos: Array<{
    url: string;
    thumbnailUrl?: string;
    category: PhotoCategory;
    caption?: string;
    takenAt?: Date;
  }>,
  userId: string
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const photo of photos) {
    try {
      await uploadJobPhoto(orgId, jobId, photo, userId);
      success++;
    } catch {
      failed++;
    }
  }

  return { success, failed };
}

/**
 * Get photo timeline
 */
export async function getPhotoTimeline(
  jobId: string,
  orgId: string
): Promise<Array<{ date: string; photos: JobPhoto[] }>> {
  const photos = await getJobPhotos(jobId, orgId);

  // Group by date
  const byDate: Record<string, JobPhoto[]> = {};

  for (const photo of photos) {
    const date = (photo.takenAt || photo.uploadedAt).toISOString().split("T")[0];

    if (!byDate[date]) {
      byDate[date] = [];
    }

    byDate[date].push(photo);
  }

  // Convert to array and sort
  return Object.entries(byDate)
    .map(([date, photos]) => ({ date, photos }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Get photo stats
 */
export async function getPhotoStats(
  jobId: string,
  orgId: string
): Promise<{
  total: number;
  byCategory: Record<PhotoCategory, number>;
  recentUploads: number;
}> {
  try {
    const photos = await getJobPhotos(jobId, orgId);

    const byCategory: Record<string, number> = {};

    for (const photo of photos) {
      byCategory[photo.category] = (byCategory[photo.category] || 0) + 1;
    }

    // Count recent uploads (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUploads = photos.filter((p) => p.uploadedAt > sevenDaysAgo).length;

    return {
      total: photos.length,
      byCategory: byCategory as Record<PhotoCategory, number>,
      recentUploads,
    };
  } catch {
    return {
      total: 0,
      byCategory: {} as Record<PhotoCategory, number>,
      recentUploads: 0,
    };
  }
}

/**
 * Generate progress report with photos
 */
export async function generateProgressReport(
  jobId: string,
  orgId: string
): Promise<{
  before: JobPhoto[];
  progress: JobPhoto[];
  after: JobPhoto[];
  damagePhotos: JobPhoto[];
  totalPhotos: number;
}> {
  const [before, progress, after, damagePhotos] = await Promise.all([
    getJobPhotos(jobId, orgId, "BEFORE"),
    getJobPhotos(jobId, orgId, "PROGRESS"),
    getJobPhotos(jobId, orgId, "AFTER"),
    getJobPhotos(jobId, orgId, "DAMAGE"),
  ]);

  const totalPhotos = before.length + progress.length + after.length + damagePhotos.length;

  return {
    before,
    progress,
    after,
    damagePhotos,
    totalPhotos,
  };
}
