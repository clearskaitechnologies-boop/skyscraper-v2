import { atom } from "jotai";

import { AddonKey } from "@/lib/registry/AddonRegistry";

export const selectedTemplateAtom = atom<"proposal" | "claims" | "damage" | "carrier">("proposal");
export const selectedAddonsAtom = atom<AddonKey[]>([]);
export const exportBusyAtom = atom<boolean>(false);
export const lastExportErrorAtom = atom<string | null>(null);
