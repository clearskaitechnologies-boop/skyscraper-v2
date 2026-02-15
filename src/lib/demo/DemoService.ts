/**
 * DemoService - Centralized Demo Data Management
 *
 * This service controls ALL demo mode logic:
 * - Check if demo mode is active for org
 * - Provide demo workspace data when active
 * - Never return demo data when real mode is on
 *
 * PRINCIPLE: Demo is a first-class feature, not a fallback.
 */

import { isDemoMode as checkEnvDemoMode } from "@/lib/demoMode";
import prisma from "@/lib/prisma";

import {
  WorkspaceDocument,
  WorkspaceInvoice,
  WorkspaceMessage,
  WorkspacePhoto,
  WorkspaceProject,
  WorkspaceSignedDoc,
  WorkspaceTimelineEvent,
} from "@/components/portal/ClientWorkspace";

// ============================================================================
// TYPES
// ============================================================================

export interface DemoOrgStatus {
  isDemoEnabled: boolean;
  envDemoMode: boolean;
  orgDemoMode: boolean;
  demoSeededAt: Date | null;
}

export interface DemoWorkspaceData {
  project: WorkspaceProject;
  photos: WorkspacePhoto[];
  documents: WorkspaceDocument[];
  signedDocs: WorkspaceSignedDoc[];
  invoices: WorkspaceInvoice[];
  timeline: WorkspaceTimelineEvent[];
  messages: WorkspaceMessage[];
}

// ============================================================================
// DEMO CHECK SERVICE
// ============================================================================

/**
 * Check if demo mode is active for a user/org
 * Demo is active if:
 * 1. NEXT_PUBLIC_DEMO_MODE=true in env, OR
 * 2. Org has demoMode=true in database
 */
export async function isDemoActive(orgId?: string | null): Promise<boolean> {
  // Always check env first
  if (checkEnvDemoMode()) {
    return true;
  }

  // Check org-level demo mode
  if (orgId) {
    try {
      const org = await prisma.org.findUnique({
        where: { id: orgId },
        select: { demoMode: true },
      });
      return org?.demoMode === true;
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Get detailed demo status for an org
 */
export async function getDemoStatus(orgId: string): Promise<DemoOrgStatus> {
  const envDemoMode = checkEnvDemoMode();

  let orgDemoMode = false;
  let demoSeededAt: Date | null = null;

  try {
    const org = await prisma.org.findUnique({
      where: { id: orgId },
      select: { demoMode: true, demoSeededAt: true },
    });
    orgDemoMode = org?.demoMode === true;
    demoSeededAt = org?.demoSeededAt ?? null;
  } catch {
    // Ignore errors, default to false
  }

  return {
    isDemoEnabled: envDemoMode || orgDemoMode,
    envDemoMode,
    orgDemoMode,
    demoSeededAt,
  };
}

// ============================================================================
// DEMO WORKSPACE DATA - JOBS
// ============================================================================

export function getDemoJobWorkspace(jobId?: string): DemoWorkspaceData {
  const project: WorkspaceProject = {
    id: jobId || "demo-job-1",
    type: "job",
    title: "Security Cameras & Driveway Lighting",
    description:
      "ClearSkai Technologies is scheduled to assess your property for security camera placement and smart driveway lighting installation.",
    status: "in_progress",
    progress: 35,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    tradeType: "Smart Home & Technology",
    urgency: "normal",
    address: "123 Smart Home Lane, Phoenix, AZ 85001",
    contractor: {
      id: "demo-contractor-1",
      name: "Mike Johnson",
      companyName: "ClearSkai Technologies",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
      phone: "(480) 555-0123",
      email: "mike@clearskaitech.com",
    },
  };

  const photos: WorkspacePhoto[] = [
    {
      id: "demo-photo-1",
      url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
      thumbnailUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
      caption: "Front entrance - proposed camera location",
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      uploadedBy: "Mike Johnson",
      category: "Site Assessment",
    },
    {
      id: "demo-photo-2",
      url: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800",
      thumbnailUrl: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400",
      caption: "Driveway lighting area",
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      uploadedBy: "Mike Johnson",
      category: "Site Assessment",
    },
    {
      id: "demo-photo-3",
      url: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800",
      thumbnailUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?w=400",
      caption: "Backyard coverage area",
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      uploadedBy: "Mike Johnson",
      category: "Site Assessment",
    },
  ];

  const documents: WorkspaceDocument[] = [
    {
      id: "demo-doc-1",
      name: "Project Proposal - Security System.pdf",
      type: "application/pdf",
      size: 2456789,
      url: "#",
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
      uploadedBy: "Mike Johnson",
      category: "Proposal",
    },
    {
      id: "demo-doc-2",
      name: "Camera System Specifications.pdf",
      type: "application/pdf",
      size: 1234567,
      url: "#",
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      uploadedBy: "Mike Johnson",
      category: "Specifications",
    },
  ];

  const signedDocs: WorkspaceSignedDoc[] = [
    {
      id: "demo-sig-1",
      name: "Project Agreement & Terms",
      status: "pending",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      url: "#",
      signUrl: "#sign-agreement",
    },
    {
      id: "demo-sig-2",
      name: "Initial Assessment Authorization",
      status: "signed",
      signedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      url: "#",
    },
  ];

  const invoices: WorkspaceInvoice[] = [
    {
      id: "demo-inv-1",
      number: "INV-2024-001",
      amount: 2500.0,
      status: "paid",
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      paidAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
      items: [
        { description: "Site Assessment & Planning", quantity: 1, rate: 500, amount: 500 },
        { description: "Equipment Deposit (50%)", quantity: 1, rate: 2000, amount: 2000 },
      ],
    },
    {
      id: "demo-inv-2",
      number: "INV-2024-002",
      amount: 4750.0,
      status: "sent",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
      items: [
        { description: "4K Security Cameras (4 units)", quantity: 4, rate: 450, amount: 1800 },
        {
          description: "Smart LED Driveway Lights (6 units)",
          quantity: 6,
          rate: 175,
          amount: 1050,
        },
        { description: "Installation Labor", quantity: 8, rate: 125, amount: 1000 },
      ],
    },
  ];

  const timeline: WorkspaceTimelineEvent[] = [
    {
      id: "demo-event-1",
      type: "status_change",
      title: "Project Started",
      description: "ClearSkai Technologies accepted your project request",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      user: "System",
    },
    {
      id: "demo-event-2",
      type: "document",
      title: "Proposal Uploaded",
      description: "Project Proposal has been shared with you",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
      user: "Mike Johnson",
    },
    {
      id: "demo-event-3",
      type: "payment",
      title: "Payment Received",
      description: "Payment of $2,500.00 has been processed",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
      user: "System",
    },
    {
      id: "demo-event-4",
      type: "photo",
      title: "Site Assessment Photos Added",
      description: "3 photos have been added to document the assessment",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      user: "Mike Johnson",
    },
  ];

  const messages: WorkspaceMessage[] = [
    {
      id: "demo-msg-1",
      content:
        "Hi! Thanks for choosing ClearSkai Technologies. I have uploaded my assessment photos. The proposed system looks great for your needs.",
      senderId: "contractor-1",
      senderName: "Mike Johnson",
      senderAvatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
      isFromContractor: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      read: true,
    },
    {
      id: "demo-msg-2",
      content: "Thanks Mike! The photos look great. When can we schedule the installation?",
      senderId: "client-1",
      senderName: "You",
      isFromContractor: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      read: true,
    },
    {
      id: "demo-msg-3",
      content:
        "I have availability next Tuesday or Thursday afternoon. Would either work for you? The installation should take about 6-8 hours.",
      senderId: "contractor-1",
      senderName: "Mike Johnson",
      senderAvatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
      isFromContractor: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      read: true,
    },
  ];

  return { project, photos, documents, signedDocs, invoices, timeline, messages };
}

// ============================================================================
// DEMO WORKSPACE DATA - CLAIMS
// ============================================================================

export function getDemoClaimWorkspace(claimId?: string): DemoWorkspaceData {
  const project: WorkspaceProject = {
    id: claimId || "demo-claim-1",
    type: "claim",
    title: "Hail Damage Roof Repair",
    description:
      "Storm damage claim for residential roof repair following the June 15th hailstorm. Insurance claim #INSR-2024-78432 filed with State Farm.",
    status: "in_progress",
    progress: 65,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    tradeType: "Roofing",
    urgency: "high",
    address: "456 Storm Damage Way, Scottsdale, AZ 85254",
    contractor: {
      id: "demo-contractor-2",
      name: "Sarah Martinez",
      companyName: "Arizona Restoration Pros",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      phone: "(480) 555-0456",
      email: "sarah@azrestorationpros.com",
    },
    claimNumber: "INSR-2024-78432",
  };

  const photos: WorkspacePhoto[] = [
    {
      id: "demo-claim-photo-1",
      url: "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=800",
      thumbnailUrl: "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400",
      caption: "Roof damage overview - north section",
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
      uploadedBy: "Sarah Martinez",
      category: "Damage Documentation",
    },
    {
      id: "demo-claim-photo-2",
      url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      thumbnailUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
      caption: "Shingle impact damage closeup",
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
      uploadedBy: "Sarah Martinez",
      category: "Damage Documentation",
    },
    {
      id: "demo-claim-photo-3",
      url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
      thumbnailUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
      caption: "Gutter damage from hail",
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11).toISOString(),
      uploadedBy: "Sarah Martinez",
      category: "Damage Documentation",
    },
  ];

  const documents: WorkspaceDocument[] = [
    {
      id: "demo-claim-doc-1",
      name: "Insurance Claim - Initial Report.pdf",
      type: "application/pdf",
      size: 3456789,
      url: "#",
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 13).toISOString(),
      uploadedBy: "Sarah Martinez",
      category: "Insurance",
    },
    {
      id: "demo-claim-doc-2",
      name: "Roof Inspection Report.pdf",
      type: "application/pdf",
      size: 2345678,
      url: "#",
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      uploadedBy: "Sarah Martinez",
      category: "Inspection",
    },
    {
      id: "demo-claim-doc-3",
      name: "Material Estimate - GAF Timberline.pdf",
      type: "application/pdf",
      size: 1234567,
      url: "#",
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
      uploadedBy: "Sarah Martinez",
      category: "Estimate",
    },
  ];

  const signedDocs: WorkspaceSignedDoc[] = [
    {
      id: "demo-claim-sig-1",
      name: "Assignment of Benefits",
      status: "signed",
      signedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 13).toISOString(),
      url: "#",
    },
    {
      id: "demo-claim-sig-2",
      name: "Work Authorization",
      status: "signed",
      signedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      url: "#",
    },
    {
      id: "demo-claim-sig-3",
      name: "Final Invoice Approval",
      status: "pending",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      url: "#",
      signUrl: "#sign-invoice",
    },
  ];

  const invoices: WorkspaceInvoice[] = [
    {
      id: "demo-claim-inv-1",
      number: "INV-CLAIM-001",
      amount: 8500.0,
      status: "draft",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      items: [
        {
          description: "GAF Timberline HDZ Shingles (24 sq)",
          quantity: 24,
          rate: 200,
          amount: 4800,
        },
        { description: "Underlayment & Ice/Water Shield", quantity: 1, rate: 1200, amount: 1200 },
        { description: "Labor - Tear-off & Installation", quantity: 1, rate: 2500, amount: 2500 },
      ],
    },
  ];

  const timeline: WorkspaceTimelineEvent[] = [
    {
      id: "demo-claim-event-1",
      type: "status_change",
      title: "Claim Filed",
      description: "Insurance claim filed with State Farm",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
      user: "System",
    },
    {
      id: "demo-claim-event-2",
      type: "document",
      title: "Inspection Report Uploaded",
      description: "Professional roof inspection completed and documented",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      user: "Sarah Martinez",
    },
    {
      id: "demo-claim-event-3",
      type: "status_change",
      title: "Adjuster Assigned",
      description: "James Wilson assigned as claim adjuster",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      user: "State Farm",
    },
    {
      id: "demo-claim-event-4",
      type: "status_change",
      title: "Claim Approved",
      description: "Insurance approved claim for $8,500",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      user: "State Farm",
    },
  ];

  const messages: WorkspaceMessage[] = [
    {
      id: "demo-claim-msg-1",
      content:
        "Good news! Your claim has been approved by State Farm. We can schedule the work as soon as you're ready.",
      senderId: "contractor-2",
      senderName: "Sarah Martinez",
      senderAvatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      isFromContractor: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      read: true,
    },
    {
      id: "demo-claim-msg-2",
      content: "That's great news! How soon can you start?",
      senderId: "client-1",
      senderName: "You",
      isFromContractor: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      read: true,
    },
    {
      id: "demo-claim-msg-3",
      content:
        "We can start Monday. Weather looks good for the next week. I'll have the materials delivered Friday.",
      senderId: "contractor-2",
      senderName: "Sarah Martinez",
      senderAvatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      isFromContractor: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      read: true,
    },
  ];

  return { project, photos, documents, signedDocs, invoices, timeline, messages };
}

// ============================================================================
// DEMO LIST DATA
// ============================================================================

export interface DemoJobListItem {
  id: string;
  title: string;
  description: string;
  status: string;
  progress: number;
  createdAt: string;
  tradeType: string;
  contractor?: {
    name: string;
    companyName: string;
    avatar?: string;
  };
}

export interface DemoClaimListItem {
  id: string;
  title: string;
  description: string;
  status: string;
  progress: number;
  createdAt: string;
  claimNumber?: string;
  insuranceCompany?: string;
  contractor?: {
    name: string;
    companyName: string;
    avatar?: string;
  };
}

export function getDemoJobsList(): DemoJobListItem[] {
  return [
    {
      id: "demo-job-1",
      title: "Security Cameras & Driveway Lighting",
      description: "Smart home security system installation with automated driveway lighting",
      status: "in_progress",
      progress: 35,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      tradeType: "Smart Home & Technology",
      contractor: {
        name: "Mike Johnson",
        companyName: "ClearSkai Technologies",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
      },
    },
    {
      id: "demo-job-2",
      title: "Backyard Pergola Construction",
      description: "Custom cedar pergola with integrated lighting",
      status: "scheduled",
      progress: 10,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      tradeType: "Outdoor Living",
      contractor: {
        name: "Carlos Rivera",
        companyName: "Desert Outdoor Living",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      },
    },
  ];
}

export function getDemoClaimsList(): DemoClaimListItem[] {
  return [
    {
      id: "demo-claim-1",
      title: "Hail Damage Roof Repair",
      description: "Storm damage claim for residential roof following June 15th hailstorm",
      status: "in_progress",
      progress: 65,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
      claimNumber: "INSR-2024-78432",
      insuranceCompany: "State Farm",
      contractor: {
        name: "Sarah Martinez",
        companyName: "Arizona Restoration Pros",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      },
    },
  ];
}

// ============================================================================
// DEMO ACTIVITY FEED
// ============================================================================

export interface DemoActivityItem {
  id: string;
  type: "message" | "document" | "photo" | "status" | "payment" | "signature";
  title: string;
  description: string;
  timestamp: string;
  projectId?: string;
  projectTitle?: string;
  user?: string;
  avatar?: string;
}

export function getDemoActivityFeed(): DemoActivityItem[] {
  return [
    {
      id: "activity-1",
      type: "message",
      title: "New message from Mike Johnson",
      description: "I have availability next Tuesday or Thursday afternoon...",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      projectId: "demo-job-1",
      projectTitle: "Security Cameras & Driveway Lighting",
      user: "Mike Johnson",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    },
    {
      id: "activity-2",
      type: "status",
      title: "Claim Approved",
      description: "Insurance approved your claim for $8,500",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      projectId: "demo-claim-1",
      projectTitle: "Hail Damage Roof Repair",
    },
    {
      id: "activity-3",
      type: "document",
      title: "New document uploaded",
      description: "Material Estimate - GAF Timberline.pdf",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
      projectId: "demo-claim-1",
      projectTitle: "Hail Damage Roof Repair",
      user: "Sarah Martinez",
    },
    {
      id: "activity-4",
      type: "photo",
      title: "Site photos added",
      description: "3 photos added to Site Assessment",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      projectId: "demo-job-1",
      projectTitle: "Security Cameras & Driveway Lighting",
      user: "Mike Johnson",
    },
  ];
}

// ============================================================================
// EXPORT DEFAULT SERVICE
// ============================================================================

const DemoService = {
  isDemoActive,
  getDemoStatus,
  getDemoJobWorkspace,
  getDemoClaimWorkspace,
  getDemoJobsList,
  getDemoClaimsList,
  getDemoActivityFeed,
};

export default DemoService;
