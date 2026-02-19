"use client";

import { CalendarIcon, Clock, FileText, Loader2, MapPin, StickyNote, Type } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

interface Claim {
  id: string;
  claimNumber: string;
  title?: string | null;
}

interface Lead {
  id: string;
  title: string;
}

interface NewAppointmentFormProps {
  claims: Claim[];
  leads: Lead[];
}

const APPOINTMENT_TYPES = [
  { value: "inspection", label: "Property Inspection" },
  { value: "meeting", label: "Client Meeting" },
  { value: "adjuster", label: "Adjuster Meeting" },
  { value: "site_visit", label: "Site Visit" },
  { value: "follow_up", label: "Follow-Up" },
  { value: "estimate", label: "Estimate / Bid" },
  { value: "other", label: "Other" },
];

export default function NewAppointmentForm({ claims, leads }: NewAppointmentFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [linkedClaimId, setLinkedClaimId] = useState("");
  const [linkedLeadId, setLinkedLeadId] = useState("");

  const handleTypeChange = (value: string) => {
    setAppointmentType(value);
    const typeLabel = APPOINTMENT_TYPES.find((t) => t.value === value)?.label || "";
    if (!title) {
      setTitle(typeLabel);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter an appointment title");
      return;
    }
    if (!date) {
      toast.error("Please select a date");
      return;
    }
    if (!startTime || !endTime) {
      toast.error("Please set start and end times");
      return;
    }

    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    if (endDateTime <= startDateTime) {
      toast.error("End time must be after start time");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          location: location.trim() || undefined,
          claimId: linkedClaimId || undefined,
          leadId: linkedLeadId || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create appointment");
      }

      toast.success("Appointment created successfully!");
      router.push("/appointments");
      router.refresh();
    } catch (error) {
      logger.error("Failed to create appointment:", error);
      toast.error(error.message || "Failed to create appointment");
    } finally {
      setSaving(false);
    }
  };

  // Get today as minimum date
  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      {/* Appointment Details */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            Appointment Details
          </CardTitle>
          <CardDescription>Set up the basic information for this appointment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Appointment Type</Label>
            <Select value={appointmentType} onValueChange={handleTypeChange}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                {APPOINTMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Type className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Roof Inspection — 123 Main St"
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the appointment purpose..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Date & Time */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Clock className="h-5 w-5 text-blue-600" />
            Date & Time
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">
              Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={today}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">
                Start Time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">
                End Time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <MapPin className="h-5 w-5 text-blue-600" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="location">Address or Meeting Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. 123 Main St, Phoenix, AZ 85001"
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Link to Claim or Lead */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <FileText className="h-5 w-5 text-blue-600" />
            Link to Job
          </CardTitle>
          <CardDescription>Optionally connect this appointment to a claim or lead</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {claims.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="claim">Claim</Label>
              <Select value={linkedClaimId} onValueChange={setLinkedClaimId}>
                <SelectTrigger id="claim">
                  <SelectValue placeholder="Link to a claim (optional)..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {claims.map((claim) => (
                    <SelectItem key={claim.id} value={claim.id}>
                      {claim.claimNumber}
                      {claim.title ? ` — ${claim.title}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {leads.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="lead">Lead / Job</Label>
              <Select value={linkedLeadId} onValueChange={setLinkedLeadId}>
                <SelectTrigger id="lead">
                  <SelectValue placeholder="Link to a lead (optional)..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <StickyNote className="h-5 w-5 text-blue-600" />
            Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Internal notes — access codes, contact preferences, special instructions..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3 pb-8">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/appointments")}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Create Appointment
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
