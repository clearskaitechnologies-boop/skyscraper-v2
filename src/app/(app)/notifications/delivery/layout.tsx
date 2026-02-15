import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Delivery Notifications | SkaiScraper",
  description: "Send and manage client delivery notifications for job updates.",
};

export default function DeliveryNotificationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
