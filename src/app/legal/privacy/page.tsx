import { Shield } from "lucide-react";

import EmptyState from "@/components/ui/EmptyState";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <EmptyState
        title="Privacy Policy"
        description="Learn about our data handling and user privacy practices. Detailed policy text will be published here."
        icon={<Shield className="h-12 w-12 text-primary" />}
      />
    </main>
  );
}