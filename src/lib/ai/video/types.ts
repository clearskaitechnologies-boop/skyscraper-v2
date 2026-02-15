// lib/ai/video/types.ts
import type { ReportData } from "@/lib/reports/types";

export type VideoReportKind = "CLAIM_VIDEO" | "RETAIL_VIDEO";

export interface VideoScene {
  id: number;
  title: string;
  voiceover: string;
  visualPrompt: string;
}

export interface VideoScript {
  kind: VideoReportKind;
  title: string;
  durationSeconds: number;
  scenes: VideoScene[];
  rawSummary: string;
  sourceData: ReportData;
}
