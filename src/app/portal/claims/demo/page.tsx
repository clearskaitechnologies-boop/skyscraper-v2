"use client";

/**
 * Demo Claim Detail Page - Client Portal
 * Shows what a claim detail page looks like with sample data
 * Uses the unified ClientWorkspace component for consistent UI
 */

import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import {
  ClientWorkspace,
  WorkspaceDocument,
  WorkspaceInvoice,
  WorkspaceMessage,
  WorkspacePhoto,
  WorkspaceProject,
  WorkspaceSignedDoc,
  WorkspaceTimelineEvent,
} from "@/components/portal/ClientWorkspace";

// Demo Data
const DEMO_CLAIM_PROJECT: WorkspaceProject = {
  id: "demo-claim-preview",
  type: "claim",
  title: "Storm Damage Restoration",
  description:
    "Roof and siding damage from the hailstorm. ClearSkai Roofing is handling the full restoration including insurance coordination.",
  status: "in_progress",
  progress: 65,
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  updatedAt: new Date().toISOString(),
  tradeType: "Roofing & Exterior",
  urgency: "high",
  address: "123 Main Street, Phoenix, AZ 85001",
  claimNumber: "DEMO-2026-001234",
  dateOfLoss: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
  contractor: {
    id: "demo-contractor",
    name: "Michael Chen",
    companyName: "ClearSkai Roofing",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    phone: "(480) 555-9876",
    email: "michael@clearskairoofing.com",
  },
};

const DEMO_PHOTOS: WorkspacePhoto[] = [
  {
    id: "demo-photo-1",
    url: "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=800",
    thumbnailUrl: "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400",
    caption: "Initial roof damage - hail impacts visible",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString(),
    uploadedBy: "Michael Chen",
    category: "Damage Assessment",
  },
  {
    id: "demo-photo-2",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    thumbnailUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
    caption: "Shingle granule loss detail",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString(),
    uploadedBy: "Michael Chen",
    category: "Damage Assessment",
  },
  {
    id: "demo-photo-3",
    url: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800",
    thumbnailUrl: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400",
    caption: "North-facing siding damage",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 27).toISOString(),
    uploadedBy: "Michael Chen",
    category: "Damage Assessment",
  },
  {
    id: "demo-photo-4",
    url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800",
    thumbnailUrl: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400",
    caption: "Roof tear-off in progress",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    uploadedBy: "Michael Chen",
    category: "Work Progress",
  },
  {
    id: "demo-photo-5",
    url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    thumbnailUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    caption: "New underlayment installed",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    uploadedBy: "Michael Chen",
    category: "Work Progress",
  },
];

const DEMO_DOCUMENTS: WorkspaceDocument[] = [
  {
    id: "demo-doc-1",
    name: "Insurance Estimate - State Farm.pdf",
    type: "application/pdf",
    size: 3456789,
    url: "#",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
    uploadedBy: "Michael Chen",
    category: "Insurance",
  },
  {
    id: "demo-doc-2",
    name: "Xactimate Scope of Work.pdf",
    type: "application/pdf",
    size: 2345678,
    url: "#",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 24).toISOString(),
    uploadedBy: "Michael Chen",
    category: "Scope",
  },
  {
    id: "demo-doc-3",
    name: "Material Specifications.pdf",
    type: "application/pdf",
    size: 1234567,
    url: "#",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    uploadedBy: "Michael Chen",
    category: "Specifications",
  },
  {
    id: "demo-doc-4",
    name: "Supplement Request #1.pdf",
    type: "application/pdf",
    size: 987654,
    url: "#",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    uploadedBy: "Michael Chen",
    category: "Supplement",
  },
];

const DEMO_SIGNED_DOCS: WorkspaceSignedDoc[] = [
  {
    id: "demo-sig-1",
    name: "Assignment of Benefits (AOB)",
    status: "signed",
    signedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString(),
    url: "#",
  },
  {
    id: "demo-sig-2",
    name: "Restoration Contract Agreement",
    status: "signed",
    signedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString(),
    url: "#",
  },
  {
    id: "demo-sig-3",
    name: "Change Order - Additional Deck Repairs",
    status: "pending",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    url: "#",
    signUrl: "#sign-change-order",
  },
  {
    id: "demo-sig-4",
    name: "Completion Certificate",
    status: "pending",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    url: "#",
    signUrl: "#sign-completion",
  },
];

const DEMO_INVOICES: WorkspaceInvoice[] = [
  {
    id: "demo-inv-1",
    number: "INV-DEMO-001",
    amount: 2500.0,
    status: "paid",
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    paidAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
    items: [{ description: "Insurance Deductible", quantity: 1, rate: 2500, amount: 2500 }],
  },
  {
    id: "demo-inv-2",
    number: "INV-DEMO-002",
    amount: 18750.0,
    status: "sent",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    items: [
      { description: "Architectural Shingles (28 sq)", quantity: 28, rate: 375, amount: 10500 },
      { description: "Underlayment & Ice/Water Shield", quantity: 1, rate: 2800, amount: 2800 },
      { description: "Labor - Complete Roof Install", quantity: 1, rate: 4200, amount: 4200 },
      { description: "Debris & Disposal", quantity: 1, rate: 1250, amount: 1250 },
    ],
  },
];

const DEMO_TIMELINE: WorkspaceTimelineEvent[] = [
  {
    id: "demo-event-1",
    type: "status_change",
    title: "Claim Created",
    description: "Insurance claim filed following storm damage",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    user: "System",
  },
  {
    id: "demo-event-2",
    type: "inspection",
    title: "Initial Inspection",
    description: "Damage assessment completed with 42 photos documented",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString(),
    user: "Michael Chen",
  },
  {
    id: "demo-event-3",
    type: "signature",
    title: "Documents Signed",
    description: "AOB and Restoration Agreement executed",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString(),
    user: "Homeowner",
  },
  {
    id: "demo-event-4",
    type: "document",
    title: "Insurance Estimate Received",
    description: "Adjuster approved estimate for $21,250",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    user: "State Farm Insurance",
  },
  {
    id: "demo-event-5",
    type: "payment",
    title: "Deductible Payment",
    description: "Payment of $2,500 received",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
    user: "System",
  },
  {
    id: "demo-event-6",
    type: "status_change",
    title: "Work Started",
    description: "Materials delivered, roof tear-off begun",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    user: "Michael Chen",
  },
  {
    id: "demo-event-7",
    type: "photo",
    title: "Progress Photos Added",
    description: "2 new work progress photos uploaded",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    user: "Michael Chen",
  },
];

const DEMO_MESSAGES: WorkspaceMessage[] = [
  {
    id: "demo-msg-1",
    content:
      "Great news! The insurance adjuster has approved the full scope. We are scheduling materials delivery for next week.",
    senderId: "contractor-1",
    senderName: "Michael Chen",
    senderAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    isFromContractor: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
    read: true,
  },
  {
    id: "demo-msg-2",
    content: "That's wonderful! Will I need to be home when you start the work?",
    senderId: "client-1",
    senderName: "You",
    isFromContractor: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 17).toISOString(),
    read: true,
  },
  {
    id: "demo-msg-3",
    content:
      "Not at all! As long as we can access the property, you can go about your normal routine. We will keep you updated with photos throughout the process.",
    senderId: "contractor-1",
    senderName: "Michael Chen",
    senderAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    isFromContractor: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 17).toISOString(),
    read: true,
  },
  {
    id: "demo-msg-4",
    content:
      "Update: We found some additional deck damage during tear-off that was not visible before. I have uploaded a change order for your review and signature.",
    senderId: "contractor-1",
    senderName: "Michael Chen",
    senderAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    isFromContractor: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
  },
];

export default function DemoClaimPage() {
  const handleUploadPhoto = async () => {
    toast.info("This is a demo - uploads are disabled in preview mode");
  };

  const handleUploadDocument = async () => {
    toast.info("This is a demo - uploads are disabled in preview mode");
  };

  const handleSendMessage = async () => {
    toast.info("This is a demo - messaging is disabled in preview mode");
  };

  return (
    <div>
      {/* Demo Banner */}
      <div className="mb-6 rounded-xl border-2 border-dashed border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-4 dark:border-amber-700 dark:from-amber-900/20 dark:to-orange-900/20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-800">
            <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-300" />
          </div>
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-200">Demo Claim Preview</p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              This is sample data showing what your claim workspace will look like when a contractor
              shares a claim with you.
            </p>
          </div>
        </div>
      </div>

      {/* Client Workspace */}
      <ClientWorkspace
        project={DEMO_CLAIM_PROJECT}
        photos={DEMO_PHOTOS}
        documents={DEMO_DOCUMENTS}
        signedDocs={DEMO_SIGNED_DOCS}
        invoices={DEMO_INVOICES}
        timeline={DEMO_TIMELINE}
        messages={DEMO_MESSAGES}
        canUpload={false}
        canMessage={true}
        backLink="/portal/claims"
        backLabel="Back to Claims"
        onUploadPhoto={handleUploadPhoto}
        onUploadDocument={handleUploadDocument}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
