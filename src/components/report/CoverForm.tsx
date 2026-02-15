import React from "react";

type CoverFormProps = {
  reportId?: string;
  orgId?: string;
  onReportCreate?: (id: string) => void;
};

export default function CoverForm({ reportId, orgId, onReportCreate }: CoverFormProps) {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h2 className="mb-6 text-2xl font-bold">Cover Form</h2>
      <div className="mb-6 rounded border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-yellow-800">
          <strong>Development Note:</strong> This component is being developed. Database schema
          integration is pending completion.
        </p>
        <p className="mt-2 text-sm text-yellow-600">
          Report ID: {reportId || "New Report"} | Org ID: {orgId || "Not specified"}
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Property Owner Name</label>
          <input
            type="text"
            className="w-full rounded border px-3 py-2"
            placeholder="Enter owner name"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Property Address</label>
          <input
            type="text"
            className="w-full rounded border px-3 py-2"
            placeholder="Enter property address"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Insurance Carrier</label>
          <input
            type="text"
            className="w-full rounded border px-3 py-2"
            placeholder="Enter insurance carrier"
          />
        </div>
        <button
          onClick={() => {
            alert("Form submission not yet implemented");
            onReportCreate?.("mock-report-id");
          }}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Save Report (Mock)
        </button>
      </div>
    </div>
  );
}
