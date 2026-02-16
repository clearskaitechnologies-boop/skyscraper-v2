/**
 * OpenAI Integration
 * Centralized API client for GPT-4
 */

export interface CallOpenAIOptions {
  system: string;
  user: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function callOpenAI({
  system,
  user,
  model = "gpt-4-turbo-preview",
  temperature = 0.7,
  maxTokens = 2000,
}: CallOpenAIOptions): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature,
      max_tokens: maxTokens,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    return content;
  } catch (error) {
    console.error("OpenAI API error:", error);

    // Capture to Sentry (no prompts/completions)
    if (typeof window === "undefined") {
      const Sentry = await import("@sentry/nextjs");
      Sentry.captureException(error, {
        tags: { subsystem: "ai", operation: "openai_call" },
        extra: {
          model,
          // Never log prompts or completions
        },
      });
    }

    throw error;
  }
}

export interface CallOpenAIJSONOptions extends CallOpenAIOptions {
  schema?: any;
}

export async function callOpenAIJSON<T = any>({
  system,
  user,
  model = "gpt-4-turbo-preview",
  temperature = 0.7,
  maxTokens = 2000,
}: CallOpenAIJSONOptions): Promise<T> {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("OpenAI JSON API error:", error);
    throw error;
  }
}

export async function callOpenAIStreaming(options: CallOpenAIOptions): Promise<ReadableStream> {
  const stream = (await openai.chat.completions.create({
    ...options,
    stream: true,
  } as any)) as any;

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream as any) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          controller.enqueue(new TextEncoder().encode(content));
        }
      }
      controller.close();
    },
  });
}
