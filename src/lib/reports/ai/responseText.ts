type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function extractFirstOutputText(res: unknown): string {
  if (!isRecord(res) || !isArray(res.output)) {
    throw new Error("OpenAI response missing output");
  }

  const message = res.output.find((item) => {
    if (!isRecord(item)) return false;
    return item.type === "message";
  });

  if (!message || !isRecord(message) || !isArray(message.content)) {
    throw new Error("OpenAI response missing message content");
  }

  const firstText = message.content.find((c) => {
    if (!isRecord(c)) return false;
    return typeof c.text === "string";
  });

  if (!firstText || !isRecord(firstText) || typeof firstText.text !== "string") {
    throw new Error("OpenAI response missing text content");
  }

  return firstText.text;
}
