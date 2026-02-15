"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useMemo,useState } from "react";

import { Button } from "@/components/ui/button";
import { analytics } from "@/lib/analytics";

type CheckoutButtonProps = {
  type: "plan" | "tokens";
  planKey?: string;
  tokenPackIndex?: number;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline";
};

export default function CheckoutButton({
  type,
  planKey,
  tokenPackIndex,
  children,
  className,
  variant = "default",
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const { isSignedIn } = useAuth();
  const router = useRouter();

  // Check if subscriptions are open based on countdown
  const launchAt = useMemo(() => {
    const v = process.env.NEXT_PUBLIC_SUBSCRIPTIONS_OPEN_AT;
    const t = v ? Date.parse(v) : NaN;
    return isNaN(t) ? null : new Date(t);
  }, []);

  const handleCheckout = async () => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    // Block paid checkout if countdown hasn't finished (only for plan subscriptions)
    if (type === "plan" && launchAt && Date.now() < launchAt.getTime()) {
      alert("Subscriptions open soon! Please sign up free and leave feedback in the meantime.");
      router.push("/contact#feedback");
      return;
    }

    setLoading(true);
    try {
      // Track trial start for subscription plans
      if (type === "plan" && planKey) {
        await analytics.trialStart(planKey, 3);
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          planKey,
          tokenPackIndex,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Checkout error:", data.error);
        alert("Failed to start checkout. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Determine if button should be disabled (only for plan subscriptions)
  const disabled = type === "plan" && launchAt ? Date.now() < launchAt.getTime() : loading;
  const buttonText =
    type === "plan" && disabled && !loading
      ? "Subscriptions Open Soon"
      : loading
        ? "Loading..."
        : children;
  const buttonTitle =
    type === "plan" && disabled && !loading
      ? "Subscriptions not open yet — sign up free and leave feedback!"
      : undefined;

  return (
    <Button
      onClick={handleCheckout}
      disabled={disabled}
      className={className}
      variant={variant}
      title={buttonTitle}
    >
      {buttonText}
    </Button>
  );
}
