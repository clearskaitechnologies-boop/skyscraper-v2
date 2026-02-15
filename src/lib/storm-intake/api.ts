// Storm Intake Engine - API Client
// Thin client helpers for frontend to backend communication

import { StormIntakeDTO } from "./types";

/**
 * Start a new storm intake session
 */
export async function startStormIntake(payload: {
  source: "PUBLIC" | "PORTAL";
  orgId?: string | null;
}): Promise<StormIntakeDTO> {
  const res = await fetch("/api/storm-intake/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to start storm intake");
  }

  return res.json();
}

/**
 * Fetch existing storm intake by ID
 */
export async function fetchStormIntake(id: string): Promise<StormIntakeDTO> {
  const res = await fetch(`/api/storm-intake/${id}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch storm intake");
  }

  return res.json();
}

/**
 * Save partial intake data (auto-save on step changes)
 */
export async function saveStormIntake(
  id: string,
  partial: Partial<StormIntakeDTO>
): Promise<StormIntakeDTO> {
  const res = await fetch(`/api/storm-intake/${id}/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(partial),
  });

  if (!res.ok) {
    throw new Error("Failed to save storm intake");
  }

  return res.json();
}

/**
 * Complete intake and generate final report
 */
export async function completeStormIntake(id: string): Promise<StormIntakeDTO> {
  const res = await fetch(`/api/storm-intake/${id}/complete`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Failed to complete storm intake");
  }

  return res.json();
}

/**
 * Upload media (photos/videos) for intake
 */
export async function uploadStormIntakeMedia(
  id: string,
  file: File,
  metadata?: { tag?: string; notes?: string }
): Promise<{ url: string; id: string }> {
  const formData = new FormData();
  formData.append("file", file);
  if (metadata?.tag) formData.append("tag", metadata.tag);
  if (metadata?.notes) formData.append("notes", metadata.notes);

  const res = await fetch(`/api/storm-intake/${id}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to upload media");
  }

  return res.json();
}
