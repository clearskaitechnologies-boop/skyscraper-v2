import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import React, { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWizardStore } from "@/stores/wizardStore";

import { WizardScreen } from "../WizardScreen";

export const ReviewScreen: React.FC = () => {
  const { jobData, updateJobData, resetWizard } = useWizardStore();
  const router = useRouter();
  const [clientName, setClientName] = useState(jobData.clientName || "");
  const [clientEmail, setClientEmail] = useState(jobData.clientEmail || "");
  const [clientPhone, setClientPhone] = useState(jobData.clientPhone || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canProgress = clientName && clientEmail && clientPhone;

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Submit job
    try {
      const response = await fetch("/api/jobs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...jobData,
          clientName,
          clientEmail,
          clientPhone,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        resetWizard();
        router.push(`/dashboard/jobs/${data.jobId}`);
      }
    } catch (error) {
      console.error("Job submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <WizardScreen onNext={handleSubmit} canProgress={!!canProgress && !isSubmitting} isLastStep>
      <div className="space-y-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <CheckCircle2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Review & Submit</h2>
            <p className="text-gray-600">Almost done! Just need your client details</p>
          </div>
        </div>

        {/* Client Info */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              type="text"
              placeholder="John Doe"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="mt-1"
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="clientEmail">Client Email</Label>
            <Input
              id="clientEmail"
              type="email"
              placeholder="john@example.com"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="clientPhone">Client Phone</Label>
            <Input
              id="clientPhone"
              type="tel"
              placeholder="(555) 123-4567"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 rounded-lg bg-gray-50 p-4">
          <h3 className="mb-3 font-semibold text-gray-900">Job Summary:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Location:</span>
              <span className="font-medium">
                {jobData.address}, {jobData.city}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium capitalize">{jobData.jobType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Roof Area:</span>
              <span className="font-medium">{jobData.roofArea} sq ft</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Damage:</span>
              <span className="font-medium capitalize">{jobData.severity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Photos:</span>
              <span className="font-medium">{jobData.photos?.length || 0} uploaded</span>
            </div>
          </div>
        </div>

        {/* Token Cost */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">This will use 1 AI token</span>
            <span className="text-sm font-semibold text-blue-600">1 🪙</span>
          </div>
        </div>

        {isSubmitting && (
          <div className="flex items-center justify-center text-blue-600">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <span>Generating AI report...</span>
          </div>
        )}
      </div>
    </WizardScreen>
  );
};
