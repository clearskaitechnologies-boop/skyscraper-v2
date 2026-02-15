export type Address = {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  zip?: string;
};

export type Owner = {
  fullName?: string;
  email?: string | null;
  phone?: string | null;
  address?: Address;
};

export type Insurance = {
  dol?: string | null;
  carrierName?: string | null;
  policyType?: "ACV" | "RCV" | "Other" | null;
  dolVerified?: boolean;
};

export type Rep = {
  name?: string;
  title?: string;
  email?: string | null;
  phone?: string | null;
};

export type TeamTile = {
  photoUrl?: string;
  displayName?: string;
  role?: string;
};

export type ReportIntake = {
  id?: string;
  org_id?: string;
  report_number?: string;
  owner?: Owner;
  insurance?: Insurance;
  licenses?: { rocNumber?: string };
  service_area?: string;
  rep?: Rep;
  meet_the_team?: TeamTile[];
};

export type BrandingData = {
  org_id?: string;
  company_name?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  logo_url?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  accent_color?: string | null;
  theme_mode?: string | null;
  font_heading?: string | null;
  font_body?: string | null;
  roc_number?: string | null;
  service_area_presets?: string[];
};
