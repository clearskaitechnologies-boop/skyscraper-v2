/**
 * DEPRECATED: stormIntake model doesn't exist in schema.
 */

import { notFound } from "next/navigation";

interface Props {
  params: { id: string };
}

/**
 * Public storm intake page.
 * GET /storm-intake/[id]
 */
export default async function StormIntakePage({ params }: Props) {
  // stormIntake model doesn't exist in schema
  console.log(`[Storm Intake] Model not available, id: ${params.id}`);
  notFound();
}
