"use client";

import { report_templates } from "@prisma/client";
import { FileText, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { logger } from "@/lib/logger";

interface ProposalCreationFormProps {
  templates: report_templates[];
  orgId: string;
}

export function ProposalCreationForm({ templates, orgId }: ProposalCreationFormProps) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [claimId, setClaimId] = useState("");
  const [lossType, setLossType] = useState("");
  const [templateId, setTemplateId] = useState(
    templates.find((t) => t.is_default)?.id || templates[0]?.id || ""
  );
  const [notes, setNotes] = useState("");

  const selectedTemplate = templates.find((t) => t.id === templateId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName || !propertyAddress || !templateId) {
      alert("Please fill in all required fields");
      return;
    }

    setGenerating(true);

    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName,
          propertyAddress,
          claimId: claimId || null,
          lossType: lossType || "General",
          templateId,
          notes,
          orgId,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create proposal");
      }

      const data = await res.json();

      // Navigate to proposal status page
      router.push(`/proposals/${data.proposalId}`);
    } catch (error: any) {
      logger.error("Failed to create proposal:", error);
      alert(`Failed to create proposal: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-6">
      <div className="mb-6 flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-blue-500" />
        <h2 className="text-xl font-semibold text-[color:var(--text)]">Create New Proposal</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Name */}
        <div className="space-y-2">
          <Label htmlFor="projectName">
            Project Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="projectName"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g., Wind Damage - 123 Main St"
            required
            disabled={generating}
          />
        </div>

        {/* Property Address */}
        <div className="space-y-2">
          <Label htmlFor="propertyAddress">
            Property Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="propertyAddress"
            value={propertyAddress}
            onChange={(e) => setPropertyAddress(e.target.value)}
            placeholder="123 Main Street, City, State 12345"
            required
            disabled={generating}
          />
        </div>

        {/* Claim ID (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="claimId">Claim ID (Optional)</Label>
          <Input
            id="claimId"
            value={claimId}
            onChange={(e) => setClaimId(e.target.value)}
            placeholder="Link to existing claim..."
            disabled={generating}
          />
          <p className="text-xs text-[color:var(--muted)]">
            Connect this proposal to an existing claim for data pre-fill
          </p>
        </div>

        {/* Loss Type */}
        <div className="space-y-2">
          <Label htmlFor="lossType">Loss Type</Label>
          <Input
            id="lossType"
            value={lossType}
            onChange={(e) => setLossType(e.target.value)}
            placeholder="e.g., Wind & Hail, Water Damage, Fire"
            disabled={generating}
          />
        </div>

        {/* Template Picker */}
        <div className="space-y-2">
          <Label htmlFor="template">
            Report Template <span className="text-red-500">*</span>
          </Label>
          <Select value={templateId} onValueChange={setTemplateId} disabled={generating}>
            <SelectTrigger id="template">
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                  {template.is_default && " (Default)"}
                  {(template as any).templateType === "SYSTEM" && " [SYSTEM]"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedTemplate && (
            <p className="text-xs text-[color:var(--muted)]">
              {(selectedTemplate as any).description || "No description"}
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special instructions for AI generation..."
            rows={3}
            disabled={generating}
          />
        </div>

        {/* Submit Button */}
        <div className="border-t border-[color:var(--border)] pt-4">
          <Button
            type="submit"
            disabled={generating || !projectName || !propertyAddress || !templateId}
            className="w-full"
            size="lg"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Proposal...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-5 w-5" />
                Generate Proposal with AI
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
