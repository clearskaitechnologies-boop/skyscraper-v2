import { supabase } from "@/integrations/supabase/client";

export async function aiCaptionPhoto(photoId: string) {
  const { data, error } = await supabase.functions.invoke("ai-caption", {
    body: { photoId },
  });

  if (error) throw error;
  if (!data?.ok) throw new Error(data?.error || "AI caption failed");

  return data as { ok: true; caption: string; confidence: number };
}
