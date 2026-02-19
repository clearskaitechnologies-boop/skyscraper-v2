import { redirect } from "next/navigation";

/**
 * /reports → /reports/hub redirect
 * Ensures no blank page if user navigates to /reports directly
 */
export default function ReportsIndexPage() {
  redirect("/reports/hub");
}
