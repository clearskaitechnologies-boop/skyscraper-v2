import { redirect } from "next/navigation";

/**
 * Public storm intake landing page.
 * Redirects to /storm-intake/new to start a new intake.
 */
export default function StormIntakeLandingPage() {
  redirect("/storm-intake/new");
}
