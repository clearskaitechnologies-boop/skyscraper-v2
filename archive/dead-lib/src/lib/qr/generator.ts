/**
 * QR Code Generator
 * Creates short links and QR code images
 */

import { customAlphabet } from 'nanoid';
import QRCode from 'qrcode';

import prisma from '@/lib/prisma';

// Short code generator (URL-safe characters)
const nanoid = customAlphabet('23456789abcdefghjkmnpqrstuvwxyz', 8);

export interface QrLinkData {
  id: string; // Short code
  url: string; // Full URL
  qrCodeDataUrl: string; // Base64 QR code image
}

/**
 * Generate a QR link with attribution
 */
export async function generateQrLink(params: {
  orgId: string;
  batchJobId?: string;
  addressId?: string;
  targetPath: string;
  metadata?: any;
}): Promise<QrLinkData> {
  const shortCode = nanoid();

  // Create QR link record
  await prisma.qrLink.create({
    data: {
      id: shortCode,
      orgId: params.orgId,
      batchJobId: params.batchJobId,
      addressId: params.addressId,
      targetPath: params.targetPath,
      metadata: params.metadata || {},
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://skaiscrape.com';
  const fullUrl = `${baseUrl}/i/${shortCode}`;

  // Generate QR code image (base64 data URL)
  const qrCodeDataUrl = await QRCode.toDataURL(fullUrl, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 300,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });

  return {
    id: shortCode,
    url: fullUrl,
    qrCodeDataUrl,
  };
}

/**
 * Generate QR code image only (for existing link)
 */
export async function generateQrCodeImage(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 300,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });
}

/**
 * Log a QR scan event
 */
export async function logQrEvent(params: {
  qrId: string;
  type: 'scan' | 'view' | 'click';
  ip?: string;
  userAgent?: string;
  referer?: string;
  metadata?: any;
}) {
  // Hash IP for privacy
  const ipHash = params.ip
    ? Buffer.from(params.ip).toString('base64').slice(0, 16)
    : null;

  await prisma.qrEvent.create({
    data: {
      qrId: params.qrId,
      type: params.type,
      ipHash,
      userAgent: params.userAgent,
      referer: params.referer,
      metadata: params.metadata || {},
    },
  });
}
