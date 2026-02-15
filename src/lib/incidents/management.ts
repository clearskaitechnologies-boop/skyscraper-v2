/**
 * TASK 140: INCIDENT MANAGEMENT
 *
 * Track and manage system incidents with alerting.
 */

import prisma from "@/lib/prisma";

export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type IncidentStatus = "OPEN" | "INVESTIGATING" | "RESOLVED" | "CLOSED";

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  affectedServices: string[];
  createdAt: Date;
  resolvedAt?: Date;
}

export async function createIncident(data: {
  title: string;
  description: string;
  severity: IncidentSeverity;
  affectedServices: string[];
}): Promise<string> {
  const incident = await prisma.incident.create({
    data: {
      ...data,
      status: "OPEN",
    } as any,
  });

  // Send alerts for critical incidents
  if (data.severity === "CRITICAL") {
    await sendIncidentAlert(incident.id);
  }

  return incident.id;
}

export async function updateIncidentStatus(
  incidentId: string,
  status: IncidentStatus
): Promise<void> {
  const updates: any = { status };

  if (status === "RESOLVED" || status === "CLOSED") {
    updates.resolvedAt = new Date();
  }

  await prisma.incident.update({
    where: { id: incidentId },
    data: updates,
  });
}

export async function getActiveIncidents(): Promise<Incident[]> {
  const incidents = await prisma.incident.findMany({
    where: {
      status: { in: ["OPEN", "INVESTIGATING"] },
    },
    orderBy: { createdAt: "desc" },
  });
  return incidents as any;
}

async function sendIncidentAlert(incidentId: string): Promise<void> {
  // TODO: Send alert via email/SMS/webhook
  console.log("Incident alert sent:", incidentId);
}

export async function addIncidentUpdate(incidentId: string, update: string): Promise<void> {
  await prisma.incidentUpdate.create({
    data: {
      incidentId,
      message: update,
    } as any,
  });
}

export async function getMTTR(): Promise<number> {
  const resolvedIncidents = await prisma.incident.findMany({
    where: {
      status: "RESOLVED",
      resolvedAt: { not: null },
    },
  });

  if (resolvedIncidents.length === 0) return 0;

  const totalTime = resolvedIncidents.reduce((sum, incident) => {
    const duration = incident.resolvedAt!.getTime() - incident.createdAt.getTime();
    return sum + duration;
  }, 0);

  return totalTime / resolvedIncidents.length / (1000 * 60); // minutes
}
