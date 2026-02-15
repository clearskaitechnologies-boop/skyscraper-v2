import { auth } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { notifyConnectionRequest } from "@/lib/services/tradesNotifications";

/**
 * POST /api/trades/connect
 * Client requests connection with a contractor
 *
 * Auto-creates:
 * - Lead in CRM
 * - Appointment (if requested)
 * - Notification to contractor
 */

const ConnectRequestSchema = z.object({
  contractorId: z.string().cuid(),
  clientId: z.string().optional(),
  serviceType: z.string().min(1, "Service type required"),
  urgency: z.enum(["emergency", "urgent", "high", "normal", "flexible"]).default("normal"),
  budgetMinCents: z.number().int().optional(),
  budgetMaxCents: z.number().int().optional(),
  preferredStartDate: z.string().optional(), // ISO date
  notes: z.string().optional(),
  requestAppointment: z.boolean().default(false),
  appointmentTime: z.string().optional(), // ISO datetime
  propertyAddress: z.string().optional(),
  propertyZip: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    // Allow both authenticated users and client portal tokens
    const token = req.headers.get("x-client-token");

    if (!userId && !token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = ConnectRequestSchema.parse(body);

    // Fetch contractor profile
    const contractorProfile = await prisma.tradesCompanyMember.findUnique({
      where: { id: data.contractorId },
      include: {
        company: true,
      },
    });

    if (!contractorProfile) {
      return NextResponse.json({ error: "Contractor not found" }, { status: 404 });
    }

    // Get or create client
    let clientId = data.clientId;

    if (!clientId && token) {
      // Fetch client from portal token
      const portalAccess = await prisma.client_access.findUnique({
        where: { id: token },
      });

      if (portalAccess) {
        // client_access is tied to a claim, not directly to a client
        // We need to look up the client by email if available
        clientId = portalAccess.email;
      }
    }

    if (!clientId) {
      return NextResponse.json({ error: "Client identification required" }, { status: 400 });
    }

    // Resolve to tradesCompany.id (contractorId FK references tradesCompany, NOT tradesCompanyMember)
    const companyId = contractorProfile.companyId || contractorProfile.company?.id;
    if (!companyId) {
      return NextResponse.json({ error: "Contractor has no company profile" }, { status: 400 });
    }

    // Check for existing pending connection
    const existingConnection = await prisma.clientProConnection.findFirst({
      where: {
        clientId,
        contractorId: companyId,
        status: {
          in: ["pending", "accepted", "PENDING", "ACCEPTED"],
        },
      },
    });

    if (existingConnection) {
      return NextResponse.json(
        { error: "Connection already exists", connection: existingConnection },
        { status: 409 }
      );
    }

    // Create connection — contractorId must be tradesCompany.id
    const connection = await prisma.clientProConnection.create({
      data: {
        id: crypto.randomUUID(),
        clientId,
        contractorId: companyId,
        status: "pending",
        notes: data.notes ?? `Service: ${data.serviceType}, Urgency: ${data.urgency}`,
      },
    });

    // Auto-create Lead in CRM
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new Error("Client not found");
    }

    const lead = await prisma.leads.create({
      data: {
        id: `lead_${nanoid()}`,
        orgId: contractorProfile.orgId ?? contractorProfile.companyId ?? "",
        contactId: `contact_${nanoid()}`, // You'd link to actual contact
        title: `${data.serviceType} - ${client.name}`,
        description: data.notes || `Service request: ${data.serviceType}`,
        source: "trades_network",
        value: data.budgetMaxCents || 0,
        stage: "new",
        temperature: data.urgency === "emergency" || data.urgency === "urgent" ? "hot" : "warm",
        updatedAt: new Date(),
      },
    });

    // Lead created - connection notes already include service type

    // Auto-create Appointment if requested
    let appointment: { id: string; title: string } | null = null;
    if (data.requestAppointment && data.appointmentTime) {
      const startTime = new Date(data.appointmentTime);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // +1 hour

      const newAppointment = await prisma.appointments.create({
        data: {
          id: `appt_${nanoid()}`,
          orgId: contractorProfile.orgId ?? contractorProfile.companyId ?? "",
          title: `${data.serviceType} Consultation - ${client.name}`,
          description: data.notes,
          startTime,
          endTime,
          status: "scheduled",
          leadId: lead.id,
        },
      });
      appointment = { id: newAppointment.id, title: newAppointment.title };
    }

    // Log notification (tradeNotification model not available)
    console.log(
      `[Trades Connect] New connection request from ${client.name} for ${data.serviceType}`
    );

    // Fetch full connection with relations
    const fullConnection = await prisma.clientProConnection.findUnique({
      where: { id: connection.id },
      include: {
        tradesCompany: true,
        Client: true,
      },
    });

    // Send trades network notification
    try {
      await notifyConnectionRequest({
        proClerkId: contractorProfile.userId,
        clientName: client.name || "A client",
        serviceType: data.serviceType,
        connectionId: connection.id,
      });
    } catch (notifError) {
      console.error("Failed to send trades notification:", notifError);
    }

    return NextResponse.json({
      success: true,
      connection: fullConnection,
      lead,
      appointment,
      message: "Connection request sent! The contractor will respond shortly.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[POST /api/trades/connect] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
