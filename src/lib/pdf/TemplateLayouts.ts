import structure from "@/config/skai-structure.json";

export type TemplateLayout = {
  key: string;
  title: string;
  defaultSections: string[];
};

const layouts: Record<string, TemplateLayout> = {
  proposal: {
    key: "proposal",
    title: "Contractor Proposal",
    defaultSections: (structure as any).reports.proposal.sections,
  },
  claims: {
    key: "claims",
    title: "Insurance Claim Packet",
    defaultSections: (structure as any).reports.claims.sections,
  },
  damage: {
    key: "damage",
    title: "AI Damage Export",
    defaultSections: (structure as any).reports.damage.sections,
  },
  carrier: {
    key: "carrier",
    title: "Carrier Summary",
    defaultSections: (structure as any).reports.carrier.sections,
  },
};

export default layouts;
