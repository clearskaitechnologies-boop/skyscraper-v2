"use client";

import { useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import RouterProvider from "@/components/RouterProvider";

// Dynamically import the React Router ReportWorkbench component
const ReportWorkbench = dynamic(() => import("@/components/pages/ReportWorkbench"), {
  ssr: false,
  loading: () => <div className="p-8">Loading report workbench...</div>,
});

export default function ReportWorkbenchPage() {
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

  return (
    <RouterProvider>
      <ReportWorkbench />
    </RouterProvider>
  );
}
