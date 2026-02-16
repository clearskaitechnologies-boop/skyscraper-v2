import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

import prisma from "@/lib/prisma";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// ITEM 31: Workflow automation engine
export async function POST(req: NextRequest) {
  try {
    const { userId, orgId: authOrgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { trigger, action, conditions, entityType, orgId, config } = body;

    const effectiveOrgId = orgId || authOrgId;
    if (!trigger || !action || !effectiveOrgId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create workflow automation rule
    // Note: WorkflowAction schema uses actionType and config JSON to store trigger/action info
    const workflow = await prisma.workflowAction.create({
      data: {
        id: crypto.randomUUID(),
        orgId: effectiveOrgId,
        leadId: entityType === "claim" ? config?.claimId || "" : "",
        actionType: action, // "send_email", "update_status", "create_task", "notify_team", "webhook"
        config: {
          trigger,
          conditions: conditions || {},
          entityType: entityType || "all",
          ...config,
        },
        status: "pending",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      workflow,
    });
  } catch (error) {
    console.error("Workflow creation error:", error);
    return NextResponse.json({ error: "Failed to create workflow" }, { status: 500 });
  }
}

// Get all workflows for an org
export async function GET(req: NextRequest) {
  try {
    const { userId, orgId: authOrgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId") || authOrgId;

    if (!orgId) {
      return NextResponse.json({ error: "orgId required" }, { status: 400 });
    }

    const workflows = await prisma.workflowAction.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ workflows });
  } catch (error) {
    console.error("Workflow fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch workflows" }, { status: 500 });
  }
}

// Execute workflow action - called from other parts of the app
export async function executeWorkflow(trigger: string, data: any, orgId: string) {
  const workflows = await prisma.workflowAction.findMany({
    where: {
      orgId,
      status: "pending",
    },
  });

  // Filter workflows where config.trigger matches
  const matchingWorkflows = workflows.filter((w) => {
    const config = w.config as Record<string, any>;
    return config?.trigger === trigger;
  });

  const results: { workflowId: string; action: string; success: boolean; error?: string }[] = [];

  for (const workflow of matchingWorkflows) {
    const config = (workflow.config as Record<string, any>) || {};

    try {
      switch (workflow.actionType) {
        case "send_email":
          await executeSendEmail(data, config, orgId);
          break;
        case "update_status":
          await executeUpdateStatus(data, config, orgId);
          break;
        case "create_task":
          await executeCreateTask(data, config, orgId);
          break;
        case "notify_team":
          await executeNotifyTeam(data, config, orgId);
          break;
        case "webhook":
          await executeWebhook(data, config);
          break;
      }
      results.push({ workflowId: workflow.id, action: workflow.actionType, success: true });
    } catch (error) {
      console.error(`[WORKFLOW] Failed: ${workflow.actionType}`, error);
      results.push({
        workflowId: workflow.id,
        action: workflow.actionType,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}

// --- Action Executors ---

async function executeSendEmail(
  data: { claimId?: string; jobId?: string; email?: string; subject?: string; body?: string },
  config: { template?: string; to?: string; subject?: string },
  orgId: string
) {
  if (!resend) {
    console.warn("[WORKFLOW] Resend not configured, skipping email");
    return;
  }

  const recipientEmail = config.to || data.email;
  if (!recipientEmail) {
    throw new Error("No recipient email specified");
  }

  // Get org info for from address
  const org = await prisma.org.findUnique({ where: { id: orgId } });
  const fromName = org?.name || "SkaiScraper";

  // Build email content based on template or custom content
  let subject = config.subject || data.subject || "Notification from SkaiScraper";
  let html = data.body || `<p>You have a new notification.</p>`;

  if (config.template === "claim_created" && data.claimId) {
    const claim = await prisma.claims.findUnique({ where: { id: data.claimId } });
    if (claim) {
      subject = `New Claim Created: ${claim.claimNumber}`;
      html = `
        <h2>New Claim Created</h2>
        <p><strong>Claim Number:</strong> ${claim.claimNumber}</p>
        <p><strong>Title:</strong> ${claim.title}</p>
        <p><strong>Damage Type:</strong> ${claim.damageType}</p>
        <p><strong>Status:</strong> ${claim.status}</p>
        <p>Log in to view the full claim details.</p>
      `;
    }
  } else if (config.template === "status_changed" && data.claimId) {
    const claim = await prisma.claims.findUnique({ where: { id: data.claimId } });
    if (claim) {
      subject = `Claim Status Updated: ${claim.claimNumber}`;
      html = `
        <h2>Claim Status Updated</h2>
        <p><strong>Claim Number:</strong> ${claim.claimNumber}</p>
        <p><strong>New Status:</strong> ${claim.status}</p>
        <p>Log in to view the updated claim details.</p>
      `;
    }
  }

  await resend.emails.send({
    from: `${fromName} <notifications@skaiscrape.com>`,
    to: recipientEmail,
    subject,
    html,
  });
}

async function executeUpdateStatus(
  data: { claimId?: string; jobId?: string; newStatus?: string },
  config: { status?: string; entityType?: string },
  orgId: string
) {
  const newStatus = config.status || data.newStatus;
  if (!newStatus) {
    throw new Error("No status specified");
  }

  if (data.claimId) {
    await prisma.claims.update({
      where: { id: data.claimId },
      data: { status: newStatus, updatedAt: new Date() },
    });
  } else if (data.jobId) {
    await prisma.jobs.update({
      where: { id: data.jobId },
      data: { status: newStatus, updatedAt: new Date() },
    });
  }
}

async function executeCreateTask(
  data: {
    claimId?: string;
    jobId?: string;
    title?: string;
    description?: string;
    assignedTo?: string;
  },
  config: { title?: string; description?: string; dueInDays?: number; assignedTo?: string },
  orgId: string
) {
  const title = config.title || data.title || "New Task";
  const description = config.description || data.description || "";
  const dueDate = config.dueInDays
    ? new Date(Date.now() + config.dueInDays * 24 * 60 * 60 * 1000)
    : null;

  if (data.claimId) {
    await prisma.claim_tasks.create({
      data: {
        id: crypto.randomUUID(),
        claim_id: data.claimId,
        org_id: orgId,
        title,
        description,
        status: "todo",
        source: "workflow",
        assigned_to_id: config.assignedTo || data.assignedTo || undefined,
        due_date: dueDate,
        updated_at: new Date(),
      },
    });
  }
}

async function executeNotifyTeam(
  data: { claimId?: string; jobId?: string; message?: string },
  config: { userIds?: string[]; message?: string },
  orgId: string
) {
  const message = config.message || data.message || "You have a new notification";

  // ProjectNotification requires a claimId - only create if we have one
  if (!data.claimId) {
    return;
  }

  await prisma.projectNotification.create({
    data: {
      id: crypto.randomUUID(),
      orgId,
      claimId: data.claimId,
      notificationType: "workflow",
      title: "Workflow Notification",
      message,
      sentVia: [],
    },
  });
}

async function executeWebhook(
  data: any,
  config: { url?: string; headers?: Record<string, string> }
) {
  if (!config.url) {
    throw new Error("No webhook URL specified");
  }

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...config.headers,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Webhook failed with status ${response.status}`);
  }
}
