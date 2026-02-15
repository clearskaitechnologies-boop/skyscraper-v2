import { buildAIContentFromTemplate } from "../buildAIContentFromTemplate";
import { validateAndRetry } from "../validateAndRetry";

jest.mock("../validateAndRetry");
const mockValidateAndRetry = validateAndRetry as jest.MockedFunction<typeof validateAndRetry>;

describe("buildAIContentFromTemplate", () => {
  const mockTemplate = {
    id: "test-template",
    name: "Test Template",
    report_sections: [
      {
        id: "section-1",
        section_type: "EXECUTIVE_SUMMARY" as const,
        order_index: 0,
        is_required: true,
        custom_instructions: null,
      },
      {
        id: "section-2",
        section_type: "DAMAGE_TIMELINE" as const,
        order_index: 1,
        is_required: false,
        custom_instructions: "Include weather impact",
      },
    ],
  };

  const mockClaimData = {
    id: "claim-123",
    claim_number: "CL-2024-001",
    property_address: "123 Main St",
    claim_events: [{ event_type: "STORM", event_date: new Date("2024-01-15") }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should generate AI content for all sections", async () => {
    mockValidateAndRetry
      .mockResolvedValueOnce({ summary: "Executive summary content", key_findings: [] })
      .mockResolvedValueOnce({ events: [], weather_correlation: "Strong" });

    const result = await buildAIContentFromTemplate(mockTemplate, mockClaimData);

    expect(result).toHaveLength(2);
    expect(result[0].section_type).toBe("EXECUTIVE_SUMMARY");
    expect(result[1].section_type).toBe("DAMAGE_TIMELINE");
    expect(mockValidateAndRetry).toHaveBeenCalledTimes(2);
  });

  it("should include custom instructions in prompts", async () => {
    mockValidateAndRetry.mockResolvedValue({ events: [] });

    await buildAIContentFromTemplate(mockTemplate, mockClaimData);

    expect(mockValidateAndRetry).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining("Include weather impact"),
      })
    );
  });

  it("should handle empty template sections", async () => {
    const emptyTemplate = { ...mockTemplate, report_sections: [] };

    const result = await buildAIContentFromTemplate(emptyTemplate, mockClaimData);

    expect(result).toHaveLength(0);
    expect(mockValidateAndRetry).not.toHaveBeenCalled();
  });
});
