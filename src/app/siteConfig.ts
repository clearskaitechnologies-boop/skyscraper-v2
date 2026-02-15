export const SITE = {
  name: "SkaiScraper™",
  logo: "/brand/pro_portal_logo.png", // professional logo
  quickPdf: "/docs/QuickReport.pdf", // put in /public/docs
  nav: [
    // visible top tabs (left to right)
    {
      label: "Dashboard",
      href: "/dashboard",
      dropdown: undefined,
    },
    {
      label: "SkaiScraper: AI Suite",
      href: "/ai-suite",
      dropdown: [
        { label: "Quick Reports", href: "/ai-suite#reports" },
        { label: "AI PDF Templates", href: "/ai-suite#templates" },
        { label: "Code / DOL Verify", href: "/ai-suite#codedol" },
        { label: "Integrations", href: "/ai-suite#integrations" },
      ],
    },
    {
      label: "The Trades Network",
      href: "/trades-network",
      dropdown: undefined,
    },
    { label: "SkaiScraper CRM", href: "/crm", dropdown: undefined },
    { label: "Company Branding", href: "/branding", dropdown: undefined },
    { label: "SkaiScraper Reports", href: "/reports/history", dropdown: undefined },
    { label: "Demo", href: "/demo", dropdown: undefined },
    { label: "Pricing", href: "/pricing", dropdown: undefined },
    { label: "Contact Us", href: "/contact", dropdown: undefined },
  ],
  auth: { signIn: "/sign-in", signUp: "/sign-up" },
} as const;
