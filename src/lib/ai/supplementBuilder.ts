import OpenAI from "openai";
const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

interface SupplementArgs {
  scope: string;
  photos?: string[];
  letter?: string;
}

export async function buildSupplement({ scope, photos, letter }: SupplementArgs) {
  if (!client) return "AI unavailable";
  const prompt = `You are an expert insurance supplement specialist. Generate a structured supplement list with reasoning.\nScope:\n${scope}\n\nInsurance Letter:\n${letter || "None"}\nPhotos:${photos && photos.length ? " Provided" : " None"}`;
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });
  return res.choices[0].message.content?.trim() || "No draft produced.";
}
