export type BrandTheme = {
  id: string;
  name: string;
  palette: { primary: string; text: string; subtle: string };
  logoUrl?: string;
  footer?: { left?: string; right?: string };
};

export const EXPORT_THEMES: BrandTheme[] = [
  {
    id: "clearskai-primary",
    name: "ClearSkai Technologies",
    palette: { primary: "#0A1A2F", text: "#111827", subtle: "#6B7280" },
    logoUrl: "/brand/pro_portal_logo.png",
    footer: {
      left: "ClearSkai Technologies · Licensed · Bonded",
      right: "damien@clearskai.com · (480) 995-5820",
    },
  },
  {
    id: "clearskai",
    name: "ClearSKai Default",
    palette: { primary: "#0EA5E9", text: "#0F172A", subtle: "#64748B" },
    logoUrl: "/brand/pro_portal_logo.png",
    footer: { left: "ClearSKai Reports", right: "hello@clearskai.ai" },
  },
  {
    id: "neutral",
    name: "Client-Neutral",
    palette: { primary: "#111827", text: "#111827", subtle: "#6B7280" },
    logoUrl: "/brand/pro_portal_logo.png",
  },
];

export function getTheme(id?: string): BrandTheme {
  return EXPORT_THEMES.find((t) => t.id === id) || EXPORT_THEMES[1];
}
