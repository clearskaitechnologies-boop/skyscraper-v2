import OpenAI from "openai";

// Lazy initialization to avoid build-time errors
let client: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    client = new OpenAI({ apiKey });
  }
  return client;
}

// Example: create structured report text
export async function makePdfContent(prompt: string) {
  const client = getOpenAIClient();
  const r = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an expert insurance/roofing report writer. Output crisp, factual sections.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
  });
  return r.choices[0]?.message?.content ?? "No content";
}

// Example: create mockup idea brief
export async function makeMockupBrief(context: string) {
  const client = getOpenAIClient();
  const r = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You draft design briefs that can be rendered by downstream tools.",
      },
      {
        role: "user",
        content: `Create a concise mockup brief for: ${context}`,
      },
    ],
    temperature: 0.4,
  });
  return r.choices[0]?.message?.content ?? "No brief";
}
