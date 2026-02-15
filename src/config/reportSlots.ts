export type SlotKey = "A" | "B1" | "B2" | "D" | "E" | "F";

export const REPORT_SLOTS: Record<
  SlotKey,
  {
    baseName: string;
    title: string;
    description: string;
    binder: boolean;
    order: number;
  }
> = {
  A: {
    baseName: "a-series-homeowner-cover",
    title: "Homeowner Cover",
    description: "Report cover, homeowner-facing",
    binder: true,
    order: 1,
  },
  B1: {
    baseName: "b-series-company-profile",
    title: "Company Profile",
    description: "About company, brand + contacts",
    binder: false,
    order: 2,
  },
  B2: {
    baseName: "b-series-credentials",
    title: "Credentials & Licensing",
    description: "Licenses, insurance, certs",
    binder: false,
    order: 3,
  },
  D: {
    baseName: "d-series-codes-compliance",
    title: "Codes & Compliance",
    description: "Code references & checklists",
    binder: true,
    order: 4,
  },
  E: {
    baseName: "e-series-production-timeline",
    title: "Production Timeline",
    description: "Milestones and schedule",
    binder: false,
    order: 5,
  },
  F: {
    baseName: "f-series-warranty-closeout",
    title: "Warranty Closeout",
    description: "Registered warranty closeout",
    binder: true,
    order: 6,
  },
};
