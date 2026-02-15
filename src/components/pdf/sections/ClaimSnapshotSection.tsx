// components/pdf/sections/ClaimSnapshotSection.tsx

import { Text, View } from "@react-pdf/renderer";

import { ClientAndClaimSnapshot, ReportData } from "@/lib/reports/types";

import { SectionHeader } from "../SectionHeader";
import { baseStyles } from "../SharedStyles";

/** Extended claim with Phase C elite fields for snapshot PDF */
interface ClaimSnapshotClaim extends ClientAndClaimSnapshot {
  lossType?: string;
  roofType?: string;
  structureType?: string;
  stories?: string | number;
  slope?: string;
  squareFootage?: string | number;
  agentName?: string;
  nextAction?: string;
}

export function ClaimSnapshotSection({ data }: { data: ReportData }) {
  const c = data.claim as ClaimSnapshotClaim;

  return (
    <View style={baseStyles.section}>
      <SectionHeader data={data} title="Claim Snapshot" />

      <View style={baseStyles.row}>
        <View style={baseStyles.col}>
          <Text style={baseStyles.label}>Claim Number</Text>
          <Text style={baseStyles.value}>{c.claimNumber || "N/A"}</Text>
        </View>
        <View style={baseStyles.col}>
          <Text style={baseStyles.label}>Policy Number</Text>
          <Text style={baseStyles.value}>{c.policyNumber || "N/A"}</Text>
        </View>
        <View style={baseStyles.col}>
          <Text style={baseStyles.label}>Carrier</Text>
          <Text style={baseStyles.value}>{c.carrier || "N/A"}</Text>
        </View>
      </View>

      <View style={[baseStyles.row, { marginTop: 8 }]}>
        <View style={baseStyles.col}>
          <Text style={baseStyles.label}>Date of Loss</Text>
          <Text style={baseStyles.value}>
            {c.dateOfLoss ? new Date(c.dateOfLoss).toLocaleDateString() : "N/A"}
          </Text>
        </View>
        <View style={baseStyles.col}>
          <Text style={baseStyles.label}>Loss Type</Text>
          <Text style={baseStyles.value}>{c.lossType || "N/A"}</Text>
        </View>
        <View style={baseStyles.col}>
          <Text style={baseStyles.label}>Status</Text>
          <Text style={baseStyles.value}>{c.status || "N/A"}</Text>
        </View>
      </View>

      {/* Phase C Elite Fields */}
      <View style={[baseStyles.row, { marginTop: 8 }]}>
        <View style={baseStyles.col}>
          <Text style={baseStyles.label}>Roof Type</Text>
          <Text style={baseStyles.value}>{c.roofType || "Not specified"}</Text>
        </View>
        <View style={baseStyles.col}>
          <Text style={baseStyles.label}>Structure Type</Text>
          <Text style={baseStyles.value}>{c.structureType || "Not specified"}</Text>
        </View>
        <View style={baseStyles.col}>
          <Text style={baseStyles.label}>Stories</Text>
          <Text style={baseStyles.value}>{c.stories || "N/A"}</Text>
        </View>
      </View>

      <View style={[baseStyles.row, { marginTop: 8 }]}>
        <View style={baseStyles.col}>
          <Text style={baseStyles.label}>Slope</Text>
          <Text style={baseStyles.value}>{c.slope || "N/A"}</Text>
        </View>
        <View style={baseStyles.col}>
          <Text style={baseStyles.label}>Square Footage</Text>
          <Text style={baseStyles.value}>
            {c.squareFootage ? `${c.squareFootage} sq ft` : "N/A"}
          </Text>
        </View>
        <View style={baseStyles.col}>
          <Text style={baseStyles.label}>Agent</Text>
          <Text style={baseStyles.value}>{c.agentName || "N/A"}</Text>
        </View>
      </View>

      <View style={{ marginTop: 8 }}>
        <Text style={baseStyles.label}>Property Address</Text>
        <Text style={baseStyles.value}>{c.propertyAddress || "Address not available"}</Text>
      </View>

      {c.nextAction && (
        <View style={{ marginTop: 8 }}>
          <Text style={baseStyles.label}>Next Action</Text>
          <Text style={baseStyles.value}>{c.nextAction}</Text>
        </View>
      )}
    </View>
  );
}
