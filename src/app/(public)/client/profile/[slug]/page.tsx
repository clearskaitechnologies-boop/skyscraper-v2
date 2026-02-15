/**
 * Public Client Profile Page
 * Allows contractors to view client profiles and send connection requests
 */

import { format } from "date-fns";
import {
  Building2,
  CheckCircle2,
  Home,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Star,
  User,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface PublicClientProfileProps {
  params: { slug: string };
}

export default async function PublicClientProfile({ params }: PublicClientProfileProps) {
  // Get client by slug
  const client = await prisma.client.findFirst({
    where: {
      slug: params.slug,
      // Only show if client has some basic info filled out
      OR: [{ firstName: { not: null } }, { companyName: { not: null } }, { bio: { not: null } }],
    },
    select: {
      id: true,
      slug: true,
      firstName: true,
      lastName: true,
      companyName: true,
      email: true,
      phone: true,
      category: true,
      bio: true,
      avatarUrl: true,
      coverPhotoUrl: true,
      propertyPhotoUrl: true,
      address: true,
      city: true,
      state: true,
      postal: true,
      preferredContact: true,
      createdAt: true,
    },
  });

  if (!client) {
    notFound();
  }

  const fullName = [client.firstName, client.lastName].filter(Boolean).join(" ");
  const displayName = client.companyName || fullName || "Client Profile";

  // Get some stats
  const stats = {
    totalProjects: await prisma.claimClientLink.count({
      where: { clientEmail: client.email ?? undefined },
    }),
    savedPros: await prisma.clientSavedPro.count({
      where: { clientId: client.id },
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Cover Photo */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 md:h-56">
        {client.coverPhotoUrl && (
          <Image src={client.coverPhotoUrl} alt="Cover" fill className="object-cover" />
        )}
      </div>

      {/* Header */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="-mt-20 flex flex-col gap-6 md:flex-row md:items-start">
            {/* Avatar */}
            <div className="flex justify-center md:justify-start">
              <div className="relative">
                {client.avatarUrl ? (
                  <div className="h-24 w-24 overflow-hidden rounded-full shadow-2xl md:h-32 md:w-32">
                    <Image src={client.avatarUrl} alt={displayName} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-2xl md:h-32 md:w-32">
                    {client.companyName ? (
                      <Building2 className="h-8 w-8 text-white md:h-12 md:w-12" />
                    ) : (
                      <User className="h-8 w-8 text-white md:h-12 md:w-12" />
                    )}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 rounded-full bg-green-500 p-1 shadow-lg">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{displayName}</h1>

              <div className="mt-2 flex flex-wrap justify-center gap-2 md:justify-start">
                <Badge variant="outline" className="capitalize">
                  {client.category || "Client"}
                </Badge>
                {client.city && client.state && (
                  <Badge variant="secondary">
                    <MapPin className="mr-1 h-3 w-3" />
                    {client.city}, {client.state}
                  </Badge>
                )}
              </div>

              {client.bio && <p className="mt-4 max-w-2xl text-slate-600">{client.bio}</p>}

              {/* Contact Info */}
              <div className="mt-4 flex flex-wrap justify-center gap-4 md:justify-start">
                {client.email && (
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Mail className="h-4 w-4" />
                    <span>Contact via email</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Phone className="h-4 w-4" />
                    <span>Phone available</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-sm text-slate-600">
                  <MessageSquare className="h-4 w-4" />
                  <span>Prefers {client.preferredContact || "email"}</span>
                </div>
              </div>
            </div>

            {/* Connect Button */}
            <div className="flex justify-center md:justify-end">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Users className="mr-2 h-5 w-5" />
                Connect
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Property Photo */}
            {client.propertyPhotoUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Property
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video overflow-hidden rounded-lg">
                    <Image
                      src={client.propertyPhotoUrl}
                      alt="Property"
                      width={600}
                      height={400}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {client.address && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {client.address}
                        {client.city && client.state && `, ${client.city}, ${client.state}`}
                        {client.postal && ` ${client.postal}`}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h4 className="font-medium text-slate-900">Account Type</h4>
                    <p className="text-sm capitalize text-slate-600">
                      {client.category || "Client"}
                    </p>
                  </div>
                  {client.companyName && (
                    <div>
                      <h4 className="font-medium text-slate-900">Company</h4>
                      <p className="text-sm text-slate-600">{client.companyName}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-slate-900">Preferred Contact</h4>
                    <p className="text-sm capitalize text-slate-600">
                      {client.preferredContact || "Email"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Member Since</h4>
                    <p className="text-sm text-slate-600">
                      {format(new Date(client.createdAt), "MMMM yyyy")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalProjects}</div>
                  <div className="text-sm text-slate-600">Active Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.savedPros}</div>
                  <div className="text-sm text-slate-600">Trusted Pros</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    <Star className="inline h-6 w-6" />
                  </div>
                  <div className="text-sm text-slate-600">Verified Profile</div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Get Connected</CardTitle>
                <CardDescription>
                  Send a connection request to collaborate on projects
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" size="lg">
                  <Users className="mr-2 h-5 w-5" />
                  Send Connection Request
                </Button>

                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="text-xs text-blue-600">
                    💼 Once connected, you can message directly, share documents, and collaborate on
                    projects.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Powered by SkaiScraper */}
            <div className="text-center">
              <Link href="/" className="text-xs text-slate-500 hover:text-slate-700">
                Powered by <span className="font-semibold">SkaiScraper</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
