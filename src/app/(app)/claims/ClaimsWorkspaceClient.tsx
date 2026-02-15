"use client";

import React from "react";

import { ClaimsGrid } from "@/components/claims/ClaimsGrid";

type ClaimsWorkspaceClientProps = {
  initialClaims?: any[];
  [key: string]: any;
};

export default function ClaimsWorkspaceClient(props: ClaimsWorkspaceClientProps) {
  const { initialClaims = [] } = props;

  return (
    <div className="mt-8">
      {/* Claims Grid */}
      <ClaimsGrid claims={initialClaims} />
    </div>
  );
}
