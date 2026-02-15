"use client";

import { useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Dynamically import the React Router GovernanceRules component
const GovernanceRules = dynamic(() => import("@/components/pages/GovernanceRules"), {
  ssr: false,
  loading: () => <div className="p-8">Loading governance rules...</div>,
});

export default function GovernanceRulesPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  return <GovernanceRules />;
}
