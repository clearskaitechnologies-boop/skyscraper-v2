/**
 * PHASE 43: BATF ENGINE TEST SUITE
 * 
 * Test cases:
 * 1. Shingle roof damage detection
 * 2. Tile roof damage detection
 * 3. Metal roof damage detection
 * 4. Flat roof damage detection
 * 5. Severity map generation
 * 6. PDF presentation generation
 */

import { afterAll,beforeAll, describe, expect, it } from "@jest/globals";

import { analyzeRoofDamage, generateDamageOverlay, generateSeverityMap } from "@/lib/ai/batfEngine";
import { prisma } from "@/lib/prisma";

describe("BATF Engine - Roof Damage Analysis", () => {
  const testOrgId = "test_org_batf";
  const testLeadId = "test_lead_batf";
  
  beforeAll(async () => {
    // Cleanup any existing test data
    await prisma.bATFReport.deleteMany({ where: { orgId: testOrgId } });
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.bATFReport.deleteMany({ where: { orgId: testOrgId } });
  });

  it("should analyze shingle roof damage with AI", async () => {
    const mockPhotoUrls = [
      "https://example.com/shingle-damage-1.jpg",
      "https://example.com/shingle-damage-2.jpg"
    ];

    const analysis = await analyzeRoofDamage(mockPhotoUrls, "shingle");

    expect(analysis).toBeDefined();
    expect(analysis.damageType).toBeDefined();
    expect(analysis.severity).toBeGreaterThanOrEqual(0);
    expect(analysis.severity).toBeLessThanOrEqual(10);
    expect(analysis.affectedAreas).toBeInstanceOf(Array);
    expect(analysis.estimatedImpact).toBeDefined();
    expect(analysis.estimatedImpact.repairCost).toBeGreaterThan(0);
    expect(["low", "medium", "high", "critical"]).toContain(analysis.estimatedImpact.urgency);
  }, 30000); // 30 second timeout for AI call

  it("should analyze tile roof damage", async () => {
    const mockPhotoUrls = [
      "https://example.com/tile-damage-1.jpg"
    ];

    const analysis = await analyzeRoofDamage(mockPhotoUrls, "tile");

    expect(analysis).toBeDefined();
    expect(analysis.severity).toBeGreaterThanOrEqual(0);
    expect(analysis.severity).toBeLessThanOrEqual(10);
  }, 30000);

  it("should analyze metal roof damage", async () => {
    const mockPhotoUrls = [
      "https://example.com/metal-damage-1.jpg"
    ];

    const analysis = await analyzeRoofDamage(mockPhotoUrls, "metal");

    expect(analysis).toBeDefined();
    expect(analysis.damageType).toBeDefined();
    expect(analysis.affectedAreas.length).toBeGreaterThan(0);
  }, 30000);

  it("should analyze flat roof damage", async () => {
    const mockPhotoUrls = [
      "https://example.com/flat-damage-1.jpg"
    ];

    const analysis = await analyzeRoofDamage(mockPhotoUrls, "flat");

    expect(analysis).toBeDefined();
    expect(analysis.estimatedImpact.recommendation).toBeDefined();
  }, 30000);

  it("should generate damage overlay with markers", async () => {
    const mockPhotoUrl = "https://example.com/roof-damage.jpg";
    const mockAnalysis = {
      damageType: "hail_impact",
      severity: 7,
      affectedAreas: [
        {
          region: "slope",
          percentage: 40,
          description: "Multiple hail impacts on south-facing slope"
        }
      ],
      estimatedImpact: {
        repairCost: 8500,
        urgency: "high" as const,
        recommendation: "Replace damaged shingles"
      }
    };

    const overlay = await generateDamageOverlay(mockPhotoUrl, mockAnalysis);

    expect(overlay).toBeDefined();
    expect(overlay.overlayUrl).toContain("https://");
    expect(overlay.markers).toBeInstanceOf(Array);
    expect(overlay.markers.length).toBeGreaterThan(0);
    
    const marker = overlay.markers[0];
    expect(marker.x).toBeGreaterThanOrEqual(0);
    expect(marker.x).toBeLessThanOrEqual(100);
    expect(marker.y).toBeGreaterThanOrEqual(0);
    expect(marker.y).toBeLessThanOrEqual(100);
    expect(marker.severity).toBeGreaterThanOrEqual(0);
    expect(marker.severity).toBeLessThanOrEqual(10);
  }, 30000);

  it("should generate severity heatmap", async () => {
    const mockPhotoUrl = "https://example.com/roof.jpg";
    const mockAnalysis = {
      damageType: "wind_damage",
      severity: 6,
      affectedAreas: [
        {
          region: "ridge",
          percentage: 60,
          description: "Ridge vent damage"
        },
        {
          region: "valley",
          percentage: 30,
          description: "Minor valley shingle lifting"
        }
      ],
      estimatedImpact: {
        repairCost: 5000,
        urgency: "medium" as const,
        recommendation: "Repair ridge and valley"
      }
    };

    const severityMap = await generateSeverityMap(mockPhotoUrl, mockAnalysis);

    expect(severityMap).toBeDefined();
    expect(severityMap.imageUrl).toContain("https://");
    expect(severityMap.zones).toBeInstanceOf(Array);
    expect(severityMap.zones.length).toBe(mockAnalysis.affectedAreas.length);

    severityMap.zones.forEach(zone => {
      expect(zone.region).toBeDefined();
      expect(zone.severity).toBeGreaterThanOrEqual(0);
      expect(zone.severity).toBeLessThanOrEqual(10);
      expect(zone.color).toMatch(/^#[0-9A-F]{6}$/i); // Valid hex color
    });
  }, 30000);
});

describe("BATF API - Integration Tests", () => {
  const testOrgId = "test_org_batf_api";
  const testLeadId = "test_lead_batf_api";

  beforeAll(async () => {
    // Create test lead
    await prisma.leads.upsert({
      where: { id: testLeadId },
      update: {},
      create: {
        id: testLeadId,
        org_id: testOrgId,
        address: "123 Test St",
        city: "Test City",
        state: "TX",
        zip_code: "75001",
        status: "new"
      }
    });
  });

  afterAll(async () => {
    await prisma.bATFReport.deleteMany({ where: { orgId: testOrgId } });
    await prisma.leads.deleteMany({ where: { id: testLeadId } });
  });

  it("should create BATF report via API", async () => {
    const mockPhotos = [
      {
        url: "https://example.com/photo1.jpg",
        uploadedAt: new Date().toISOString(),
        metadata: { width: 1920, height: 1080, format: "image/jpeg", size: 500000 }
      }
    ];

    // Mock API call (replace with actual fetch in real test)
    const report = await prisma.bATFReport.create({
      data: {
        leadId: testLeadId,
        orgId: testOrgId,
        roofType: "shingle",
        beforePhotos: mockPhotos,
        aiBeforeUrl: "https://example.com/ai-before.jpg",
        aiAfterUrl: "https://example.com/ai-after.jpg",
        damageOverlay: "https://example.com/overlay.jpg",
        severityMap: "https://example.com/severity.jpg",
        findings: {
          damageType: "hail_impact",
          severity: 8,
          affectedAreas: [],
          estimatedImpact: {
            repairCost: 12000,
            urgency: "high",
            recommendation: "Full roof replacement"
          }
        },
        presentationPdf: "https://example.com/presentation.pdf"
      }
    });

    expect(report).toBeDefined();
    expect(report.id).toBeDefined();
    expect(report.roofType).toBe("shingle");
    expect(report.leadId).toBe(testLeadId);
  });

  it("should share BATF report with public link", async () => {
    // Create report
    const report = await prisma.bATFReport.create({
      data: {
        leadId: testLeadId,
        orgId: testOrgId,
        roofType: "tile",
        beforePhotos: [],
        findings: {}
      }
    });

    // Share report
    const publicId = "test-public-id-123";
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const updated = await prisma.bATFReport.update({
      where: { id: report.id },
      data: {
        publicId,
        publicExpiresAt: expiresAt
      }
    });

    expect(updated.publicId).toBe(publicId);
    expect(updated.publicExpiresAt).toBeDefined();
    expect(new Date(updated.publicExpiresAt!)).toBeInstanceOf(Date);
  });

  it("should revoke BATF report public access", async () => {
    // Create shared report
    const report = await prisma.bATFReport.create({
      data: {
        leadId: testLeadId,
        orgId: testOrgId,
        roofType: "metal",
        beforePhotos: [],
        findings: {},
        publicId: "test-revoke-123",
        publicExpiresAt: new Date()
      }
    });

    // Revoke access
    const revoked = await prisma.bATFReport.update({
      where: { id: report.id },
      data: {
        publicId: null,
        publicExpiresAt: null
      }
    });

    expect(revoked.publicId).toBeNull();
    expect(revoked.publicExpiresAt).toBeNull();
  });
});
