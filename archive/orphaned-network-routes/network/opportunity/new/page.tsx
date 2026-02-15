"use client";

import { useAuth } from "@clerk/nextjs";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { FullAccessBadge, TokenBadge } from "@/components/trades/TokenBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { getTradeEmoji, TRADE_TYPES } from "@/lib/trades";

export const dynamic = "force-dynamic";

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

export default function NewOpportunityPage() {
  const router = useRouter();
  const { userId } = useAuth();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [trade, setTrade] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !body.trim() || !trade) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/trades/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          trade,
          city: city.trim() || null,
          state: state || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          toast.error("Full Access required to post opportunities", {
            action: {
              label: "Upgrade",
              onClick: () => router.push("/billing"),
            },
          });
        } else {
          toast.error(data.error || "Failed to create opportunity");
        }
        return;
      }

      toast.success("Opportunity posted!", {
        description: "Your opportunity is now live",
      });

      router.push("/network/opportunities");
    } catch (err) {
      console.error("Create opportunity error:", err);
      toast.error("Failed to create opportunity");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/network/opportunities")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Post Job Opportunity</h1>
          <p className="mt-1 text-muted-foreground">
            Share your opportunity with the Trades Network
          </p>
        </div>
      </div>

      {/* Full Access Required Notice */}
      <Card className="mb-6 border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 dark:border-violet-800 dark:from-violet-950/20 dark:to-purple-950/20">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" />
            <div>
              <p className="text-sm font-semibold text-violet-900 dark:text-violet-100">
                Full Access Required
              </p>
              <p className="mt-1 text-xs text-violet-700 dark:text-violet-300">
                Posting opportunities requires a Full Access subscription ($9.99/month). Upgrade in
                your billing settings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Opportunity Details</CardTitle>
            <CardDescription>
              Provide details about the job or opportunity you're offering
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title">
                Job Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Commercial Roofing Project - Dallas"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                required
                className="mt-2"
              />
              <p className="mt-1 text-xs text-muted-foreground">{title.length}/200 characters</p>
            </div>

            {/* Trade */}
            <div>
              <Label htmlFor="trade">
                Trade Type <span className="text-destructive">*</span>
              </Label>
              <Select value={trade} onValueChange={setTrade} required>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select trade..." />
                </SelectTrigger>
                <SelectContent>
                  {TRADE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      <span className="flex items-center gap-2">
                        <span>{getTradeEmoji(t)}</span>
                        <span>{t}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="body">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="body"
                placeholder="Describe the opportunity, requirements, timeline, compensation, etc."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                maxLength={2000}
                required
                className="mt-2"
              />
              <p className="mt-1 text-xs text-muted-foreground">{body.length}/2000 characters</p>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="city">City (Optional)</Label>
                <Input
                  id="city"
                  placeholder="e.g., Dallas"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  maxLength={100}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="state">State (Optional)</Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select state..." />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/network/opportunities")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Posting..." : "Post Opportunity"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
