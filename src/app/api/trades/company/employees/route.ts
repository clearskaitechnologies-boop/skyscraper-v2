import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// GET /api/trades/company/employees - List company employees
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's company membership
    const membership = await prisma.tradesCompanyMember.findUnique({
      where: { userId },
      include: { company: true },
    });

    if (!membership?.companyId) {
      return NextResponse.json({ error: "No company found" }, { status: 404 });
    }

    // Fetch all company employees
    const employees = await prisma.tradesCompanyMember.findMany({
      where: { companyId: membership.companyId },
      select: {
        id: true,
        userId: true,
        firstName: true,
        lastName: true,
        email: true,
        jobTitle: true,
        role: true,
        avatar: true,
        isAdmin: true,
        canEditCompany: true,
        status: true,
        createdAt: true,
      },
      orderBy: [{ isAdmin: "desc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({
      ok: true,
      employees,
      isAdmin:
        membership.role === "admin" ||
        membership.role === "owner" ||
        membership.isOwner ||
        membership.isAdmin,
      currentUserId: membership.id,
    });
  } catch (error) {
    console.error("[trades/company/employees] GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}

// PATCH /api/trades/company/employees - Update employee permissions
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { employeeId, isAdmin, canEditCompany, role } = body;

    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID required" }, { status: 400 });
    }

    // Get requesting user's membership
    const requestingMember = await prisma.tradesCompanyMember.findUnique({
      where: { userId },
    });

    if (!requestingMember?.companyId) {
      return NextResponse.json({ error: "No company found" }, { status: 404 });
    }

    // Check if requesting user is admin
    const isAdminUser =
      requestingMember.role === "admin" ||
      requestingMember.role === "owner" ||
      requestingMember.isOwner ||
      requestingMember.isAdmin;
    if (!isAdminUser) {
      return NextResponse.json({ error: "Only admins can manage employees" }, { status: 403 });
    }

    // Find target employee
    const targetEmployee = await prisma.tradesCompanyMember.findUnique({
      where: { id: employeeId },
    });

    if (!targetEmployee || targetEmployee.companyId !== requestingMember.companyId) {
      return NextResponse.json({ error: "Employee not found in your company" }, { status: 404 });
    }

    // Prevent demoting the last admin
    if (targetEmployee.role === "owner" && role !== "owner") {
      return NextResponse.json({ error: "Cannot demote the company owner" }, { status: 400 });
    }

    // Build update data
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (isAdmin !== undefined) updateData.isAdmin = isAdmin;
    if (canEditCompany !== undefined) updateData.canEditCompany = canEditCompany;
    if (role !== undefined) updateData.role = role;

    const updated = await prisma.tradesCompanyMember.update({
      where: { id: employeeId },
      data: updateData,
    });

    return NextResponse.json({
      ok: true,
      employee: {
        id: updated.id,
        isAdmin: updated.isAdmin,
        canEditCompany: updated.canEditCompany,
        role: updated.role,
      },
    });
  } catch (error) {
    console.error("[trades/company/employees] PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 });
  }
}

// DELETE /api/trades/company/employees - Remove employee from company
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");

    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID required" }, { status: 400 });
    }

    // Get requesting user's membership
    const requestingMember = await prisma.tradesCompanyMember.findUnique({
      where: { userId },
    });

    if (!requestingMember?.companyId) {
      return NextResponse.json({ error: "No company found" }, { status: 404 });
    }

    // Check if requesting user is admin
    const isAdminUser =
      requestingMember.role === "admin" ||
      requestingMember.role === "owner" ||
      requestingMember.isOwner ||
      requestingMember.isAdmin;
    if (!isAdminUser) {
      return NextResponse.json({ error: "Only admins can remove employees" }, { status: 403 });
    }

    // Find target employee
    const targetEmployee = await prisma.tradesCompanyMember.findUnique({
      where: { id: employeeId },
    });

    if (!targetEmployee || targetEmployee.companyId !== requestingMember.companyId) {
      return NextResponse.json({ error: "Employee not found in your company" }, { status: 404 });
    }

    // Prevent removing self or owner
    if (targetEmployee.userId === userId) {
      return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });
    }

    if (targetEmployee.role === "owner") {
      return NextResponse.json({ error: "Cannot remove the company owner" }, { status: 400 });
    }

    // Remove from company (set companyId to null)
    await prisma.tradesCompanyMember.update({
      where: { id: employeeId },
      data: {
        companyId: null,
        isAdmin: false,
        canEditCompany: false,
        role: "member",
        status: "inactive",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Employee removed from company",
    });
  } catch (error) {
    console.error("[trades/company/employees] DELETE Error:", error);
    return NextResponse.json({ error: "Failed to remove employee" }, { status: 500 });
  }
}
