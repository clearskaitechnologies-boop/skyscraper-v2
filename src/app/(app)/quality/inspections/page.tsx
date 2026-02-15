"use client";

import { useUser } from "@clerk/nextjs";
import { AlertCircle,Camera, CheckCircle, ClipboardCheck, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

interface Inspection {
  id: string;
  jobName: string;
  inspector: string;
  date: string;
  status: "passed" | "failed" | "pending";
  itemsChecked: number;
  totalItems: number;
  photos: number;
}

export default function QAInspectionsPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const [inspections] = useState<Inspection[]>([
    {
      id: "1",
      jobName: "Roof Replacement - 123 Main St",
      inspector: "Mike Johnson",
      date: "2024-12-06",
      status: "passed",
      itemsChecked: 15,
      totalItems: 15,
      photos: 8,
    },
    {
      id: "2",
      jobName: "Commercial Repair - Acme Corp",
      inspector: "Sarah Williams",
      date: "2024-12-05",
      status: "failed",
      itemsChecked: 12,
      totalItems: 15,
      photos: 5,
    },
  ]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <ClipboardCheck className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed":
        return "green";
      case "failed":
        return "red";
      case "pending":
        return "yellow";
      default:
        return "gray";
    }
  };

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-[color:var(--text)]">
            Quality Assurance & Inspections
          </h1>
          <p className="text-gray-600">
            Inspection checklists, photo documentation, and certifications
          </p>
        </div>
        <Button>New Inspection</Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-3xl font-bold text-green-600">42</div>
          <div className="text-sm text-gray-600">Inspections Passed</div>
          <div className="mt-1 text-xs text-gray-500">This month</div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-3xl font-bold text-red-600">3</div>
          <div className="text-sm text-gray-600">Inspections Failed</div>
          <div className="mt-1 text-xs text-gray-500">This month</div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-3xl font-bold text-yellow-600">8</div>
          <div className="text-sm text-gray-600">Pending Review</div>
          <div className="mt-1 text-xs text-gray-500">Awaiting action</div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-3xl font-bold text-blue-600">93%</div>
          <div className="text-sm text-gray-600">Pass Rate</div>
          <div className="mt-1 text-xs text-gray-500">Last 90 days</div>
        </div>
      </div>

      {/* Inspections Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Job</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Inspector</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Progress</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Photos</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {inspections.map((inspection) => {
                const statusColor = getStatusColor(inspection.status);
                const progress = Math.round(
                  (inspection.itemsChecked / inspection.totalItems) * 100
                );
                return (
                  <tr key={inspection.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <ClipboardCheck className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium">{inspection.jobName}</div>
                          <div className="text-sm text-gray-500">ID: {inspection.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{inspection.inspector}</td>
                    <td className="px-6 py-4">{new Date(inspection.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="max-w-32 flex-1">
                          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className={`bg- h-full${statusColor}-500`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {inspection.itemsChecked}/{inspection.totalItems}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Camera className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{inspection.photos}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`bg- px-3 py-1${statusColor}-100 text-${statusColor}-700 flex w-fit items-center gap-1 rounded-full text-xs font-medium capitalize`}
                      >
                        {getStatusIcon(inspection.status)}
                        {inspection.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        {inspection.status === "pending" && <Button size="sm">Continue</Button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
