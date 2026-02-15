/**
 * TASK 127: CUSTOM DOMAINS
 *
 * Custom domain management with DNS verification and SSL.
 */

import prisma from "@/lib/prisma";

export type DomainStatus = "PENDING" | "VERIFYING" | "VERIFIED" | "FAILED" | "ACTIVE" | "SUSPENDED";

export interface CustomDomain {
  id: string;
  tenantId: string;
  domain: string;
  status: DomainStatus;
  dnsRecords: DNSRecord[];
  sslCertificate?: SSLCertificate;
  verifiedAt?: Date;
  createdAt: Date;
}

export interface DNSRecord {
  type: "A" | "AAAA" | "CNAME" | "TXT";
  name: string;
  value: string;
  verified: boolean;
}

export interface SSLCertificate {
  issuer: string;
  validFrom: Date;
  validTo: Date;
  fingerprint: string;
}

/**
 * Add custom domain
 */
export async function addCustomDomain(tenantId: string, domain: string): Promise<string> {
  // Validate domain format
  if (!isValidDomain(domain)) {
    throw new Error("Invalid domain format");
  }

  // Check if domain already exists
  const existing = await prisma.customDomain.findFirst({
    where: { domain },
  });

  if (existing) {
    throw new Error("Domain already in use");
  }

  // Generate DNS records
  const dnsRecords = generateDNSRecords(domain);

  const customDomain = await prisma.customDomain.create({
    data: {
      tenantId,
      domain,
      status: "PENDING",
      dnsRecords: dnsRecords as unknown,
    } as Record<string, unknown>,
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      action: "CUSTOM_DOMAIN_ADDED",
      details: { domain } as Record<string, string>,
    },
  });

  return customDomain.id;
}

/**
 * Validate domain format
 */
function isValidDomain(domain: string): boolean {
  const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i;
  return domainRegex.test(domain);
}

/**
 * Generate DNS records
 */
function generateDNSRecords(domain: string): DNSRecord[] {
  return [
    {
      type: "A",
      name: domain,
      value: "192.0.2.1", // Your server IP
      verified: false,
    },
    {
      type: "CNAME",
      name: `www.${domain}`,
      value: domain,
      verified: false,
    },
    {
      type: "TXT",
      name: `_verification.${domain}`,
      value: `skaiscraper-verify=${generateVerificationToken()}`,
      verified: false,
    },
  ];
}

/**
 * Generate verification token
 */
function generateVerificationToken(): string {
  return crypto.randomUUID() + crypto.randomUUID().replace(/-/g, "");
}

/**
 * Verify custom domain
 */
export async function verifyCustomDomain(domainId: string): Promise<{
  verified: boolean;
  errors: string[];
}> {
  const domain = await prisma.customDomain.findUnique({
    where: { id: domainId },
  });

  if (!domain) {
    throw new Error("Domain not found");
  }

  const errors: string[] = [];
  const dnsRecords = domain.dnsRecords as DNSRecord[];
  let allVerified = true;

  // Verify each DNS record
  for (const record of dnsRecords) {
    const verified = await verifyDNSRecord(domain.domain, record);

    if (!verified) {
      allVerified = false;
      errors.push(`${record.type} record not found: ${record.name} -> ${record.value}`);
    }

    record.verified = verified;
  }

  // Update domain status
  if (allVerified) {
    await prisma.customDomain.update({
      where: { id: domainId },
      data: {
        status: "VERIFIED",
        verifiedAt: new Date(),
        dnsRecords: dnsRecords as unknown,
      } as Record<string, unknown>,
    });

    // Provision SSL certificate
    await provisionSSLCertificate(domainId);
  } else {
    await prisma.customDomain.update({
      where: { id: domainId },
      data: {
        status: "FAILED",
        dnsRecords: dnsRecords as unknown,
      } as Record<string, unknown>,
    });
  }

  return { verified: allVerified, errors };
}

/**
 * Verify DNS record
 */
async function verifyDNSRecord(domain: string, record: DNSRecord): Promise<boolean> {
  // TODO: Implement actual DNS lookup
  // This would use Node.js dns module or external DNS API
  return true; // Simulated verification
}

/**
 * Provision SSL certificate
 */
async function provisionSSLCertificate(domainId: string): Promise<void> {
  const domain = await prisma.customDomain.findUnique({
    where: { id: domainId },
  });

  if (!domain) return;

  // TODO: Implement actual SSL provisioning (e.g., Let's Encrypt)
  const sslCertificate: SSLCertificate = {
    issuer: "Let's Encrypt",
    validFrom: new Date(),
    validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    fingerprint: generateFingerprint(),
  };

  await prisma.customDomain.update({
    where: { id: domainId },
    data: {
      status: "ACTIVE",
      sslCertificate: sslCertificate as unknown,
    } as Record<string, unknown>,
  });

  await prisma.auditLog.create({
    data: {
      tenantId: domain.tenantId,
      action: "SSL_PROVISIONED",
      details: { domain: domain.domain } as Record<string, string>,
    },
  });
}

/**
 * Generate SSL fingerprint
 */
function generateFingerprint(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(":");
}

/**
 * Get custom domain
 */
export async function getCustomDomain(domainId: string): Promise<CustomDomain | null> {
  const domain = await prisma.customDomain.findUnique({
    where: { id: domainId },
  });

  return domain as unknown as CustomDomain | null;
}

/**
 * Get tenant domains
 */
export async function getTenantDomains(tenantId: string): Promise<CustomDomain[]> {
  const domains = await prisma.customDomain.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });

  return domains as unknown as CustomDomain[];
}

/**
 * Remove custom domain
 */
export async function removeCustomDomain(domainId: string): Promise<void> {
  const domain = await prisma.customDomain.findUnique({
    where: { id: domainId },
  });

  if (!domain) {
    throw new Error("Domain not found");
  }

  await prisma.customDomain.delete({
    where: { id: domainId },
  });

  await prisma.auditLog.create({
    data: {
      tenantId: domain.tenantId,
      action: "CUSTOM_DOMAIN_REMOVED",
      details: { domain: domain.domain } as Record<string, string>,
    },
  });
}

/**
 * Update domain status
 */
export async function updateDomainStatus(domainId: string, status: DomainStatus): Promise<void> {
  await prisma.customDomain.update({
    where: { id: domainId },
    data: { status } as Record<string, unknown>,
  });
}

/**
 * Check SSL expiry
 */
export async function checkSSLExpiry(domainId: string): Promise<{
  expiring: boolean;
  daysRemaining: number;
}> {
  const domain = await prisma.customDomain.findUnique({
    where: { id: domainId },
  });

  if (!domain) {
    throw new Error("Domain not found");
  }

  const ssl = domain.sslCertificate as SSLCertificate | undefined;

  if (!ssl) {
    return { expiring: true, daysRemaining: 0 };
  }

  const now = new Date();
  const validTo = new Date(ssl.validTo);
  const daysRemaining = Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return {
    expiring: daysRemaining < 30,
    daysRemaining,
  };
}

/**
 * Renew SSL certificate
 */
export async function renewSSLCertificate(domainId: string): Promise<void> {
  await provisionSSLCertificate(domainId);
}

/**
 * Get domains requiring renewal
 */
export async function getDomainsRequiringRenewal(): Promise<CustomDomain[]> {
  const domains = await prisma.customDomain.findMany({
    where: {
      status: "ACTIVE",
    },
  });

  const expiring: CustomDomain[] = [];

  for (const domain of domains) {
    const { expiring: isExpiring } = await checkSSLExpiry(domain.id);
    if (isExpiring) {
      expiring.push(domain as unknown as CustomDomain);
    }
  }

  return expiring;
}

/**
 * Get domain by name
 */
export async function getDomainByName(domain: string): Promise<CustomDomain | null> {
  const customDomain = await prisma.customDomain.findFirst({
    where: { domain },
  });

  return customDomain as unknown as CustomDomain | null;
}

/**
 * Validate domain ownership
 */
export async function validateDomainOwnership(
  domain: string,
  verificationToken: string
): Promise<boolean> {
  const customDomain = await getDomainByName(domain);

  if (!customDomain) return false;

  const dnsRecords = customDomain.dnsRecords as DNSRecord[];
  const txtRecord = dnsRecords.find((r) => r.type === "TXT");

  if (!txtRecord) return false;

  return txtRecord.value.includes(verificationToken);
}
