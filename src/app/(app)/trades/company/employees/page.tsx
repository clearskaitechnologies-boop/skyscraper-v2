"use client";

import {
  ArrowLeft,
  Loader2,
  Shield,
  ShieldCheck,
  Trash2,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface Employee {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  jobTitle: string | null;
  role: string;
  avatar: string | null;
  isAdmin: boolean;
  canEditCompany: boolean;
  status: string;
  createdAt: string;
}

export default function ManageEmployeesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const res = await fetch("/api/trades/company/employees");
      if (!res.ok) {
        if (res.status === 404) {
          toast.error("No company found");
          router.push("/trades/profile");
          return;
        }
        throw new Error("Failed to load employees");
      }
      const data = await res.json();
      setEmployees(data.employees || []);
      setIsAdmin(data.isAdmin);
      setCurrentUserId(data.currentUserId);
    } catch (error) {
      console.error("Failed to load employees:", error);
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (employeeId: string, currentIsAdmin: boolean) => {
    setUpdating(employeeId);
    try {
      const res = await fetch("/api/trades/company/employees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          isAdmin: !currentIsAdmin,
          role: !currentIsAdmin ? "admin" : "member",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }

      toast.success(!currentIsAdmin ? "Admin access granted" : "Admin access revoked");
      loadEmployees();
    } catch (error: any) {
      toast.error(error.message || "Failed to update permissions");
    } finally {
      setUpdating(null);
    }
  };

  const toggleEditAccess = async (employeeId: string, currentCanEdit: boolean) => {
    setUpdating(employeeId);
    try {
      const res = await fetch("/api/trades/company/employees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          canEditCompany: !currentCanEdit,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }

      toast.success(!currentCanEdit ? "Edit access granted" : "Edit access revoked");
      loadEmployees();
    } catch (error: any) {
      toast.error(error.message || "Failed to update permissions");
    } finally {
      setUpdating(null);
    }
  };

  const removeEmployee = async (employeeId: string, name: string) => {
    setUpdating(employeeId);
    try {
      const res = await fetch(`/api/trades/company/employees?employeeId=${employeeId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove");
      }

      toast.success(`${name} removed from company`);
      setDeleteTarget(null);
      loadEmployees();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove employee");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-amber-50/30">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-amber-50/30 p-6">
        <div className="max-w-md text-center">
          <Shield className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h1 className="mb-2 text-xl font-semibold text-gray-900">Admin Access Required</h1>
          <p className="mb-4 text-gray-600">
            Only company admins can manage employees and permissions.
          </p>
          <Link href="/trades/profile">
            <Button>Back to Profile</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-amber-50/30 p-6">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Link href="/trades/company">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Employees</h1>
            <p className="text-sm text-gray-600">Assign admin roles and permissions</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="mx-auto mb-2 h-6 w-6 text-blue-600" />
              <p className="text-2xl font-bold text-slate-900">{employees.length}</p>
              <p className="text-xs text-slate-500">Total Employees</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <ShieldCheck className="mx-auto mb-2 h-6 w-6 text-green-600" />
              <p className="text-2xl font-bold text-slate-900">
                {employees.filter((e) => e.isAdmin).length}
              </p>
              <p className="text-xs text-slate-500">Admins</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <UserCheck className="mx-auto mb-2 h-6 w-6 text-amber-600" />
              <p className="text-2xl font-bold text-slate-900">
                {employees.filter((e) => e.status === "active").length}
              </p>
              <p className="text-xs text-slate-500">Active</p>
            </CardContent>
          </Card>
        </div>

        {/* Employee List */}
        <Card>
          <CardHeader>
            <CardTitle>Employees</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {employees.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Users className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
                <p className="text-lg font-medium">No employees yet</p>
                <p className="mt-1 text-sm">
                  Invite team members to join your company and manage them here.
                </p>
              </div>
            ) : (
              employees.map((employee) => {
                const displayName =
                  `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
                  employee.email ||
                  "Unknown";
                const initials =
                  (employee.firstName?.[0] || "") + (employee.lastName?.[0] || "") || "?";
                const isOwner = employee.role === "owner";
                const isSelf = employee.id === currentUserId;

                return (
                  <div
                    key={employee.id}
                    className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4"
                  >
                    {/* Avatar */}
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-lg font-bold text-white">
                      {employee.avatar ? (
                        <img
                          src={employee.avatar}
                          alt={displayName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{displayName}</p>
                        {isOwner && <Badge className="bg-purple-100 text-purple-700">Owner</Badge>}
                        {employee.isAdmin && !isOwner && (
                          <Badge className="bg-green-100 text-green-700">Admin</Badge>
                        )}
                        {isSelf && (
                          <Badge variant="outline" className="text-blue-600">
                            You
                          </Badge>
                        )}
                        {employee.status === "pending" && (
                          <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
                        )}
                        {employee.status === "active" && !isOwner && (
                          <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{employee.jobTitle || employee.role}</p>
                    </div>

                    {/* Controls — always show for non-owner, non-self employees */}
                    {!isOwner && !isSelf && (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Admin</span>
                          <Switch
                            checked={employee.isAdmin}
                            onCheckedChange={() => toggleAdmin(employee.id, employee.isAdmin)}
                            disabled={updating === employee.id}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Edit</span>
                          <Switch
                            checked={employee.canEditCompany}
                            onCheckedChange={() =>
                              toggleEditAccess(employee.id, employee.canEditCompany)
                            }
                            disabled={updating === employee.id}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => setDeleteTarget({ id: employee.id, name: displayName })}
                          disabled={updating === employee.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Invite Link */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Invite New Employees</p>
                <p className="text-sm text-gray-500">
                  Employees can join your company during their profile setup.
                </p>
              </div>
              <Link href="/trades/company/invite">
                <Button>
                  <User className="mr-2 h-4 w-4" />
                  Create Invite
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Employee Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove Employee"
        description="This will remove the employee from your company. They will lose access to all company resources. This cannot be undone."
        itemLabel={deleteTarget?.name}
        showArchive={false}
        deleteLabel="Remove Employee"
        onConfirmDelete={() =>
          deleteTarget ? removeEmployee(deleteTarget.id, deleteTarget.name) : Promise.resolve()
        }
      />
    </div>
  );
}
