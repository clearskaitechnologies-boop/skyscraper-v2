"use client";

import { CheckCircle,Loader2, Wrench } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PortalWorkOrderCardProps {
  claimId: string;
}

export function PortalWorkOrderCard({ claimId }: PortalWorkOrderCardProps) {
  const [workType, setWorkType] = useState("Roof Repair");
  const [description, setDescription] = useState("");
  const [preferredSchedule, setPreferredSchedule] = useState("");
  const [accessNotes, setAccessNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (!description.trim()) {
      setError("Please provide a description of the work needed.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Format as structured work order message
      const workOrderBody = `[WORK ORDER REQUEST]

Type of Work: ${workType}

Description:
${description.trim()}

Preferred Schedule:
${preferredSchedule.trim() || "No preference specified"}

Access Notes:
${accessNotes.trim() || "No special access instructions"}`;

      // Send via existing portal messaging API
      const res = await fetch("/api/portal/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimId,
          message: workOrderBody,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit work order");
      }

      // Clear form and show success
      setWorkType("Roof Repair");
      setDescription("");
      setPreferredSchedule("");
      setAccessNotes("");
      setSuccess(true);
      toast.success("Work order sent to your contractor!");

      // Hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      console.error("Error submitting work order:", err);
      setError("There was an issue sending your request. Please try again.");
      toast.error("Failed to send work order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-50 p-2">
            <Wrench className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Request Work Order</CardTitle>
            <CardDescription>Tell your contractor what work you'd like done</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Work Type */}
          <div className="space-y-2">
            <Label htmlFor="workType">Type of Work</Label>
            <select
              id="workType"
              value={workType}
              onChange={(e) => setWorkType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
              disabled={isSubmitting}
            >
              <option value="Roof Repair">Roof Repair</option>
              <option value="Gutters">Gutters</option>
              <option value="Siding">Siding</option>
              <option value="Windows">Windows</option>
              <option value="Interior Paint">Interior Paint</option>
              <option value="Exterior Paint">Exterior Paint</option>
              <option value="Drywall">Drywall</option>
              <option value="Flooring">Flooring</option>
              <option value="HVAC">HVAC</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the work you need done..."
              className="min-h-[100px] resize-none"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Preferred Schedule */}
          <div className="space-y-2">
            <Label htmlFor="schedule">Preferred Schedule</Label>
            <Input
              id="schedule"
              value={preferredSchedule}
              onChange={(e) => setPreferredSchedule(e.target.value)}
              placeholder="e.g., Next week, any afternoon"
              disabled={isSubmitting}
            />
          </div>

          {/* Access Notes */}
          <div className="space-y-2">
            <Label htmlFor="accessNotes">Access Notes</Label>
            <Textarea
              id="accessNotes"
              value={accessNotes}
              onChange={(e) => setAccessNotes(e.target.value)}
              placeholder="Gate codes, pets, alarm systems, etc."
              className="min-h-[80px] resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Error Message */}
          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span>Work order sent to your contractor!</span>
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Wrench className="mr-2 h-4 w-4" />
                Submit Work Order
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
