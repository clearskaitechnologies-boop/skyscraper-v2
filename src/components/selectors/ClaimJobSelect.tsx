"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ClaimLite = {
  id: string;
  claimNumber: string | null;
  propertyAddress: string | null;
  dateOfLoss: string | null;
};

type JobLite = {
  id: string;
  title: string;
  claimId: string | null;
  status: string | null;
};

export type ClaimJobSelection = {
  claimId?: string;
  jobId?: string;
  resolvedClaimId?: string;
};

function formatClaimLabel(c: ClaimLite) {
  const number = c.claimNumber || c.id.slice(0, 8);
  const address = c.propertyAddress || "No address";
  return `${number} — ${address}`;
}

function formatJobLabel(j: JobLite) {
  const title = j.title || `Job ${j.id.slice(0, 8)}`;
  const suffix = j.status ? ` (${j.status})` : "";
  return `${title}${suffix}`;
}

export function ClaimJobSelect(props: {
  value: ClaimJobSelection;
  onValueChange: (next: ClaimJobSelection) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  const { value, onValueChange, placeholder = "Select claim or job", className, disabled } = props;

  const [claims, setClaims] = useState<ClaimLite[]>([]);
  const [jobs, setJobs] = useState<JobLite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      try {
        const [claimsRes, jobsRes] = await Promise.all([
          fetch("/api/claims/list-lite", { cache: "no-store" }),
          fetch("/api/jobs", { cache: "no-store" }),
        ]);

        const claimsJson = claimsRes.ok ? await claimsRes.json() : null;
        const claimsArr = Array.isArray(claimsJson) ? claimsJson : claimsJson?.claims;

        const mappedClaims: ClaimLite[] = Array.isArray(claimsArr)
          ? claimsArr
              .filter((c: any) => c && typeof c.id === "string")
              .map((c: any) => ({
                id: String(c.id),
                claimNumber: c.claimNumber ?? null,
                propertyAddress: c.propertyAddress ?? null,
                dateOfLoss: c.dateOfLoss ?? null,
              }))
          : [];

        const jobsJson = jobsRes.ok ? await jobsRes.json() : null;
        const jobsArr = Array.isArray(jobsJson) ? jobsJson : jobsJson?.jobs;

        const mappedJobs: JobLite[] = Array.isArray(jobsArr)
          ? jobsArr
              .filter((j: any) => j && typeof j.id === "string")
              .map((j: any) => ({
                id: String(j.id),
                title: String(j.title || ""),
                claimId: j.claimId ? String(j.claimId) : null,
                status: j.status ? String(j.status) : null,
              }))
          : [];

        if (!cancelled) {
          setClaims(mappedClaims);
          setJobs(mappedJobs);
        }
      } catch {
        if (!cancelled) {
          setClaims([]);
          setJobs([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const options = useMemo(() => {
    const claimOptions = claims.map((c) => ({
      value: `claim:${c.id}`,
      label: formatClaimLabel(c),
    }));
    const jobOptions = jobs.map((j) => ({ value: `job:${j.id}`, label: formatJobLabel(j) }));
    return { claimOptions, jobOptions };
  }, [claims, jobs]);

  const currentValue = value.claimId
    ? `claim:${value.claimId}`
    : value.jobId
      ? `job:${value.jobId}`
      : undefined;

  // Only disable if explicitly disabled, not just because data is empty
  const isDisabled = disabled || loading;

  const placeholderText = useMemo(() => {
    if (loading) return "Loading...";
    if (claims.length === 0 && jobs.length === 0)
      return "No claims or jobs found — create one first";
    return placeholder;
  }, [loading, claims.length, jobs.length, placeholder]);

  const handleChange = (raw: string) => {
    if (!raw) {
      onValueChange({});
      return;
    }
    const [kind, id] = raw.split(":");
    if (!id) {
      onValueChange({});
      return;
    }

    if (kind === "claim") {
      onValueChange({ claimId: id, resolvedClaimId: id });
      return;
    }

    if (kind === "job") {
      const job = jobs.find((j) => j.id === id);
      onValueChange({ jobId: id, resolvedClaimId: job?.claimId || undefined });
      return;
    }

    onValueChange({});
  };

  return (
    <Select value={currentValue} onValueChange={handleChange} disabled={isDisabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholderText} />
      </SelectTrigger>
      <SelectContent>
        {options.claimOptions.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
        {options.jobOptions.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
