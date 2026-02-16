/**
 * Feature Help Content Registry
 *
 * Maps routes to contextual help content — tips, steps, best practices
 * used by the FeatureHelp lightbulb component on every page.
 */

export interface HelpContent {
  title: string;
  description: string;
  steps?: string[];
  tips?: string[];
  videoUrl?: string;
  docsUrl?: string;
}

/**
 * Route → Help content mapping.
 * Uses prefix matching: "/claims" matches "/claims", "/claims/new", "/claims/[id]", etc.
 * More specific routes are checked first.
 */
export const helpContentRegistry: Record<string, HelpContent> = {
  "/dashboard": {
    title: "Your Command Center",
    description:
      "The dashboard shows your open claims, team performance, weather alerts, and AI insights at a glance.",
    steps: [
      "Review your KPI stats cards at the top — Active Claims, Total Leads, Retail Jobs, and Network Posts",
      "Check the Company Leaderboard for team rankings by revenue, claims, or doors knocked",
      "Monitor Network Activity for new connection requests and opportunities",
      "Use AI Job Scanner to find nearby storm damage automatically",
      "Review weather alerts for severe conditions in your service area",
    ],
    tips: [
      "Click any stat card to drill into its detail page",
      "The leaderboard updates in real-time as your team closes deals",
      "Weather alerts show severe conditions in your service area",
      "Use 'New Claim' and 'New Lead' buttons at the top to quickly add records",
    ],
  },
  "/claims/new": {
    title: "Creating a New Claim",
    description: "Start a new insurance claim by entering the property and homeowner details.",
    steps: [
      "Enter the homeowner's name and property address",
      "Add the insurance carrier and claim number",
      "Set the date of loss and damage type (Hail, Wind, Water, etc.)",
      "Upload any initial photos or documents",
      "Click Submit to create the claim",
    ],
    tips: [
      "The more detail you enter now, the faster AI can generate reports later",
      "You can always edit claim details from the claim workspace",
    ],
  },
  "/claims": {
    title: "Claims Workspace",
    description:
      "Manage all your insurance claims — view status, generate reports, and track approvals.",
    steps: [
      "Click a claim to open its full detail workspace",
      "Use filters to sort by status, carrier, or date of loss",
      "Generate AI reports using the tools in the claim sidebar",
      "Track supplements, supplements, and carrier responses",
      "Use the Rebuttal Builder to fight unfair denials",
    ],
    tips: [
      "Pin your most active claims for quick access",
      "Use the Claims-Ready Folder to package documents for carrier submission",
      "Bad Faith Analysis tool helps identify unfair claim denials",
      "Each claim has its own workspace with photos, documents, reports, and notes",
    ],
  },
  "/claims/rebuttal-builder": {
    title: "Rebuttal Letter Builder",
    description: "Generate professional rebuttal letters to fight carrier denials using AI.",
    steps: [
      "Select the claim you want to rebut",
      "Paste the denial text from the carrier",
      "Choose your tone: Professional, Firm, or Legal",
      "Click Generate to create the rebuttal letter",
      "Review, edit, and download as PDF",
    ],
    tips: [
      "The AI includes relevant building codes and industry standards",
      "Rebuttal letters are automatically saved to your Report History",
      "Use 'Legal' tone for repeated denials or bad faith situations",
    ],
  },
  "/claims/appeal-builder": {
    title: "Appeal Builder",
    description: "Build comprehensive appeal packages for denied or underpaid claims.",
    steps: [
      "Select the claim to appeal",
      "Upload the carrier's denial or underpayment letter",
      "Add supporting evidence — photos, measurements, scope sheets",
      "Generate an AI-assisted appeal narrative",
      "Export as a complete appeal package",
    ],
    tips: [
      "Include date-stamped photos from the original inspection",
      "Reference specific policy language in your appeal",
      "Cross-reference with weather data to prove storm occurred",
    ],
  },
  "/claims/builder": {
    title: "AI Claims Builder",
    description: "Use AI to automatically generate claim scopes, damage assessments, and reports.",
    steps: [
      "Select a claim from your workspace",
      "Upload inspection photos and measurements",
      "Choose the report type you need",
      "Let AI analyze and generate the scope",
      "Review, customize, and export",
    ],
    tips: [
      "Higher quality photos produce more accurate AI analysis",
      "You can regenerate sections if the AI misses something",
      "Reports are saved to your Report History automatically",
    ],
  },
  "/claims-ready-folder": {
    title: "Claims-Ready Folder",
    description: "Package all your claim documents into a submission-ready folder for the carrier.",
    steps: [
      "Open a claim's ready folder",
      "Review all attached documents, photos, and reports",
      "Check off items as you verify them",
      "Download the complete package as a ZIP or PDF",
      "Submit to the carrier with all evidence organized",
    ],
    tips: [
      "The folder automatically pulls in all uploaded photos and generated reports",
      "Add a cover letter to professional submissions",
      "Missing items are flagged so you don't submit incomplete packages",
    ],
  },
  "/claims/tracker": {
    title: "Claim Status Tracker",
    description: "Track the lifecycle of each claim from intake through payment.",
    steps: [
      "View all claims organized by their current status",
      "Click to update a claim's status (New → Active → Approved → Paid)",
      "Add notes when status changes for audit trail",
      "Track days since last status change",
    ],
  },
  "/invoices": {
    title: "Invoice Manager",
    description: "Create, send, and track invoices for your roofing jobs.",
    steps: [
      "Click 'New Invoice' to create an invoice for a job",
      "Select the job and add line items with quantities and prices",
      "Set payment terms (Net 30, Due on Receipt, etc.)",
      "Send to the customer via email or download as PDF",
      "Track payment status in the invoice list",
    ],
    tips: [
      "Link invoices to jobs for automatic financial tracking on your dashboard",
      "Use the Outstanding filter to see unpaid invoices quickly",
      "Export invoices as PDFs for your records or accountant",
    ],
  },
  "/commissions": {
    title: "Commission Tracker",
    description:
      "View, approve, and pay commissions for your sales team based on configured plans.",
    steps: [
      "Review pending commissions awaiting your approval",
      "Click Approve to move a commission to 'Owed' status",
      "Click Pay to record a payment and mark as 'Paid'",
      "View commission history and export for payroll",
    ],
    tips: [
      "Configure commission plans first in Settings → Commission Plans",
      "SkaiScrape supports 10/50, 10/60, 10/70, tiered, and hybrid structures",
      "The rule engine auto-calculates commissions based on job revenue",
    ],
  },
  "/settings/commission-plans": {
    title: "Commission Plan Setup",
    description: "Configure how your reps earn money. Choose from industry-standard structures.",
    steps: [
      "Click 'New Plan' to see available commission structures",
      "Choose a preset: 10/50, 10/60, 10/70, Tiered, Hybrid, or Flat",
      "Customize the name, rates, and overhead percentage",
      "Set one plan as 'Default' — it applies to all new reps",
      "Assign specific plans to individual reps if needed",
    ],
    tips: [
      "10/50 means 10% of revenue with 50% overhead deducted",
      "Tiered plans reward high performers with increasing rates",
      "Hybrid plans combine a base rate with profit sharing and bonuses",
    ],
  },
  "/reports/hub": {
    title: "Reports Hub",
    description: "Generate and manage all your inspection reports, supplements, and documents.",
    steps: [
      "Select a claim to generate a report for",
      "Choose a report template or use AI to generate one",
      "Customize the report with your company branding",
      "Export as PDF or share directly with the carrier",
    ],
    tips: [
      "Company branding is applied automatically from Settings → Branding",
      "Batch reports let you process multiple properties at once",
      "All generated reports appear in Report History",
    ],
  },
  "/reports/history": {
    title: "Report History",
    description: "View all previously generated reports — AI scopes, rebuttals, weather, and PDFs.",
    steps: [
      "Browse your complete report history sorted by date",
      "Filter by type: AI Scope, Rebuttal, Weather, Retail Proposal, etc.",
      "Search by claim number, address, or keyword",
      "Click any report to view or re-download",
    ],
    tips: [
      "All AI-generated content is automatically saved here",
      "Use the search bar to quickly find reports by claim number",
      "Reports are linked to their original claims for easy navigation",
    ],
  },
  "/reports/retail": {
    title: "Retail Proposal Builder",
    description: "Create professional retail proposals for direct-to-homeowner sales.",
    steps: [
      "Click 'New Proposal' and select the property",
      "Add line items for materials, labor, and overhead",
      "Choose a professional template",
      "Add your company branding and terms",
      "Export as PDF to present to the homeowner",
    ],
    tips: [
      "Use material pricing from your vendor network for accurate quotes",
      "Include before/after photos for maximum impact",
      "Track proposal status: Draft → Sent → Accepted → Declined",
    ],
  },
  "/reports/builder": {
    title: "Report Builder",
    description: "Build custom reports with drag-and-drop sections and templates.",
    steps: [
      "Select a base template or start from scratch",
      "Drag report sections into your desired order",
      "Add photos, measurements, and scope items",
      "Preview the final report layout",
      "Export as PDF with your company branding",
    ],
  },
  "/trades": {
    title: "Trades Network",
    description: "Connect with subcontractors, suppliers, and industry partners.",
    steps: [
      "Browse available contractors in your area by specialty",
      "Send network invitations to potential partners",
      "View company profiles, ratings, and specialties",
      "Post jobs for your network to bid on",
      "Manage your company profile and portfolio",
    ],
    tips: [
      "Complete your company profile to attract more connections",
      "Use the Job Board to find subcontract opportunities",
      "Network Activity on your dashboard shows new connections",
    ],
  },
  "/trades/jobs": {
    title: "Trades Job Board",
    description: "Find and manage subcontract job opportunities from your network.",
    steps: [
      "Browse available jobs posted by your network connections",
      "Filter by trade type, location, and pay range",
      "Click 'Apply' to express interest in a job",
      "Track your applications and responses",
    ],
    tips: [
      "Set up job alerts for your preferred trade types",
      "A complete profile with portfolio photos increases your chances",
    ],
  },
  "/trades/company": {
    title: "Company Profile",
    description: "Manage your trades company profile, team members, and public listing.",
    steps: [
      "Update your business name, logo, and description",
      "Add your specialties and service areas",
      "Invite team members to join your company",
      "Manage seats, roles, and permissions",
    ],
    tips: [
      "A complete profile ranks higher in the contractor directory",
      "Add portfolio photos to showcase your work",
      "Set up your hours of operation and emergency availability",
    ],
  },
  "/trades/portfolio": {
    title: "Work Portfolio",
    description: "Showcase your best work to attract new clients and network connections.",
    steps: [
      "Upload before/after photos of completed projects",
      "Add descriptions and project details",
      "Organize by trade type or project category",
      "Share your portfolio link with potential clients",
    ],
  },
  "/weather/analytics": {
    title: "Weather Analytics",
    description:
      "Track severe weather events and identify storm damage opportunities in your area.",
    steps: [
      "View recent hail, wind, and storm events on the map",
      "Filter by severity, date range, and weather type",
      "Click events to see affected properties and neighborhoods",
      "Use AI insights to identify high-probability damage zones",
      "Export storm data for door-knocking route planning",
    ],
    tips: [
      "Set up weather alerts to get notified of new storms automatically",
      "Cross-reference weather data with your property profiles",
      "Storm severity ratings help prioritize door-knocking routes",
    ],
  },
  "/weather/quick-dol": {
    title: "Quick Date-of-Loss Lookup",
    description: "Instantly verify weather conditions on a specific date for claims documentation.",
    steps: [
      "Enter the property address",
      "Select the date of loss",
      "View weather conditions: wind speed, hail size, precipitation",
      "Download the weather verification report",
    ],
    tips: [
      "Weather reports are accepted by most carriers as supporting evidence",
      "Reports include data from NOAA and local weather stations",
    ],
  },
  "/analytics/dashboard": {
    title: "Analytics Dashboard",
    description: "Deep dive into your company's performance metrics and trends.",
    steps: [
      "Review revenue and close rate trends over time",
      "Compare individual rep performance side-by-side",
      "Track conversion funnel: Leads → Claims → Approved → Paid",
      "Export analytics data for reports and meetings",
    ],
    tips: [
      "Compare month-over-month revenue and close rates",
      "Track individual rep performance over time",
      "Export analytics data for your accountant or business meetings",
    ],
  },
  "/settings/branding": {
    title: "Company Branding",
    description: "Customize your logo, colors, and branding across all reports and documents.",
    steps: [
      "Upload your company logo (recommended: 400x400px PNG)",
      "Set your primary and accent brand colors",
      "Preview how branding appears on reports and proposals",
      "Save to apply across all generated documents instantly",
    ],
  },
  "/leads": {
    title: "Lead Management",
    description: "Track, route, and convert incoming leads into signed claims.",
    steps: [
      "New leads appear automatically from intake forms and canvassing",
      "Assign leads to reps based on location, trade, or availability",
      "Update lead stage: New → Contacted → Qualified → Won/Lost",
      "Track lead-to-claim conversion rates on the analytics page",
      "Follow up on uncontacted leads before they go cold",
    ],
    tips: [
      "Leads linked to claims show the full conversion history",
      "Use the 'temperature' field (Hot/Warm/Cold) to prioritize follow-ups",
      "Import leads from CSV via the Import page",
    ],
  },
  "/leads/new": {
    title: "Create New Lead",
    description: "Manually add a new lead from a door knock, referral, or phone call.",
    steps: [
      "Enter the homeowner's name and contact info",
      "Set the lead source (Door Knock, Referral, Website, etc.)",
      "Add property address and damage description",
      "Assign to a sales rep or leave unassigned",
      "Click Create to add to your pipeline",
    ],
  },
  "/leads/import": {
    title: "Import Leads",
    description: "Bulk import leads from a CSV file or external source.",
    steps: [
      "Download the CSV template to see required columns",
      "Fill in your lead data (name, phone, address, source)",
      "Upload the completed CSV file",
      "Map columns to SkaiScraper fields",
      "Review and confirm the import",
    ],
  },
  "/contacts": {
    title: "Contact Directory",
    description: "Manage your homeowner contacts, phone numbers, emails, and property links.",
    steps: [
      "Browse all contacts or search by name, email, or phone",
      "Click a contact to view their properties and claims history",
      "Add new contacts manually or they're created automatically with claims",
      "Edit contact details, add notes, and update preferences",
    ],
    tips: [
      "Contacts are automatically linked to properties and claims",
      "Use the search bar to quickly find any homeowner",
      "Export contacts for mail campaigns or follow-up lists",
    ],
  },
  "/property-profiles": {
    title: "Property Profiles",
    description: "Detailed property records with photos, claims history, and inspection data.",
    steps: [
      "Browse all properties or search by address",
      "Click a property to view its full profile and claims history",
      "Add photos, measurements, and roof details",
      "Link properties to contacts and claims",
    ],
    tips: [
      "Complete property profiles make AI report generation more accurate",
      "Upload roof measurements for scope calculations",
      "Properties can have multiple claims over time",
    ],
  },
  "/teams": {
    title: "Company Seats & Team",
    description: "Manage your team members, roles, and seat assignments.",
    steps: [
      "View all team members and their current roles",
      "Click 'Invite' to add new team members via email",
      "Set roles: Admin, Sales Rep, Project Manager, Viewer",
      "Remove or deactivate seats as needed",
    ],
    tips: [
      "Your Business plan includes 10 seats",
      "Admins can access all features including settings and integrations",
      "Sales Reps see claims, leads, and their commission data",
    ],
  },
  "/finance/overview": {
    title: "Financial Overview",
    description:
      "Executive-level view of your company's financial health — revenue, profit, AR, and commissions.",
    steps: [
      "Review total revenue vs. costs in the summary cards",
      "Check accounts receivable for outstanding payments",
      "Monitor commission payouts and pending approvals",
      "Track gross profit margin across all jobs",
      "View revenue breakdown by status: Invoiced, Collected, Outstanding",
    ],
    tips: [
      "Link job financials by updating cost data on each job",
      "Outstanding AR should stay below 30% of total revenue",
      "Commission data flows from your configured plans automatically",
    ],
  },
  "/permits": {
    title: "Permits Manager",
    description: "Track building permits for your roofing and construction projects.",
    steps: [
      "Click 'New Permit' to create a permit record",
      "Link the permit to a specific job",
      "Track status: Applied → Under Review → Approved → Closed",
      "Upload permit documents and inspection results",
    ],
    tips: [
      "Some municipalities require permits before work can begin",
      "Set reminders for permit expiration dates",
      "Upload the final inspection sign-off for your records",
    ],
  },
  "/appointments": {
    title: "Appointments & Scheduling",
    description: "Schedule inspections, follow-ups, and team meetings.",
    steps: [
      "Click 'New Appointment' to schedule an event",
      "Link to a claim, lead, or contact",
      "Set date, time, and duration",
      "Add notes and reminders",
      "View all appointments on the calendar",
    ],
    tips: [
      "Set reminders so you never miss an inspection",
      "Link appointments to claims for a complete audit trail",
    ],
  },
  "/calendar": {
    title: "Calendar View",
    description: "See all your appointments, inspections, and deadlines in one calendar.",
    steps: [
      "Switch between Day, Week, and Month views",
      "Click any date to create a new appointment",
      "Drag events to reschedule",
      "Color-coded by type: Inspections, Follow-ups, Meetings",
    ],
  },
  "/messages": {
    title: "Message Center",
    description: "Send and receive messages with your team, clients, and network connections.",
    steps: [
      "Select a conversation from the sidebar",
      "Type your message and click Send",
      "Attach files, photos, or documents",
      "Start new conversations with the '+' button",
    ],
    tips: [
      "Messages are organized by contact or team thread",
      "You can send messages to homeowners about their claim status",
    ],
  },
  "/crm": {
    title: "CRM Pipeline",
    description: "Manage your sales pipeline with Kanban boards, lists, and deal tracking.",
    steps: [
      "View your pipeline in Kanban or List view",
      "Drag deals between stages to update status",
      "Click a deal to see full details and history",
      "Add notes, tasks, and follow-up reminders",
    ],
    tips: [
      "Customize pipeline stages to match your sales process",
      "Track deal value and probability for revenue forecasting",
      "Link CRM deals to claims for end-to-end tracking",
    ],
  },
  "/crm/pipelines": {
    title: "Pipeline Management",
    description: "Configure and manage your sales pipeline stages and deal flow.",
    steps: [
      "View all active deals organized by pipeline stage",
      "Add or rename stages to match your workflow",
      "Set win probability percentages for each stage",
      "Track pipeline value and deal velocity",
    ],
  },
  "/jobs": {
    title: "Job Manager",
    description: "Track all your active roofing and construction jobs from start to finish.",
    steps: [
      "View all jobs with their current status",
      "Click a job to see full details, financials, and crew assignments",
      "Update status as work progresses: Pending → In Progress → Completed",
      "Add job costs, materials, and labor for P&L tracking",
    ],
    tips: [
      "Link jobs to claims for automatic financial roll-up",
      "Add crew assignments to track who's on each job",
      "Job financials flow into your Financial Overview dashboard",
    ],
  },
  "/proposals": {
    title: "Proposals",
    description: "Create and manage proposals for homeowners and commercial clients.",
    steps: [
      "Click 'New Proposal' to start a professional proposal",
      "Add line items, photos, and scope of work",
      "Apply your company branding and terms",
      "Send to the customer for review and e-signature",
      "Track status: Draft → Sent → Viewed → Accepted",
    ],
  },
  "/contracts": {
    title: "Contracts & E-Sign",
    description: "Create, send, and track contracts with electronic signatures.",
    steps: [
      "Create a contract from a template or proposal",
      "Add signature fields and initial blocks",
      "Send to the homeowner for e-signature",
      "Track signing status and download executed copies",
    ],
  },
  "/materials": {
    title: "Materials & Ordering",
    description: "Order materials from your vendor network and track deliveries.",
    steps: [
      "Browse materials by category or search",
      "Add items to your cart for the current job",
      "Submit orders to your preferred suppliers",
      "Track delivery status and costs",
    ],
    tips: [
      "Link material orders to jobs for accurate cost tracking",
      "Set up preferred vendors for automatic pricing",
    ],
  },
  "/crews": {
    title: "Crew Management",
    description: "Assign crews to jobs and track labor hours and performance.",
    steps: [
      "Create crew profiles with member names and skills",
      "Assign crews to active jobs",
      "Track daily hours and job completion progress",
      "Review crew performance metrics",
    ],
  },
  "/scheduling": {
    title: "Job Scheduling",
    description: "Schedule crews, deliveries, and inspections across all your jobs.",
    steps: [
      "View the schedule in calendar or timeline view",
      "Drag to assign crews to open time slots",
      "Set delivery windows for materials",
      "Coordinate inspections with homeowners",
    ],
  },
  "/sms": {
    title: "SMS Communications",
    description: "Send text messages to homeowners and team members directly from SkaiScraper.",
    steps: [
      "Select a contact or enter a phone number",
      "Type your message (160 char limit for standard SMS)",
      "Send individual messages or batch notifications",
      "View message history in the contact's timeline",
    ],
  },
  "/mortgage-checks": {
    title: "Mortgage Check Tracker",
    description: "Track insurance checks that require mortgage company endorsement.",
    steps: [
      "Add a new mortgage check when received from the carrier",
      "Track endorsement status with the mortgage company",
      "Record when checks are deposited and cleared",
      "Monitor the full payment lifecycle",
    ],
  },
  "/vendor-network": {
    title: "Vendor & Supplier Network",
    description: "Browse, order from, and manage relationships with material suppliers.",
    steps: [
      "Browse vendors by category: Roofing, Siding, Gutters, etc.",
      "View vendor details, pricing, and delivery areas",
      "Place orders directly through the platform",
      "Track order history and spending by vendor",
    ],
    tips: [
      "Set preferred vendors for one-click ordering",
      "Compare pricing across multiple suppliers",
      "Vendor receipts flow into your job cost tracking",
    ],
  },
  "/integrations": {
    title: "Integrations & API",
    description: "Connect external services, import data from AccuLynx, and manage API access.",
    steps: [
      "Set up webhooks for real-time event notifications",
      "Generate API keys for programmatic access",
      "Use AccuLynx Migration to import your existing data",
      "Connect QuickBooks for accounting sync",
    ],
    tips: [
      "AccuLynx migration imports contacts, jobs, and pipeline data automatically",
      "API keys should be treated as secrets — never share them publicly",
      "Webhooks notify your external systems when events happen in SkaiScraper",
    ],
  },
  "/settings": {
    title: "Organization Settings",
    description: "Configure your company profile, billing, team permissions, and app preferences.",
    steps: [
      "Update company info, logo, and branding",
      "Manage team seats and role permissions",
      "Configure commission plans and financial settings",
      "Set up service areas and lead routing rules",
    ],
  },
  "/settings/billing": {
    title: "Billing & Subscription",
    description: "Manage your SkaiScraper subscription, payment method, and invoice history.",
    steps: [
      "View your current plan and usage",
      "Upgrade or downgrade your subscription",
      "Update payment method and billing info",
      "Download past invoices for your records",
    ],
  },
  "/settings/team": {
    title: "Team Management",
    description: "Invite, manage, and configure roles for your team members.",
    steps: [
      "Click 'Invite' to send an email invitation",
      "Set the new member's role: Admin, Sales Rep, PM, or Viewer",
      "Manage existing members — change roles or deactivate",
      "Monitor seat usage against your plan limits",
    ],
  },
  "/settings/profile": {
    title: "Your Profile",
    description: "Update your personal information, password, and notification preferences.",
    steps: [
      "Update your name, email, and phone number",
      "Upload a profile photo",
      "Set notification preferences (email, SMS, in-app)",
      "Change your password or enable two-factor authentication",
    ],
  },
  "/settings/service-areas": {
    title: "Service Areas",
    description: "Define the geographic areas your company services.",
    steps: [
      "Add zip codes or cities to your service area list",
      "Set primary and secondary service zones",
      "Service areas affect lead routing and weather alerts",
    ],
  },
  "/ai/hub": {
    title: "AI Tools Hub",
    description: "Access all of SkaiScraper's AI-powered tools in one place.",
    steps: [
      "Browse available AI tools by category",
      "Click any tool to open it and start working",
      "Each tool is designed for a specific workflow",
      "Results are saved automatically to your report history",
    ],
    tips: [
      "AI tools use your claim data for context-aware generation",
      "Higher quality inputs (photos, measurements) produce better results",
      "All AI-generated content can be edited before exporting",
    ],
  },
  "/ai/claims-analysis": {
    title: "AI Claims Analysis",
    description: "Let AI analyze your claim data and identify opportunities or risks.",
    steps: [
      "Select a claim to analyze",
      "AI reviews carrier patterns, claim values, and historical data",
      "Review AI recommendations and risk scores",
      "Take action on flagged items",
    ],
  },
  "/ai/bad-faith-detector": {
    title: "Bad Faith Detector",
    description: "AI-powered analysis to identify potential bad faith claim handling by carriers.",
    steps: [
      "Select a claim with a denial or underpayment",
      "Upload the carrier's response letter",
      "AI analyzes for patterns of bad faith handling",
      "Review flagged issues and recommended actions",
      "Generate a formal bad faith complaint if warranted",
    ],
    tips: [
      "Bad faith indicators include: unreasonable delays, lowball offers, failure to investigate",
      "This tool references state insurance regulations",
    ],
  },
  "/ai/damage-builder": {
    title: "AI Damage Assessment",
    description: "Upload photos and let AI identify and document damage for your scope.",
    steps: [
      "Upload clear photos of the damaged area",
      "AI identifies damage type, severity, and affected components",
      "Review the generated damage assessment",
      "Add to your claim scope or export as a report",
    ],
  },
  "/supplement": {
    title: "Supplement Builder",
    description: "Create and track supplement requests for additional claim amounts.",
    steps: [
      "Select the claim that needs supplementing",
      "Document the additional damage or missed items",
      "Add photos and measurements as evidence",
      "Generate a professional supplement package",
      "Submit to the carrier and track response",
    ],
  },
  "/depreciation": {
    title: "Depreciation Calculator",
    description: "Calculate recoverable depreciation and track release schedules.",
    steps: [
      "Enter the approved claim amount and ACV payment",
      "Calculate the depreciation holdback amount",
      "Track depreciation release milestones",
      "Generate a depreciation release request letter",
    ],
  },
  "/map": {
    title: "Territory Map",
    description: "View your properties, claims, and leads on an interactive map.",
    steps: [
      "View all your properties plotted on the map",
      "Filter by status, trade, or date range",
      "Click markers to see property/claim details",
      "Plan door-knocking routes based on map clusters",
    ],
  },
  "/tasks": {
    title: "Task Manager",
    description: "Track to-dos, follow-ups, and action items across all your projects.",
    steps: [
      "Create tasks and assign to team members",
      "Set due dates and priority levels",
      "Link tasks to claims, leads, or jobs",
      "Mark complete as you work through your list",
    ],
  },
  "/tokens": {
    title: "AI Token Balance",
    description: "View your AI token usage and purchase additional tokens.",
    steps: [
      "Check your current token balance",
      "View usage history by tool and date",
      "Purchase token packs when running low",
      "Tokens are consumed when generating AI reports and analyses",
    ],
  },
  "/support": {
    title: "Support Center",
    description: "Get help, report issues, and access documentation.",
    steps: [
      "Browse help articles and FAQs",
      "Submit a support ticket for issues",
      "Check the status of existing tickets",
      "Access video tutorials and guides",
    ],
  },
  "/company/connections": {
    title: "Company Connections",
    description: "Manage your network connections with other companies in the trades network.",
    steps: [
      "View all your active network connections",
      "Accept or decline incoming connection requests",
      "Send new connection invitations",
      "View connection activity and shared opportunities",
    ],
  },
  "/inbox": {
    title: "Unified Inbox",
    description: "View all notifications, messages, and alerts in one place.",
    steps: [
      "Browse notifications sorted by recency",
      "Click to navigate to the relevant item",
      "Mark items as read or dismiss",
      "Filter by type: Messages, Alerts, System",
    ],
  },
  "/marketing/campaigns": {
    title: "Marketing Campaigns",
    description: "Create and manage marketing campaigns to generate leads.",
    steps: [
      "Create a new campaign with targeting criteria",
      "Set up mailers, door hangers, or digital ads",
      "Track campaign performance and lead attribution",
      "Calculate ROI by linking campaigns to closed deals",
    ],
  },
  "/reviews": {
    title: "Customer Reviews",
    description: "Collect, manage, and showcase customer reviews.",
    steps: [
      "Send review requests to completed job customers",
      "Monitor incoming reviews and respond",
      "Showcase top reviews on your public profile",
      "Track your average rating over time",
    ],
  },
  "/referrals": {
    title: "Referral Program",
    description: "Set up and manage your customer and partner referral program.",
    steps: [
      "Configure referral incentives and rewards",
      "Share your referral link with customers",
      "Track referrals and attribute new leads",
      "Pay out referral bonuses automatically",
    ],
  },
  "/work-orders": {
    title: "Work Orders",
    description: "Create and manage work orders for your crews and subcontractors.",
    steps: [
      "Create a work order from a job or claim",
      "Add scope of work, materials, and instructions",
      "Assign to a crew or subcontractor",
      "Track completion and quality sign-off",
    ],
  },
  "/time-tracking": {
    title: "Time Tracking",
    description: "Track crew hours and labor costs for each job.",
    steps: [
      "Crew members clock in/out for each job",
      "View daily timesheets and approve hours",
      "Track labor costs against job budgets",
      "Export for payroll processing",
    ],
  },
  "/vision-lab": {
    title: "Vision Lab",
    description: "Experimental AI-powered visual analysis tools for property assessment.",
    steps: [
      "Upload property photos for AI analysis",
      "AI identifies roof components, damage, and measurements",
      "Review results and add to your claim documentation",
    ],
    tips: [
      "Use clear, well-lit photos for best results",
      "Aerial/drone photos produce the most accurate measurements",
    ],
  },
  "/project-board": {
    title: "Project Board",
    description: "Kanban-style board for managing projects and milestones.",
    steps: [
      "Create project cards for each active job",
      "Drag cards between columns to update status",
      "Add subtasks, deadlines, and assignees",
      "Track project progress at a glance",
    ],
  },
  "/operations": {
    title: "Operations Center",
    description: "Manage day-to-day operations: scheduling, crews, and resource allocation.",
    steps: [
      "View today's schedule and crew assignments",
      "Monitor job progress and crew locations",
      "Resolve scheduling conflicts and reassign resources",
      "Track equipment and vehicle usage",
    ],
  },
  "/performance": {
    title: "Performance Dashboard",
    description: "Track individual and team performance against goals and KPIs.",
    steps: [
      "Set monthly or quarterly goals for each rep",
      "Monitor progress against targets in real-time",
      "Compare rep performance side-by-side",
      "Generate performance reports for team meetings",
    ],
  },
  "/pipeline": {
    title: "Sales Pipeline",
    description: "Visualize and manage your entire sales pipeline from lead to close.",
    steps: [
      "View pipeline in Kanban, List, or Funnel view",
      "Track deal value at each stage",
      "Identify bottlenecks and stalled deals",
      "Forecast monthly revenue from your pipeline",
    ],
  },
  "/exports/carrier": {
    title: "Carrier Export",
    description: "Export formatted claim data for carrier submission.",
    steps: [
      "Select the claim to export",
      "Choose the carrier's required format",
      "Review the export package",
      "Download or email directly to the adjuster",
    ],
  },
  "/compliance/certifications": {
    title: "Compliance & Certifications",
    description: "Track licenses, certifications, and compliance requirements.",
    steps: [
      "Add your company licenses and certifications",
      "Set expiration dates for renewal reminders",
      "Upload certificate documents",
      "Track compliance status across your team",
    ],
  },
  "/developers/api-docs": {
    title: "API Documentation",
    description: "Technical reference for the SkaiScraper REST API.",
    steps: [
      "Browse available API endpoints",
      "View request/response schemas",
      "Test endpoints with your API key",
      "Copy code examples for your integration",
    ],
  },
  "/contractors/profile": {
    title: "Contractor Profile",
    description: "Your public-facing contractor profile visible to homeowners.",
    steps: [
      "Update your business info, logo, and description",
      "Add specialties and service areas",
      "Upload portfolio photos and certifications",
      "Set your hours and emergency availability",
    ],
    tips: [
      "Complete profiles get 5x more service requests",
      "Add verified badges to increase trust",
    ],
  },
};

/**
 * Get help content for a given route.
 * Uses longest-prefix matching to find the most specific content.
 */
export function getHelpForRoute(pathname: string): HelpContent | null {
  // Exact match first
  if (helpContentRegistry[pathname]) return helpContentRegistry[pathname];

  // Prefix match — sort by length descending for most specific match
  const prefixMatches = Object.keys(helpContentRegistry)
    .filter((route) => pathname.startsWith(route + "/") || pathname === route)
    .sort((a, b) => b.length - a.length);

  if (prefixMatches.length > 0) return helpContentRegistry[prefixMatches[0]];

  return null;
}
