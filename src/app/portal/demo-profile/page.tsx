/**
 * Demo Contractor Profile Page
 * Shows ClearSkai Technologies as an example contractor profile
 * All info is demo/placeholder to show clients what to expect
 */

"use client";

import {
  ArrowLeft,
  Award,
  BadgeCheck,
  Briefcase,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Heart,
  Image as ImageIcon,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Shield,
  ShieldCheck,
  Star,
  UserPlus,
  Users,
  Verified,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Demo Profile Data
const DEMO_PROFILE = {
  companyName: "ClearSkai Technologies LLC",
  displayName: "ClearSkai Technologies",
  tradeType: "Smart Home & Technology",
  tagline: "Your trusted partner in smart home security & automation",
  bio: "ClearSkai Technologies specializes in smart home installation, security camera systems, and home automation. We serve the Phoenix metro area with expert installations and responsive customer service. Our team is fully licensed, bonded, and insured for your peace of mind.",
  city: "Phoenix",
  state: "AZ",
  zip: "85001",
  phone: "(555) 555-5555",
  email: "demo@democompany.com",
  website: "https://demo.example.com",
  foundedYear: 2018,
  yearsExperience: 8,
  teamSize: "5-10",
  isVerified: true,
  isLicensed: true,
  isBonded: true,
  isInsured: true,
  rocNumber: "DEMO-12345",
  emergencyAvailable: true,
  freeEstimates: true,
  responseTime: "< 2 hours",
  rating: 5.0,
  reviewCount: 47,
  completedJobs: 124,
  repeatClients: 89,
  specialties: [
    "Security Camera Installation",
    "Smart Doorbell & Locks",
    "Home Automation Systems",
    "Outdoor Lighting",
    "WiFi & Network Setup",
    "Smart Thermostat Installation",
  ],
  serviceAreas: ["Phoenix", "Scottsdale", "Tempe", "Mesa", "Gilbert", "Chandler"],
};

// Demo Reviews
const DEMO_REVIEWS = [
  {
    id: 1,
    author: "John D.",
    rating: 5,
    date: "2 weeks ago",
    text: "Excellent work installing our Ring cameras and smart doorbell. Very professional and cleaned up after themselves.",
  },
  {
    id: 2,
    author: "Sarah M.",
    rating: 5,
    date: "1 month ago",
    text: "Set up our entire smart home system including Nest thermostats and smart lighting. Works perfectly!",
  },
  {
    id: 3,
    author: "Robert K.",
    rating: 5,
    date: "2 months ago",
    text: "Quick response time for our security camera installation. Fair pricing and great communication throughout.",
  },
];

export default function DemoProfilePage() {
  const [activeTab, setActiveTab] = useState("overview");

  const handleDemoAction = (action: string) => {
    toast.info(`📋 Demo Mode: "${action}" would work with real contractor profiles`, {
      duration: 3000,
    });
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-green-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
        {/* Demo Banner */}
        <div className="sticky top-0 z-50 border-b border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/50">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-500 text-white">DEMO</Badge>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                This is a demo profile showing how contractor profiles appear
              </p>
            </div>
            <Link href="/portal/find-a-pro">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Search
              </Button>
            </Link>
          </div>
        </div>

        {/* Cover Photo */}
        <div className="relative h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 md:h-64">
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white/70">
              <Camera className="mx-auto mb-2 h-10 w-10" />
              <p className="text-sm">Cover photo area</p>
            </div>
          </div>

          {/* Top badges */}
          <div className="absolute right-4 top-4 flex gap-2">
            <Badge className="bg-blue-500 text-white shadow-lg">
              <BadgeCheck className="mr-1 h-3 w-3" />
              Verified
            </Badge>
            <Badge className="bg-red-500 text-white shadow-lg">
              <Zap className="mr-1 h-3 w-3" />
              24/7 Emergency
            </Badge>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-12 pt-6">
          {/* Profile Header */}
          <div className="-mt-16 mb-8 flex flex-col gap-6 md:-mt-20 md:flex-row md:items-end md:gap-8">
            {/* Avatar */}
            <div className="relative z-10">
              <Avatar className="h-32 w-32 border-4 border-transparent shadow-xl dark:border-slate-900 md:h-40 md:w-40">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-4xl font-bold text-white">
                  CS
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 rounded-full bg-green-500 p-1.5 shadow-lg">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
            </div>

            {/* Name & Info */}
            <div className="flex-1 rounded-2xl bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:bg-slate-800/80 md:pt-8">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                      {DEMO_PROFILE.displayName}
                    </h1>
                    <Verified className="h-6 w-6 text-blue-500" />
                  </div>
                  <p className="mt-1 text-lg text-slate-500">{DEMO_PROFILE.tradeType}</p>
                  <p className="mt-2 italic text-slate-600 dark:text-slate-400">
                    &ldquo;{DEMO_PROFILE.tagline}&rdquo;
                  </p>
                </div>

                {/* Rating */}
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                    <span className="text-2xl font-bold">{DEMO_PROFILE.rating.toFixed(1)}</span>
                  </div>
                  <p className="text-sm text-slate-500">{DEMO_PROFILE.reviewCount} reviews</p>
                </div>
              </div>

              {/* Location & Contact */}
              <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-red-500" />
                  {DEMO_PROFILE.city}, {DEMO_PROFILE.state}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4 text-green-500" />
                  {DEMO_PROFILE.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4 text-blue-500" />
                  {DEMO_PROFILE.email}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-purple-500" />
                  Responds {DEMO_PROFILE.responseTime}
                </span>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => handleDemoAction("Message")} size="sm">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message
                </Button>
                <Button onClick={() => handleDemoAction("Connect")} size="sm" variant="outline">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Connect
                </Button>
                <Button
                  onClick={() => handleDemoAction("Request Quote")}
                  size="sm"
                  variant="outline"
                >
                  <Briefcase className="mr-2 h-4 w-4" />
                  Request Quote
                </Button>
                <Button onClick={() => handleDemoAction("Save")} size="sm" variant="ghost">
                  <Heart className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Stats & Trust */}
            <div className="space-y-6">
              {/* Stats Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Business Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Calendar className="h-4 w-4" />
                      Years in Business
                    </span>
                    <span className="font-semibold">{DEMO_PROFILE.yearsExperience}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="h-4 w-4" />
                      Jobs Completed
                    </span>
                    <span className="font-semibold">{DEMO_PROFILE.completedJobs}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Heart className="h-4 w-4" />
                      Repeat Clients
                    </span>
                    <span className="font-semibold">{DEMO_PROFILE.repeatClients}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Users className="h-4 w-4" />
                      Team Size
                    </span>
                    <span className="font-semibold">{DEMO_PROFILE.teamSize}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Trust & Credentials */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Trust & Credentials</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Tooltip>
                    <TooltipTrigger className="w-full">
                      <Badge
                        variant="outline"
                        className="w-full justify-start gap-2 border-green-300 bg-green-50 py-2 text-green-700 dark:border-green-700 dark:bg-green-900/30 dark:text-green-400"
                      >
                        <Award className="h-4 w-4" />
                        Licensed - ROC #{DEMO_PROFILE.rocNumber}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>State licensed contractor</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger className="w-full">
                      <Badge
                        variant="outline"
                        className="w-full justify-start gap-2 border-blue-300 bg-blue-50 py-2 text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      >
                        <Shield className="h-4 w-4" />
                        Bonded
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>Surety bond for job completion</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger className="w-full">
                      <Badge
                        variant="outline"
                        className="w-full justify-start gap-2 border-purple-300 bg-purple-50 py-2 text-purple-700 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Insured - General Liability
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>Full liability insurance coverage</TooltipContent>
                  </Tooltip>

                  <Badge
                    variant="outline"
                    className="w-full justify-start gap-2 py-2 text-slate-600 dark:text-slate-400"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Free Estimates
                  </Badge>
                </CardContent>
              </Card>

              {/* Service Areas */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Service Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {DEMO_PROFILE.serviceAreas.map((area) => (
                      <Badge key={area} variant="secondary">
                        <MapPin className="mr-1 h-3 w-3" />
                        {area}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - About & Reviews */}
            <div className="space-y-6 lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="services">Services</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 pt-4">
                  {/* About */}
                  <Card>
                    <CardHeader>
                      <CardTitle>About Us</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 dark:text-slate-400">{DEMO_PROFILE.bio}</p>
                    </CardContent>
                  </Card>

                  {/* Portfolio Placeholder */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Portfolio</CardTitle>
                      <CardDescription>Recent project photos</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div
                            key={i}
                            className="flex aspect-square items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800"
                          >
                            <ImageIcon className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                          </div>
                        ))}
                      </div>
                      <p className="mt-3 text-center text-sm text-slate-500">
                        Portfolio photos would appear here
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="services" className="space-y-6 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Our Specialties</CardTitle>
                      <CardDescription>Services we excel in</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {DEMO_PROFILE.specialties.map((specialty) => (
                          <div
                            key={specialty}
                            className="flex items-center gap-2 rounded-lg border p-3"
                          >
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <span>{specialty}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-6 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Reviews</CardTitle>
                      <CardDescription>
                        {DEMO_PROFILE.reviewCount} reviews • {DEMO_PROFILE.rating.toFixed(1)}{" "}
                        average
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Rating Breakdown */}
                      <div className="mb-6 space-y-2">
                        {[5, 4, 3, 2, 1].map((stars) => (
                          <div key={stars} className="flex items-center gap-2">
                            <span className="w-12 text-sm">{stars} stars</span>
                            <Progress
                              value={stars === 5 ? 92 : stars === 4 ? 8 : 0}
                              className="flex-1"
                            />
                            <span className="w-10 text-right text-sm text-slate-500">
                              {stars === 5 ? "92%" : stars === 4 ? "8%" : "0%"}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Individual Reviews */}
                      {DEMO_REVIEWS.map((review) => (
                        <div key={review.id} className="border-t pt-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{review.author}</span>
                            <span className="text-sm text-slate-500">{review.date}</span>
                          </div>
                          <div className="my-1 flex gap-0.5">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <p className="text-slate-600 dark:text-slate-400">{review.text}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Bottom CTA */}
          <Card className="mt-8 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:border-blue-800 dark:from-blue-900/30 dark:to-indigo-900/30">
            <CardContent className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Ready to find real contractors?
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Search our network to find verified pros in your area
                </p>
              </div>
              <Link href="/portal/find-a-pro">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  Find Contractors
                  <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
