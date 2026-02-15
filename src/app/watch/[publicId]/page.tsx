/**
 * 🔥 PHASE 27.2a: PUBLIC WATCH PAGE
 *
 * /watch/[publicId] - Public, no-auth video viewing page
 *
 * NOTE: This page is designed for future video sharing functionality.
 * Some fields (publicId, isPublic, shareExpiresAt, videoUrl, etc.) may need
 * to be added to the ai_reports schema when this feature is fully enabled.
 */

import { Calendar, CheckCircle, Clock, Film } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";

// Extended report type for video sharing functionality
// These fields may be stored in attachments JSON or added to schema later
interface VideoReportData {
  id: string;
  orgId: string;
  title: string;
  content: string;
  status: string;
  createdAt: Date;
  attachments: unknown;
  Org?: { name: string } | null;
  // Extended fields for video sharing (may come from attachments or future schema)
  publicId?: string;
  isPublic?: boolean;
  shareExpiresAt?: Date | null;
  shareTitle?: string | null;
  shareNotes?: string | null;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  duration?: number | null;
  scriptJson?: unknown;
  storyboardJson?: unknown;
  contractor?: { businessName: string } | null;
}

async function getPublicVideoReport(publicId: string): Promise<VideoReportData | null> {
  // Query by id since publicId field may not exist yet in schema
  const report = await prisma.ai_reports.findUnique({
    where: {
      id: publicId,
    },
    include: {
      Org: true,
    },
  });

  if (!report) return null;

  // Parse extended data from attachments if available
  const attachments = report.attachments as Record<string, unknown> | null;
  const videoData = attachments?.videoData as Record<string, unknown> | undefined;

  const extendedReport: VideoReportData = {
    ...report,
    publicId: (videoData?.publicId as string) ?? report.id,
    isPublic: (videoData?.isPublic as boolean) ?? false,
    shareExpiresAt: videoData?.shareExpiresAt ? new Date(videoData.shareExpiresAt as string) : null,
    shareTitle: (videoData?.shareTitle as string) ?? null,
    shareNotes: (videoData?.shareNotes as string) ?? null,
    videoUrl: (videoData?.videoUrl as string) ?? null,
    thumbnailUrl: (videoData?.thumbnailUrl as string) ?? null,
    duration: (videoData?.duration as number) ?? null,
    scriptJson: videoData?.scriptJson ?? null,
    storyboardJson: videoData?.storyboardJson ?? null,
  };

  // Check if public viewing is enabled
  if (!extendedReport.isPublic) {
    return null;
  }

  // Check expiration
  if (extendedReport.shareExpiresAt && extendedReport.shareExpiresAt < new Date()) {
    return null;
  }

  return extendedReport;
}

export default async function WatchPage({ params }: { params: { publicId: string } }) {
  const report = await getPublicVideoReport(params.publicId);

  if (!report) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Link Invalid or Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              This video report link is no longer available or has been revoked.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const script = report.scriptJson as Record<string, unknown> | null;
  const storyboard = report.storyboardJson as Record<string, unknown> | null;
  const orgName = report.Org?.name || report.contractor?.businessName || "SkaiScraper";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-md">
              <Film className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                Dominus AI Video Report
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{orgName}</p>
            </div>
          </div>
          <Badge variant="outline" className="hidden text-xs sm:flex">
            AI-Powered
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Title Section - Clean, YouTube-style */}
        <div className="mb-6">
          <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
            {report.shareTitle || report.title}
          </h2>
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400 sm:gap-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {new Date(report.createdAt).toLocaleDateString()}
            </div>
            {report.duration && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {Math.floor(report.duration)}s
              </div>
            )}
          </div>
          {report.shareNotes && (
            <p className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
              {report.shareNotes}
            </p>
          )}
        </div>

        {/* Video Player - YouTube-style */}
        <div className="mb-8">
          {report.videoUrl ? (
            <div className="aspect-video overflow-hidden rounded-xl bg-black shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800">
              <video
                controls
                className="h-full w-full"
                poster={report.thumbnailUrl || undefined}
                preload="metadata"
              >
                <source src={report.videoUrl} type="video/mp4" />
                Your browser does not support video playback.
              </video>
            </div>
          ) : (
            <div className="flex aspect-video animate-pulse items-center justify-center rounded-xl border border-gray-200 bg-gradient-to-br from-gray-100 to-gray-200 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
              <div className="px-4 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <Film className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="mb-2 text-base font-medium text-gray-900 dark:text-gray-100">
                  Video Processing
                </p>
                <p className="max-w-md text-sm text-gray-600 dark:text-gray-400">
                  This AI video is being generated. Please check back in a few minutes.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* AI Summary */}
        {script && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Report Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {script &&
                  (
                    script as { sections?: Array<{ label: string; narration: string }> }
                  ).sections?.map((section, idx: number) => (
                    <div key={idx} className="border-l-4 border-purple-600 pl-4">
                      <h3 className="mb-1 font-semibold text-gray-900 dark:text-gray-100">
                        {section.label}
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {section.narration}
                      </p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Storyboard Info */}
        {storyboard && (
          <Card>
            <CardHeader>
              <CardTitle>Video Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Total Scenes</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {(storyboard as { scenes?: unknown[] } | null)?.scenes?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Duration</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {Math.floor(report.duration || 0)}s
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Status</p>
                  <Badge className="mt-1">{report.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>This is an AI-assisted preliminary property inspection report.</p>
          <p className="mt-1">
            Not a substitute for professional structural engineering assessment.
          </p>
        </div>
      </main>
    </div>
  );
}
