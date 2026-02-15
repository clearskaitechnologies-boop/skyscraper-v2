/**
 * Enhanced About Tab Component
 * Comprehensive profile information with sections for bio, experience, certifications, etc.
 */

"use client";

import {
  Award,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Shield,
  Twitter,
  User,
  Wrench,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface MemberProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  bio?: string;
  jobTitle?: string;
  tradeType?: string;
  companyName?: string;
  companyEmail?: string;
  companyWebsite?: string;
  companyLicense?: string;
  yearsExperience?: number;
  city?: string;
  state?: string;
  zip?: string;
  serviceArea?: string;
  specialties?: string[];
  certifications?: string[];
  skills?: string[];
  workHistory?: string;
  isVerified?: boolean;
  verifiedAt?: string;
  createdAt?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

interface EnhancedAboutTabProps {
  member: MemberProfile;
  isOwnProfile: boolean;
}

export default function EnhancedAboutTab({ member, isOwnProfile }: EnhancedAboutTabProps) {
  const displayName =
    [member.firstName, member.lastName].filter(Boolean).join(" ") || "Trades Professional";

  const hasContactInfo = member.email || member.phone || member.companyEmail;
  const hasLocation = member.city || member.state || member.serviceArea;
  const hasSpecialties = member.specialties && member.specialties.length > 0;
  const hasCertifications = member.certifications && member.certifications.length > 0;
  const hasSkills = member.skills && member.skills.length > 0;
  const hasSocialLinks = member.socialLinks && Object.values(member.socialLinks).some(Boolean);

  return (
    <div className="space-y-6">
      {/* Bio Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-blue-600" />
            About {isOwnProfile ? "Me" : displayName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {member.bio ? (
            <p className="whitespace-pre-wrap leading-relaxed text-slate-700">{member.bio}</p>
          ) : (
            <p className="italic text-slate-400">
              {isOwnProfile
                ? "Add a bio to tell potential clients about yourself."
                : "No bio provided."}
            </p>
          )}

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-6 sm:grid-cols-4">
            {member.yearsExperience !== undefined && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-slate-900">
                  <Clock className="h-5 w-5 text-blue-600" />
                  {member.yearsExperience}+
                </div>
                <div className="text-xs text-slate-500">Years Experience</div>
              </div>
            )}
            {member.tradeType && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-lg font-semibold text-slate-900">
                  <Wrench className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-xs text-slate-500">{member.tradeType}</div>
              </div>
            )}
            {member.isVerified && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-lg font-semibold text-green-600">
                  <Shield className="h-5 w-5" />
                  Verified
                </div>
                <div className="text-xs text-slate-500">Background Check</div>
              </div>
            )}
            {member.createdAt && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-lg font-semibold text-slate-900">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-xs text-slate-500">
                  Member since {new Date(member.createdAt).getFullYear()}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Phone className="h-5 w-5 text-blue-600" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasContactInfo ? (
              <>
                {member.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <a href={`tel:${member.phone}`} className="text-blue-600 hover:underline">
                      {member.phone}
                    </a>
                  </div>
                )}
                {member.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline">
                      {member.email}
                    </a>
                  </div>
                )}
                {member.companyWebsite && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-slate-400" />
                    <a
                      href={
                        member.companyWebsite.startsWith("http")
                          ? member.companyWebsite
                          : `https://${member.companyWebsite}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {member.companyWebsite}
                    </a>
                  </div>
                )}
              </>
            ) : (
              <p className="italic text-slate-400">
                {isOwnProfile
                  ? "Add your contact information to help clients reach you."
                  : "Contact information not provided."}
              </p>
            )}

            {/* Social Links */}
            {hasSocialLinks && (
              <>
                <Separator />
                <div className="flex flex-wrap gap-2">
                  {member.socialLinks?.facebook && (
                    <a
                      href={member.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-slate-100 p-2 transition hover:bg-blue-100"
                      aria-label="Facebook"
                    >
                      <Facebook className="h-5 w-5 text-blue-600" />
                    </a>
                  )}
                  {member.socialLinks?.instagram && (
                    <a
                      href={member.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-slate-100 p-2 transition hover:bg-pink-100"
                      aria-label="Instagram"
                    >
                      <Instagram className="h-5 w-5 text-pink-600" />
                    </a>
                  )}
                  {member.socialLinks?.twitter && (
                    <a
                      href={member.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-slate-100 p-2 transition hover:bg-sky-100"
                      aria-label="Twitter"
                    >
                      <Twitter className="h-5 w-5 text-sky-500" />
                    </a>
                  )}
                  {member.socialLinks?.linkedin && (
                    <a
                      href={member.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-slate-100 p-2 transition hover:bg-blue-100"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="h-5 w-5 text-blue-700" />
                    </a>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Location & Service Area */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-blue-600" />
              Location & Service Area
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasLocation ? (
              <>
                {(member.city || member.state) && (
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-700">
                      {[member.city, member.state, member.zip].filter(Boolean).join(", ")}
                    </span>
                  </div>
                )}
                {member.serviceArea && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-slate-600">Service Area</p>
                    <p className="text-slate-700">{member.serviceArea}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="italic text-slate-400">
                {isOwnProfile ? "Add your location and service area." : "Location not specified."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Company Information */}
      {(member.companyName || member.companyLicense) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {member.companyName && (
              <div>
                <p className="text-sm font-medium text-slate-600">Company Name</p>
                <p className="text-lg font-semibold text-slate-900">{member.companyName}</p>
              </div>
            )}
            {member.companyLicense && (
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-slate-700">License: {member.companyLicense}</span>
              </div>
            )}
            {member.jobTitle && (
              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-slate-400" />
                <span className="text-slate-700">{member.jobTitle}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Specialties & Skills */}
      {(hasSpecialties || hasSkills) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wrench className="h-5 w-5 text-blue-600" />
              Specialties & Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasSpecialties && (
              <div>
                <p className="mb-2 text-sm font-medium text-slate-600">Specialties</p>
                <div className="flex flex-wrap gap-2">
                  {member.specialties!.map((specialty) => (
                    <Badge
                      key={specialty}
                      variant="secondary"
                      className="bg-amber-100 text-amber-800"
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {hasSkills && (
              <div>
                <p className="mb-2 text-sm font-medium text-slate-600">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {member.skills!.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Certifications */}
      {hasCertifications && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5 text-blue-600" />
              Certifications & Licenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {member.certifications!.map((cert) => (
                <div
                  key={cert}
                  className="flex items-center gap-3 rounded-lg border bg-slate-50 p-3"
                >
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-slate-700">{cert}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Work History */}
      {member.workHistory && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="h-5 w-5 text-blue-600" />
              Work History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-slate-700">{member.workHistory}</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Profile CTA */}
      {isOwnProfile && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="font-semibold text-blue-900">Complete your profile</p>
              <p className="text-sm text-blue-700">
                Add more details to increase your visibility to potential clients
              </p>
            </div>
            <Link href="/trades/onboarding">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Edit Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
