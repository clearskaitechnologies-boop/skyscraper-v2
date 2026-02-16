import { getOpenAI } from "@/lib/ai/client";

interface SupplementArgs {
  scope: string;
  photos?: string[];
  letter?: string;
}

export async function buildSupplement({ scope, photos, letter }: SupplementArgs) {
  const client = getOpenAI();
  const prompt = `You are an expert insurance supplement specialist. Generate a structured supplement list with reasoning.\nScope:\n${scope}\n\nInsurance Letter:\n${letter || "None"}\nPhotos:${photos && photos.length ? " Provided" : " None"}`;
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });
  return res.choices[0].message.content?.trim() || "No draft produced.";
}
