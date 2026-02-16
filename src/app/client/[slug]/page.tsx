import { Bell, Calendar, FileText, Hammer, Home, MessageSquare, Users } from "lucide-react";
import Link from "next/link";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHero } from "@/components/layout/PageHero";
import { PageSectionCard } from "@/components/layout/PageSectionCard";
import { Button } from "@/components/ui/button";

interface ClientHomePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClientHomePage({ params }: ClientHomePageProps) {
  const { slug } = await params;
  const basePath = `/client/${slug}`;

  return (
    <PageContainer maxWidth="7xl">
      <PageHero
        section="network"
        icon={<Home className="h-8 w-8" />}
        title="Your Client Network"
        subtitle={`Network ID: ${slug} • Stay connected with your contractor, track projects, and access important documents`}
        actions={
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href={`${basePath}/activity`}>
                <Bell className="mr-2 h-4 w-4" />
                Activity
              </Link>
            </Button>
            <Button asChild>
              <Link href={`${basePath}/request`}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Submit Request
              </Link>
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="group rounded-2xl border border-slate-200/20 bg-white/60 p-6 shadow-[0_0_30px_-12px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Hammer className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">0</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Active Projects</p>
              </div>
            </div>
          </div>
          <div className="group rounded-2xl border border-slate-200/20 bg-white/60 p-6 shadow-[0_0_30px_-12px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">0</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Trusted Pros</p>
              </div>
            </div>
          </div>
          <div className="group rounded-2xl border border-slate-200/20 bg-white/60 p-6 shadow-[0_0_30px_-12px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">0</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Documents</p>
              </div>
            </div>
          </div>
        </div>

        {/* Project Overview Section */}
        <PageSectionCard
          title="Project Overview"
          subtitle="Track your home improvement projects and repairs"
        >
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-6 text-center dark:border-slate-700 dark:bg-slate-800/50">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                <Calendar className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                No Active Projects
              </h3>
              <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                Your contractor will share project details here once work begins. You&apos;ll be
                able to track progress, view timelines, and see status updates.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href={`${basePath}/projects`}>View All Projects</Link>
              </Button>
            </div>
          </div>
        </PageSectionCard>

        {/* Photos & Documents Section */}
        <PageSectionCard
          title="Photos & Documents"
          subtitle="Access all your important files, reports, and photos"
        >
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Link
                href={`${basePath}/documents?filter=photos`}
                className="group rounded-lg border border-slate-200 bg-white p-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      Property Photos
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">0 photos</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Damage assessment and progress photos
                </p>
              </Link>

              <Link
                href={`${basePath}/documents?filter=reports`}
                className="group rounded-lg border border-slate-200 bg-white p-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">Reports & Docs</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">0 documents</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Estimates, invoices, and reports
                </p>
              </Link>
            </div>

            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center dark:border-slate-600 dark:bg-slate-800/30">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Your contractor will share photos and documents here. All files are securely stored
                and accessible anytime.
              </p>
            </div>
          </div>
        </PageSectionCard>

        {/* Messages & Updates Section */}
        <PageSectionCard
          title="Messages & Updates"
          subtitle="Stay connected with your contractor and receive important notifications"
        >
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-6 text-center dark:border-slate-700 dark:bg-slate-800/50">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                <Bell className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                No New Messages
              </h3>
              <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                You&apos;ll receive updates here when your contractor shares news, requests
                information, or updates project status.
              </p>
              <Button asChild>
                <Link href={`${basePath}/request`}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send a Message
                </Link>
              </Button>
            </div>
          </div>
        </PageSectionCard>

        {/* Quick Links Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <Link href={`${basePath}/pros`} className="group">
            <div className="rounded-2xl border border-slate-200/20 bg-white/60 p-6 shadow-[0_0_30px_-12px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-900/50">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                  Trusted Pros
                </h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Your contractor&apos;s handpicked vendors and trade professionals. View contact
                information and specialties.
              </p>
              <p className="mt-4 text-xs font-medium text-slate-500 dark:text-slate-500">
                No pros connected yet →
              </p>
            </div>
          </Link>

          <Link href={`${basePath}/profile`} className="group">
            <div className="rounded-2xl border border-slate-200/20 bg-white/60 p-6 shadow-[0_0_30px_-12px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-900/50">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30">
                  <Home className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                  Your Profile
                </h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                View and update your contact information, preferences, and notification settings.
              </p>
              <p className="mt-4 text-xs font-medium text-slate-500 dark:text-slate-500">
                Manage your profile →
              </p>
            </div>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
