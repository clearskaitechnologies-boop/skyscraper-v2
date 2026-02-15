/**
 * OnboardingProgress - Shows completion status pill in navigation
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";

import { Button } from "./ui/button";

interface OnboardingStatus {
  branding: boolean;
  defaults: boolean;
  templates: boolean;
}

export default function OnboardingProgress() {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: prof } = await supabase
          .from("user_profiles")
          .select("org_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!prof?.org_id) {
          setStatus({ branding: false, defaults: false, templates: false });
          return;
        }

        const [{ data: branding }, { data: defaults }] = await Promise.all([
          supabase
            .from("org_branding")
            .select("logo_url, primary_color")
            .eq("org_id", prof.org_id)
            .maybeSingle(),
          supabase
            .from("org_defaults")
            .select("default_mode")
            .eq("org_id", prof.org_id)
            .maybeSingle(),
        ]);

        setStatus({
          branding: !!branding?.logo_url || !!branding?.primary_color,
          defaults: !!defaults,
          templates: !!defaults, // Templates implied if defaults exist
        });
      } catch (error) {
        console.error("Failed to load onboarding status:", error);
      }
    })();
  }, []);

  if (!status) return null;

  const allComplete = status.branding && status.defaults && status.templates;
  if (allComplete) return null; // Hide once everything is done

  const Chip = ({ complete, label }: { complete: boolean; label: string }) => (
    <span
      className={`rounded-xl px-2 py-0.5 text-xs font-medium ${
        complete
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
          : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
      }`}
    >
      {label} {complete ? "✓" : "•"}
    </span>
  );

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => navigate("/onboarding")}
      className="flex items-center gap-1.5"
    >
      <Chip complete={status.branding} label="Branding" />
      <Chip complete={status.templates} label="Templates" />
      <Chip complete={status.defaults} label="Defaults" />
    </Button>
  );
}
