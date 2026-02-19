/**
 * DEPRECATED: stormIntake model doesn't exist in schema.
 */

import { notFound } from "next/navigation";

import { logger } from "@/lib/logger";

interface Props {
  params: { id: string };
}

/**
 * Public storm intake page.
 * GET /storm-intake/[id]
 */
export default async function StormIntakePage({ params }: Props) {
  // stormIntake model doesn't exist in schema
  logger.info(`[Storm Intake] Model not available, id: ${params.id}`);
  notFound();
}
