/**
 * Email Subscription Component
 * Reusable newsletter signup with checkbox for consent
 */

"use client";

import { Check, Loader2, Mail, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmailSubscriptionProps {
  /** Source identifier for analytics */
  source?: string;
  /** Show name fields */
  showNameFields?: boolean;
  /** Compact inline mode */
  inline?: boolean;
  /** Custom button text */
  buttonText?: string;
  /** Custom placeholder */
  placeholder?: string;
  /** Show category options */
  showCategories?: boolean;
  /** Callback on successful subscription */
  onSuccess?: (email: string) => void;
  /** Custom class names */
  className?: string;
}

const CATEGORIES = [
  { id: "updates", label: "Product Updates", description: "New features and improvements" },
  { id: "newsletters", label: "Newsletters", description: "Industry news and insights" },
  { id: "promotions", label: "Promotions", description: "Special offers and discounts" },
  { id: "tips", label: "Tips & Guides", description: "How-to guides and best practices" },
];

export function EmailSubscription({
  source = "website",
  showNameFields = false,
  inline = false,
  buttonText = "Subscribe",
  placeholder = "Enter your email",
  showCategories = false,
  onSuccess,
  className = "",
}: EmailSubscriptionProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [consent, setConsent] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "updates",
    "newsletters",
  ]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setMessage("Please enter your email address");
      setStatus("error");
      return;
    }

    if (!consent) {
      setMessage("Please agree to receive emails");
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          categories: selectedCategories,
          source,
          sourceUrl: typeof window !== "undefined" ? window.location.href : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Thanks for subscribing!");
        setEmail("");
        setFirstName("");
        setLastName("");
        onSuccess?.(email);
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((c) => c !== categoryId) : [...prev, categoryId]
    );
  };

  // Inline compact version
  if (inline) {
    return (
      <form onSubmit={handleSubmit} className={`flex flex-col gap-2 ${className}`}>
        <div className="flex gap-2">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            className="flex-1"
            disabled={status === "loading" || status === "success"}
          />
          <Button type="submit" disabled={status === "loading" || status === "success" || !consent}>
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : status === "success" ? (
              <Check className="h-4 w-4" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            <span className="ml-2">{status === "success" ? "Subscribed!" : buttonText}</span>
          </Button>
        </div>
        <div className="flex items-start gap-2">
          <Checkbox
            id="consent-inline"
            checked={consent}
            onCheckedChange={(checked) => setConsent(checked === true)}
            disabled={status === "loading" || status === "success"}
          />
          <Label htmlFor="consent-inline" className="text-xs text-slate-500">
            I agree to receive email communications from SkaiScraper. You can unsubscribe at any
            time.
          </Label>
        </div>
        {message && (
          <p className={`text-sm ${status === "error" ? "text-red-500" : "text-green-600"}`}>
            {message}
          </p>
        )}
      </form>
    );
  }

  // Full version
  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {showNameFields && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              disabled={status === "loading" || status === "success"}
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
              disabled={status === "loading" || status === "success"}
            />
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          required
          disabled={status === "loading" || status === "success"}
        />
      </div>

      {showCategories && (
        <div className="space-y-3">
          <Label>Email Preferences</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="flex items-start gap-2 rounded-lg border p-3 transition-colors hover:bg-slate-50"
              >
                <Checkbox
                  id={`cat-${cat.id}`}
                  checked={selectedCategories.includes(cat.id)}
                  onCheckedChange={() => toggleCategory(cat.id)}
                  disabled={status === "loading" || status === "success"}
                />
                <div className="space-y-1">
                  <Label htmlFor={`cat-${cat.id}`} className="cursor-pointer font-medium">
                    {cat.label}
                  </Label>
                  <p className="text-xs text-slate-500">{cat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <Checkbox
          id="consent"
          checked={consent}
          onCheckedChange={(checked) => setConsent(checked === true)}
          disabled={status === "loading" || status === "success"}
        />
        <Label htmlFor="consent" className="cursor-pointer text-sm text-slate-600">
          I agree to receive email communications from ClearSkai Technologies, LLC (SkaiScraper). I
          understand I can unsubscribe at any time. View our{" "}
          <a href="/legal/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
          </a>
          .
        </Label>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 rounded-lg p-3 ${
            status === "error"
              ? "bg-red-50 text-red-700"
              : status === "success"
                ? "bg-green-50 text-green-700"
                : ""
          }`}
        >
          {status === "error" ? (
            <X className="h-4 w-4" />
          ) : status === "success" ? (
            <Check className="h-4 w-4" />
          ) : null}
          <span>{message}</span>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={status === "loading" || status === "success" || !consent}
      >
        {status === "loading" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Subscribing...
          </>
        ) : status === "success" ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Subscribed!
          </>
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4" />
            {buttonText}
          </>
        )}
      </Button>

      <p className="text-center text-xs text-slate-500">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </form>
  );
}
