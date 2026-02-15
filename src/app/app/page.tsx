import { redirect } from "next/navigation";

/**
 * /app redirect page
 *
 * This route handles direct navigation to /app and redirects to the actual
 * CRM home page at /app/dashboard.
 *
 * The (app) route group contains all CRM pages, but /app itself isn't a valid
 * page in that group, so we create this explicit redirect.
 */
export default function AppIndexPage() {
  redirect("/app/dashboard");
}
