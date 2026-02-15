/**
 * Code Compliance Section Component
 *
 * Displays code & compliance requirements in PDF reports.
 */

"use client";

import type { ComplianceReport } from "@/lib/compliance/code-checker";

export interface ComplianceSectionProps {
  complianceReport: ComplianceReport;
  showCostImpact?: boolean;
}

export default function ComplianceSection({
  complianceReport,
  showCostImpact = true,
}: ComplianceSectionProps) {
  // Derive display values from the actual ComplianceReport type
  const allViolations = complianceReport.checks.flatMap((c) => c.violations);
  const requiredUpgrades = allViolations.filter(
    (v) => v.severity === "error" || v.severity === "critical"
  );
  const optionalRecs = allViolations.filter(
    (v) => v.severity === "info" || v.severity === "warning"
  );
  const permitRequired = complianceReport.checks.some((c) => c.permitRequired);
  const jurisdiction = complianceReport.state;
  const buildingCode = complianceReport.codeInfo.edition;
  const amendments = complianceReport.codeInfo.amendments ?? [];

  const upgradeCount = requiredUpgrades.length;

  return (
    <div className="compliance-section rounded-lg bg-white p-6 shadow">
      {/* Header */}
      <div className="mb-6 border-b-2 border-purple-600 pb-3">
        <h2 className="text-2xl font-bold text-gray-900">Code & Compliance Requirements</h2>
        <p className="mt-1 text-sm text-gray-600">
          {jurisdiction} | {buildingCode}
        </p>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <div className="rounded-lg bg-purple-50 p-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Required Upgrades</p>
              <p className="text-2xl font-bold text-purple-600">{upgradeCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Violations Found</p>
              <p className="text-2xl font-bold text-purple-600">{allViolations.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Permit Required</p>
              <p className="text-2xl font-bold text-purple-600">{permitRequired ? "Yes" : "No"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Required Upgrades (critical / error violations) */}
      {requiredUpgrades.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 text-lg font-semibold text-gray-800">Required Upgrades</h3>
          <div className="space-y-4">
            {requiredUpgrades.map((violation, idx) => (
              <div key={idx} className="rounded border-l-4 border-red-500 bg-red-50 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{violation.description}</p>
                    <p className="mt-1 text-sm text-gray-600">{violation.remediation}</p>
                    <p className="mt-2 text-xs text-gray-500">
                      Code: {violation.code} §{violation.section}
                    </p>
                  </div>
                  {showCostImpact && (
                    <div className="ml-4 text-right">
                      <span className="inline-block rounded-full bg-red-100 px-2 py-1 text-xs font-semibold uppercase text-red-700">
                        {violation.severity}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations (info / warning violations) */}
      {optionalRecs.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 text-lg font-semibold text-gray-800">Optional Recommendations</h3>
          <div className="space-y-4">
            {optionalRecs.map((rec, idx) => (
              <div key={idx} className="rounded border-l-4 border-yellow-500 bg-yellow-50 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{rec.description}</p>
                    <p className="mt-1 text-sm text-gray-600">{rec.remediation}</p>
                    <p className="mt-2 text-xs text-gray-500">
                      Code: {rec.code} §{rec.section}
                    </p>
                  </div>
                  {showCostImpact && (
                    <div className="ml-4 text-right">
                      <span className="inline-block rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold uppercase text-yellow-700">
                        {rec.severity}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permit Info */}
      {permitRequired && (
        <div className="mb-6">
          <h3 className="mb-3 text-lg font-semibold text-gray-800">Permit Requirements</h3>
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Jurisdiction</p>
                <p className="font-medium text-gray-900">{jurisdiction}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Building Code</p>
                <p className="font-medium text-gray-900">{buildingCode}</p>
              </div>
            </div>
            <div className="mt-4 border-t border-blue-200 pt-4">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> A building permit is required for this scope of work.
                Contractor must obtain permit before starting work.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Local Amendments / Ordinances */}
      {amendments.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 text-lg font-semibold text-gray-800">Local Amendments</h3>
          <div className="space-y-3">
            {amendments.map((amendment, idx) => (
              <div key={idx} className="rounded bg-gray-50 p-3">
                <p className="text-sm font-medium text-gray-900">{amendment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 border-t border-gray-200 pt-4 text-xs text-gray-500">
        <p>
          Compliance analysis based on {buildingCode} and local jurisdiction requirements.
          Contractor is responsible for verifying current code requirements before work begins.
        </p>
      </div>
    </div>
  );
}
