/**
 * Tests for Material Estimator and ABC Supply Routing Engine
 */

import { describe, expect, it, vi } from "vitest";

// Mock server-only
vi.mock("server-only", () => ({}));

import {
  calculateMaterials,
  createOrderDraft,
  estimateFromClaimData,
  type RoofMeasurements,
  type ShingleSpec,
} from "@/lib/materials/estimator";

describe("Material Estimator", () => {
  const standardMeasurements: RoofMeasurements = {
    totalArea: 2000, // 20 squares
    pitch: "6/12",
    ridgeLength: 40,
    hipLength: 0,
    valleyLength: 0,
    eaveLength: 120,
    rakeLength: 80,
    complexity: "MEDIUM",
  };

  const architecturalSpec: ShingleSpec = {
    type: "ARCHITECTURAL",
    manufacturer: "GAF",
    color: "Charcoal",
    productLine: "Timberline HDZ",
  };

  describe("calculateMaterials", () => {
    it("calculates shingle bundles correctly for medium complexity roof", () => {
      const estimate = calculateMaterials(standardMeasurements, architecturalSpec);

      // 2000 sq ft × 1.118 (6/12 pitch) × 1.15 (medium waste) = 2571 sq ft adjusted
      // 2571 / 33.3 = ~77 bundles
      const shingleLine = estimate.materials.find((m) => m.category === "Shingles");
      expect(shingleLine).toBeDefined();
      expect(shingleLine!.quantity).toBeGreaterThanOrEqual(70);
      expect(shingleLine!.quantity).toBeLessThanOrEqual(85);
    });

    it("includes all required material categories", () => {
      const estimate = calculateMaterials(standardMeasurements, architecturalSpec);

      const categories = estimate.materials.map((m) => m.category);
      expect(categories).toContain("Shingles");
      expect(categories).toContain("Underlayment");
      expect(categories).toContain("Ice & Water Shield");
      expect(categories).toContain("Starter Strip");
      expect(categories).toContain("Ridge Cap");
      expect(categories).toContain("Drip Edge");
      expect(categories).toContain("Fasteners");
      expect(categories).toContain("Pipe Boots");
    });

    it("includes valley flashing only when valleys exist", () => {
      const noValley = calculateMaterials(standardMeasurements, architecturalSpec);
      expect(noValley.materials.find((m) => m.category === "Valley Flashing")).toBeUndefined();

      const withValley = calculateMaterials(
        { ...standardMeasurements, valleyLength: 30 },
        architecturalSpec
      );
      expect(withValley.materials.find((m) => m.category === "Valley Flashing")).toBeDefined();
    });

    it("calculates correct waste factor", () => {
      const low = calculateMaterials(
        { ...standardMeasurements, complexity: "LOW" },
        architecturalSpec
      );
      expect(low.wasteFactor).toBe(1.1);

      const high = calculateMaterials(
        { ...standardMeasurements, complexity: "HIGH" },
        architecturalSpec
      );
      expect(high.wasteFactor).toBe(1.2);

      const veryHigh = calculateMaterials(
        { ...standardMeasurements, complexity: "VERY_HIGH" },
        architecturalSpec
      );
      expect(veryHigh.wasteFactor).toBe(1.25);
    });

    it("adjusts for steeper pitch", () => {
      const standard = calculateMaterials(standardMeasurements, architecturalSpec);
      const steep = calculateMaterials(
        { ...standardMeasurements, pitch: "12/12" },
        architecturalSpec
      );

      // 12/12 pitch = 1.414x multiplier vs 6/12 = 1.118x
      // Steep roof should need more materials
      expect(steep.totalCost).toBeGreaterThan(standard.totalCost);
    });

    it("calculates total cost correctly", () => {
      const estimate = calculateMaterials(standardMeasurements, architecturalSpec);

      const manualTotal = estimate.materials.reduce((sum, m) => sum + m.totalPrice, 0);
      expect(estimate.totalCost).toBe(manualTotal);
      expect(estimate.totalCost).toBeGreaterThan(0);
    });

    it("generates unique estimate ID", () => {
      const est1 = calculateMaterials(standardMeasurements, architecturalSpec);
      const est2 = calculateMaterials(standardMeasurements, architecturalSpec);

      expect(est1.id).not.toBe(est2.id);
      expect(est1.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });
  });

  describe("estimateFromClaimData", () => {
    it("creates estimate with minimal claim data", () => {
      const estimate = estimateFromClaimData({});

      expect(estimate.measurements.totalArea).toBe(2000); // default
      expect(estimate.measurements.pitch).toBe("6/12"); // default
      expect(estimate.shingleSpec.type).toBe("ARCHITECTURAL"); // default
      expect(estimate.materials.length).toBeGreaterThan(5);
    });

    it("uses provided claim data", () => {
      const estimate = estimateFromClaimData({
        totalArea: 3000,
        pitch: "8/12",
        shingleType: "PREMIUM",
        shingleColor: "Barkwood",
      });

      expect(estimate.measurements.totalArea).toBe(3000);
      expect(estimate.measurements.pitch).toBe("8/12");
      expect(estimate.shingleSpec.type).toBe("PREMIUM");
      expect(estimate.shingleSpec.color).toBe("Barkwood");
    });

    it("infers complexity from measurements", () => {
      // No hips/valleys = LOW
      const simple = estimateFromClaimData({ totalArea: 1500 });
      expect(simple.measurements.complexity).toBe("LOW");

      // Hip and valley = HIGH
      const complex = estimateFromClaimData({
        totalArea: 2500,
        hipLength: 20,
        valleyLength: 15,
      });
      expect(complex.measurements.complexity).toBe("HIGH");
    });
  });

  describe("createOrderDraft", () => {
    it("returns null when branch is missing", () => {
      const draft = createOrderDraft(
        {
          estimate: calculateMaterials(standardMeasurements, architecturalSpec),
          branch: null,
          inventory: [],
          orderReady: false,
          unavailableItems: ["No branch found"],
        },
        "pickup"
      );

      expect(draft).toBeNull();
    });

    it("returns null when order not ready", () => {
      const draft = createOrderDraft(
        {
          estimate: calculateMaterials(standardMeasurements, architecturalSpec),
          branch: {
            id: "branch-1",
            name: "ABC Supply - Phoenix",
            address: "123 Main St",
            city: "Phoenix",
            state: "AZ",
            zip: "85001",
            phone: "602-555-1234",
            latitude: 33.4484,
            longitude: -112.074,
            isOpen: true,
            deliveryAvailable: true,
          },
          inventory: [],
          orderReady: false,
          unavailableItems: ["Shingles out of stock"],
        },
        "delivery"
      );

      expect(draft).toBeNull();
    });

    it("calculates tax correctly", () => {
      const estimate = calculateMaterials(standardMeasurements, architecturalSpec);
      // Add SKUs to materials for draft creation
      estimate.materials.forEach((m, i) => {
        m.sku = `SKU-${i}`;
      });

      const draft = createOrderDraft(
        {
          estimate,
          branch: {
            id: "branch-1",
            name: "ABC Supply - Phoenix",
            address: "123 Main St",
            city: "Phoenix",
            state: "AZ",
            zip: "85001",
            phone: "602-555-1234",
            latitude: 33.4484,
            longitude: -112.074,
            isOpen: true,
            deliveryAvailable: true,
          },
          inventory: [],
          orderReady: true,
          unavailableItems: [],
        },
        "pickup"
      );

      expect(draft).not.toBeNull();
      expect(draft!.estimatedTax).toBeCloseTo(draft!.subtotal * 0.0825, 2);
      expect(draft!.total).toBeCloseTo(draft!.subtotal + draft!.estimatedTax, 2);
    });
  });
});
