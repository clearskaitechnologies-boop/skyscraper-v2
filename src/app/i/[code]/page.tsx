/**
 * QR Code Landing Route
 * /i/[code] - Public QR code redirect
 * DEPRECATED: qrLink model doesn't exist in schema.
 */

import { redirect } from "next/navigation";

import { logger } from "@/lib/logger";

interface Props {
  params: {
    code: string;
  };
}

export default async function QrLandingPage({ params }: Props) {
  // qrLink model doesn't exist in schema
  logger.info(`[QR Landing] QR code lookup not available, code: ${params.code}`);
  redirect("/404");
}
