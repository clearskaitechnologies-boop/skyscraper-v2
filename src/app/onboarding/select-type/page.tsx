/**
 * 🎯 LEGACY USER TYPE SELECTION PAGE — RETIRED
 *
 * New users are now auto-registered as clients and sent to /portal.
 * Pro users join via invite links (/trades/join?token=xxx).
 * This page now simply redirects to /portal.
 */

import { redirect } from "next/navigation";

export const metadata = {
  title: "SkaiScrape",
};

export default function SelectTypePage() {
  redirect("/portal");
}
