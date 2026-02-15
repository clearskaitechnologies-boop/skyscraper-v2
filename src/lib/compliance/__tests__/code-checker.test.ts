/**
 * Compliance Engine Tests
 *
 * Verifies all 50 states + DC coverage and code requirements
 */

import { describe, expect, it } from "vitest";

import { checkBuildingCodes, getLocalCodes, getStateInfo, getStateList } from "../code-checker";

describe("Compliance Engine - State Coverage", () => {
  it("should have all 50 states + DC", () => {
    const states = getStateList();
    expect(states.length).toBe(51); // 50 states + DC

    // Verify specific states exist
    const requiredStates = [
      "AL",
      "AK",
      "AZ",
      "AR",
      "CA",
      "CO",
      "CT",
      "DE",
      "DC",
      "FL",
      "GA",
      "HI",
      "ID",
      "IL",
      "IN",
      "IA",
      "KS",
      "KY",
      "LA",
      "ME",
      "MD",
      "MA",
      "MI",
      "MN",
      "MS",
      "MO",
      "MT",
      "NE",
      "NV",
      "NH",
      "NJ",
      "NM",
      "NY",
      "NC",
      "ND",
      "OH",
      "OK",
      "OR",
      "PA",
      "RI",
      "SC",
      "SD",
      "TN",
      "TX",
      "UT",
      "VT",
      "VA",
      "WA",
      "WV",
      "WI",
      "WY",
    ];

    for (const state of requiredStates) {
      expect(states).toContain(state);
    }
  });

  it("should return state info for each state", () => {
    const states = getStateList();
    for (const state of states) {
      const info = getStateInfo(state);
      expect(info).not.toBeNull();
      expect(info?.edition).toBeDefined();
    }
  });
});

describe("Compliance Engine - Florida (Hurricane Zone)", () => {
  it("should identify Florida as hurricane zone", async () => {
    const result = await checkBuildingCodes("FL", undefined, "roof_hail");

    expect(result.codeEdition).toContain("FBC");
    expect(result.recommendations.some((r) => r.includes("HURRICANE"))).toBe(true);
    expect(result.recommendations.some((r) => r.includes("NOA") || r.includes("FBC"))).toBe(true);
  });

  it("should return FBC edition for Florida", () => {
    const info = getStateInfo("FL");
    expect(info?.edition).toContain("FBC");
    expect(info?.windZone).toBe("hurricane");
  });
});

describe("Compliance Engine - Minnesota (Ice Barrier)", () => {
  it("should require ice barrier for Minnesota", async () => {
    const result = await checkBuildingCodes("MN", undefined, "roof_hail");

    expect(result.recommendations.some((r) => r.includes("ICE BARRIER"))).toBe(true);
  });

  it("should have ice barrier flag set", () => {
    const info = getStateInfo("MN");
    expect(info?.iceBarrier).toBe(true);
    expect(info?.snowLoad).toBe(true);
  });
});

describe("Compliance Engine - California (Fire + Seismic)", () => {
  it("should include fire zone requirements", async () => {
    const result = await checkBuildingCodes("CA", undefined, "roof_hail");

    expect(result.codeEdition).toContain("CBC");
    expect(
      result.recommendations.some((r) => r.includes("WILDFIRE") || r.includes("CAL FIRE"))
    ).toBe(true);
  });

  it("should have seismic and fire flags", () => {
    const info = getStateInfo("CA");
    expect(info?.seismicZone).toBe("D");
    expect(info?.fireZone).toBe(true);
  });
});

describe("Compliance Engine - Texas (High Wind)", () => {
  it("should include TWIA requirements for Texas", async () => {
    const result = await checkBuildingCodes("TX", undefined, "roof_wind");

    expect(result.recommendations.some((r) => r.includes("TWIA") || r.includes("Windstorm"))).toBe(
      true
    );
  });

  it("should have high wind zone", () => {
    const info = getStateInfo("TX");
    expect(info?.windZone).toBe("high");
  });
});

describe("Compliance Engine - Trade-Specific Codes", () => {
  it("should return roofing codes for roofing trade", async () => {
    const codes = await getLocalCodes("AZ", undefined, "roofing");

    expect(codes.codes.some((c) => c.code.includes("R905"))).toBe(true);
    expect(codes.codes.some((c) => c.requirement.includes("Underlayment"))).toBe(true);
  });

  it("should return siding codes for siding trade", async () => {
    const codes = await getLocalCodes("AZ", undefined, "siding");

    expect(codes.codes.some((c) => c.code.includes("R703"))).toBe(true);
    expect(codes.codes.some((c) => c.requirement.includes("Weather"))).toBe(true);
  });

  it("should return window codes for windows trade", async () => {
    const codes = await getLocalCodes("AZ", undefined, "windows");

    expect(
      codes.codes.some(
        (c) => c.requirement.includes("flashing") || c.requirement.includes("egress")
      )
    ).toBe(true);
  });
});

describe("Compliance Engine - Deterministic Output", () => {
  it("should return consistent results for same input", async () => {
    const result1 = await checkBuildingCodes("FL", "Miami-Dade", "roof_hail", "roofing");
    const result2 = await checkBuildingCodes("FL", "Miami-Dade", "roof_hail", "roofing");

    expect(result1.codeEdition).toBe(result2.codeEdition);
    expect(result1.recommendations.length).toBe(result2.recommendations.length);
    expect(result1.compliant).toBe(result2.compliant);
  });
});

describe("Compliance Engine - Edge Cases", () => {
  it("should handle unknown state gracefully", async () => {
    const result = await checkBuildingCodes("XX", undefined, "roof_hail");

    expect(result.codeEdition).toBe("IRC 2021"); // Default fallback
    expect(result.compliant).toBe(true);
  });

  it("should handle empty damage type", async () => {
    const result = await checkBuildingCodes("AZ", undefined, "");

    expect(result.recommendations.length).toBeGreaterThan(0);
  });
});
