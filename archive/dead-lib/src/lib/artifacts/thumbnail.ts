/**
 * Artifact Thumbnail Generation
 * Generates SVG thumbnails for artifacts without PDF thumbnails
 */

import { ArtifactType } from '@prisma/client';

interface ThumbnailOptions {
  title: string;
  type: ArtifactType;
  createdAt: Date;
  version?: number;
}

/**
 * Get color scheme for artifact type
 */
function getTypeColor(type: ArtifactType): { bg: string; text: string; accent: string } {
  const colors: Record<string, { bg: string; text: string; accent: string }> = {
    ROOF_PLAN: { bg: '#1e40af', text: '#ffffff', accent: '#60a5fa' },
    WATER_RESTORATION_REPORT: { bg: '#0891b2', text: '#ffffff', accent: '#22d3ee' },
    SUPPLEMENT_REPORT: { bg: '#7c3aed', text: '#ffffff', accent: '#a78bfa' },
    REBUTTAL_REPORT: { bg: '#dc2626', text: '#ffffff', accent: '#f87171' },
    INSPECTION_REPORT: { bg: '#059669', text: '#ffffff', accent: '#34d399' },
    SCOPE_OF_WORK: { bg: '#ea580c', text: '#ffffff', accent: '#fb923c' },
    CLAIM_REPORT: { bg: '#4f46e5', text: '#ffffff', accent: '#818cf8' },
    GENERAL_REPORT: { bg: '#6b7280', text: '#ffffff', accent: '#9ca3af' },
  };

  return colors[type] || { bg: '#6b7280', text: '#ffffff', accent: '#9ca3af' };
}

/**
 * Format artifact type for display
 */
function formatType(type: ArtifactType): string {
  return type
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Generate SVG thumbnail for artifact
 */
export function generateSvgThumbnail(options: ThumbnailOptions): string {
  const { title, type, createdAt, version = 1 } = options;
  const colors = getTypeColor(type);
  const typeLabel = formatType(type);
  const dateStr = createdAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Truncate title if too long
  const displayTitle = title.length > 40 ? title.substring(0, 37) + '...' : title;

  return `<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="300" height="200" fill="${colors.bg}" rx="8"/>
  
  <!-- Gradient Overlay -->
  <defs>
    <linearGradient id="grad-${type}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.accent};stop-opacity:0.2" />
      <stop offset="100%" style="stop-color:${colors.bg};stop-opacity:0.9" />
    </linearGradient>
  </defs>
  <rect width="300" height="200" fill="url(#grad-${type})" rx="8"/>
  
  <!-- Document Icon -->
  <g transform="translate(20, 20)">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" 
          fill="${colors.text}" opacity="0.3" stroke="${colors.text}" stroke-width="1.5"/>
    <polyline points="14 2 14 8 20 8" 
              fill="none" stroke="${colors.text}" stroke-width="1.5" opacity="0.3"/>
  </g>
  
  <!-- Type Badge -->
  <rect x="20" y="60" width="${Math.min(typeLabel.length * 8 + 20, 260)}" height="24" 
        fill="${colors.accent}" rx="4" opacity="0.9"/>
  <text x="30" y="77" font-family="Arial, sans-serif" font-size="12" 
        font-weight="600" fill="${colors.bg}">${typeLabel}</text>
  
  <!-- Title -->
  <text x="20" y="105" font-family="Arial, sans-serif" font-size="16" 
        font-weight="700" fill="${colors.text}">${displayTitle}</text>
  
  <!-- Date -->
  <text x="20" y="130" font-family="Arial, sans-serif" font-size="11" 
        fill="${colors.text}" opacity="0.8">${dateStr}</text>
  
  <!-- Version Badge -->
  ${version > 1 ? `
  <rect x="20" y="145" width="50" height="20" fill="${colors.accent}" rx="10" opacity="0.9"/>
  <text x="45" y="159" font-family="Arial, sans-serif" font-size="10" 
        font-weight="600" fill="${colors.bg}" text-anchor="middle">v${version}</text>
  ` : ''}
  
  <!-- Bottom Accent Line -->
  <line x1="20" y1="185" x2="280" y2="185" stroke="${colors.accent}" 
        stroke-width="3" opacity="0.6"/>
</svg>`;
}

/**
 * Generate thumbnail for artifact on creation
 */
export function generateThumbnailForArtifact(artifact: {
  title: string;
  type: ArtifactType;
  createdAt: Date;
  version?: number;
  thumbnailUrl?: string | null;
  pdfUrl?: string | null;
}): string | null {
  // If already has thumbnailUrl or pdfUrl, no need for SVG fallback
  if (artifact.thumbnailUrl || artifact.pdfUrl) {
    return null;
  }

  // Generate SVG thumbnail
  return generateSvgThumbnail({
    title: artifact.title,
    type: artifact.type,
    createdAt: artifact.createdAt,
    version: artifact.version || 1,
  });
}
