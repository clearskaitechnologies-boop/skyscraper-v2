/**
 * AI Report Generator - Wrapper for batch processing
 * Uses OpenAI to generate report content
 */

import { getOpenAI } from "@/lib/openai";

/**
 * Generate AI report content from a prompt
 */
export async function generateAIReport(prompt: string): Promise<string> {
  const openai = getOpenAI();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an expert insurance claims report writer. Generate clear, professional, and detailed reports based on the provided information."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 2000
  });

  return completion.choices[0]?.message?.content || "";
}
