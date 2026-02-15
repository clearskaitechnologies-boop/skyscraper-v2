import { z } from "zod";

import { validateAndRetry } from "../validateAndRetry";

// Mock OpenAI
jest.mock("../callOpenAI", () => ({
  callOpenAI: jest.fn(),
}));

import { callOpenAI } from "../callOpenAI";
const mockCallOpenAI = callOpenAI as jest.MockedFunction<typeof callOpenAI>;

describe("validateAndRetry", () => {
  const testSchema = z.object({
    title: z.string(),
    count: z.number(),
  });

  const fallbackContent = {
    title: "Fallback Title",
    count: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return valid content on first try", async () => {
    const validResponse = JSON.stringify({ title: "Success", count: 42 });
    mockCallOpenAI.mockResolvedValueOnce(validResponse);

    const result = await validateAndRetry({
      prompt: "Test prompt",
      schema: testSchema,
      fallbackContent,
    });

    expect(result).toEqual({ title: "Success", count: 42 });
    expect(mockCallOpenAI).toHaveBeenCalledTimes(1);
  });

  it("should retry on invalid JSON", async () => {
    mockCallOpenAI
      .mockResolvedValueOnce("invalid json")
      .mockResolvedValueOnce(JSON.stringify({ title: "Retry Success", count: 10 }));

    const result = await validateAndRetry({
      prompt: "Test prompt",
      schema: testSchema,
      fallbackContent,
    });

    expect(result).toEqual({ title: "Retry Success", count: 10 });
    expect(mockCallOpenAI).toHaveBeenCalledTimes(2);
  });

  it("should retry on schema validation failure", async () => {
    mockCallOpenAI
      .mockResolvedValueOnce(JSON.stringify({ title: "Bad", count: "not a number" }))
      .mockResolvedValueOnce(JSON.stringify({ title: "Fixed", count: 5 }));

    const result = await validateAndRetry({
      prompt: "Test prompt",
      schema: testSchema,
      fallbackContent,
    });

    expect(result).toEqual({ title: "Fixed", count: 5 });
    expect(mockCallOpenAI).toHaveBeenCalledTimes(2);
  });

  it("should return fallback after max retries", async () => {
    mockCallOpenAI.mockResolvedValue("always invalid");

    const result = await validateAndRetry({
      prompt: "Test prompt",
      schema: testSchema,
      fallbackContent,
      maxRetries: 3,
    });

    expect(result).toEqual(fallbackContent);
    expect(mockCallOpenAI).toHaveBeenCalledTimes(3);
  });

  it("should handle API errors gracefully", async () => {
    mockCallOpenAI.mockRejectedValue(new Error("API Error"));

    const result = await validateAndRetry({
      prompt: "Test prompt",
      schema: testSchema,
      fallbackContent,
      maxRetries: 1,
    });

    expect(result).toEqual(fallbackContent);
    expect(mockCallOpenAI).toHaveBeenCalledTimes(1);
  });
});
