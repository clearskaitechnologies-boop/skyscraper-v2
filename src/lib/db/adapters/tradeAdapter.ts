/**
 * Trade Adapter
 * Converts Prisma trades models → Domain camelCase DTOs
 */

import type { tradesCompany, tradesCompanyMember, tradesPost } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

// =============================================================================
// Domain DTOs
// =============================================================================

export interface TradesCompanyDTO {
  id: string;
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  website?: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  lat?: string;
  lng?: string;
  specialties: string[];
  serviceArea: string[];
  yearsInBusiness?: number;
  licenseNumber?: string;
  insuranceVerified: boolean;
  rating?: number;
  reviewCount: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  // Computed
  location?: string;

  // Relations (optional)
  members?: TradesMemberDTO[];
  posts?: TradesPostDTO[];
}

export interface TradesMemberDTO {
  id: string;
  userId: string;
  companyId?: string;
  orgId?: string;
  role?: string;
  title?: string;
  isOwner: boolean;
  isActive: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  tradeType?: string;
  bio?: string;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;

  // Computed
  fullName: string;
}

export interface TradesPostDTO {
  id: string;
  companyId?: string;
  authorId: string;
  title: string;
  content?: string;
  images: string[];
  tags: string[];
  postType?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  // Relations (optional)
  company?: TradesCompanyDTO;
}

// =============================================================================
// Adapter Functions
// =============================================================================

type TradesCompanyRow = tradesCompany & {
  members?: tradesCompanyMember[];
  posts?: tradesPost[];
};

/**
 * Convert a raw Prisma tradesCompany row to DTO
 */
export function adaptTradesCompany(row: TradesCompanyRow): TradesCompanyDTO {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    website: row.website ?? undefined,
    description: row.description ?? undefined,
    logo: row.logo ?? undefined,
    coverImage: row.coverimage ?? undefined, // Note: coverimage → coverImage
    address: row.address ?? undefined,
    city: row.city ?? undefined,
    state: row.state ?? undefined,
    zip: row.zip ?? undefined,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    specialties: row.specialties ?? [],
    serviceArea: row.serviceArea ?? [],
    yearsInBusiness: row.yearsInBusiness ?? undefined,
    licenseNumber: row.licenseNumber ?? undefined,
    insuranceVerified: row.insuranceVerified ?? false,
    rating: row.rating ? parseDecimal(row.rating) : undefined,
    reviewCount: row.reviewCount ?? 0,
    isVerified: row.isVerified ?? false,
    isActive: row.isActive ?? true,
    createdAt: row.createdAt ?? undefined,
    updatedAt: row.updatedAt ?? undefined,

    // Computed
    location: row.city && row.state ? `${row.city}, ${row.state}` : undefined,

    // Relations
    members: row.members?.map(adaptTradesMember),
    posts: row.posts?.map((p) => adaptTradesPost(p)),
  };
}

/**
 * Convert a raw Prisma tradesCompanyMember row to DTO
 */
export function adaptTradesMember(row: tradesCompanyMember): TradesMemberDTO {
  return {
    id: row.id,
    userId: row.userId,
    companyId: row.companyId ?? undefined,
    orgId: row.orgId ?? undefined,
    role: row.role ?? undefined,
    title: row.title ?? undefined,
    isOwner: row.isOwner ?? false,
    isActive: row.isActive ?? true,
    firstName: row.firstName ?? undefined,
    lastName: row.lastName ?? undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    jobTitle: row.jobTitle ?? undefined,
    tradeType: row.tradeType ?? undefined,
    bio: row.bio ?? undefined,
    avatar: row.avatar ?? undefined,
    createdAt: row.createdAt ?? undefined,
    updatedAt: row.updatedAt ?? undefined,

    // Computed
    fullName: [row.firstName, row.lastName].filter(Boolean).join(" ") || "Unknown",
  };
}

type TradesPostRow = tradesPost & {
  company?: tradesCompany | null;
};

/**
 * Convert a raw Prisma tradesPost row to DTO
 */
export function adaptTradesPost(row: TradesPostRow): TradesPostDTO {
  return {
    id: row.id,
    companyId: row.companyId ?? undefined,
    authorId: row.authorId,
    title: row.title,
    content: row.content ?? undefined,
    images: row.images ?? [],
    tags: row.tags ?? [],
    postType: row.postType ?? undefined,
    isActive: row.isActive ?? true,
    createdAt: row.createdAt ?? undefined,
    updatedAt: row.updatedAt ?? undefined,

    // Relations
    company: row.company ? adaptTradesCompany(row.company) : undefined,
  };
}

/**
 * Adapt multiple trades companies
 */
export function adaptTradesCompanies(rows: TradesCompanyRow[]): TradesCompanyDTO[] {
  return rows.map(adaptTradesCompany);
}

/**
 * Adapt multiple trades members
 */
export function adaptTradesMembers(rows: tradesCompanyMember[]): TradesMemberDTO[] {
  return rows.map(adaptTradesMember);
}

/**
 * Helper to parse Prisma Decimal to number
 */
function parseDecimal(value: Decimal | null | undefined): number | undefined {
  if (!value) return undefined;
  return parseFloat(value.toString());
}
