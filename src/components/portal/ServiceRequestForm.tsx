"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ServiceRequestFormProps {
  partnerId: string;
  clientId: string;
}

export default function ServiceRequestForm({ partnerId, clientId }: ServiceRequestFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    urgency: "NORMAL" as "LOW" | "NORMAL" | "HIGH" | "URGENT",
    preferredDate: "",
    address: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch("/api/service-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tradePartnerId: partnerId,
          ...formData,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setFormData({
          title: "",
          description: "",
          urgency: "NORMAL",
          preferredDate: "",
          address: "",
        });
      }
    } catch (error) {
      console.error("Failed to submit service request:", error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-lg bg-green-50 p-4 text-center">
        <p className="font-medium text-green-900">Request submitted successfully!</p>
        <p className="mt-1 text-sm text-green-700">
          The trade partner will review your request and contact you soon.
        </p>
        <Button onClick={() => setSuccess(false)} variant="outline" size="sm" className="mt-3">
          Submit Another Request
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Request Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Roof inspection needed"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe what you need..."
          rows={4}
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="urgency">Urgency</Label>
          <select
            id="urgency"
            value={formData.urgency}
            onChange={(e) =>
              setFormData({
                ...formData,
                urgency: e.target.value as any,
              })
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            aria-label="Select urgency level"
          >
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        <div>
          <Label htmlFor="preferredDate">Preferred Date</Label>
          <Input
            id="preferredDate"
            type="date"
            value={formData.preferredDate}
            onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Service Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="123 Main St, City, State ZIP"
          required
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Submitting..." : "Submit Request"}
      </Button>
    </form>
  );
}
