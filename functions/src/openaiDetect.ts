import axios from "axios";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import OpenAI from "openai";

const SYSTEM_PROMPT = `
You are a precise damage detector for roof images.
Return ONLY JSON matching this schema (no prose):
{
  "detections": [
    {"label":"hail_hit"|"crease"|"missing_shingle"|"cracked_tile","x":<number>,"y":<number>,"w":<number>,"h":<number>,"score":<0..1>}
  ]
}
Rules:
- Use bounding boxes in original image pixel space.
- "hail_hit": circular impact/spatter marks on shingles/metal.
- "crease": bent shingle tab or linear wind crease.
- "missing_shingle": full tab area visibly missing.
- "cracked_tile": fracture line on tile or broken piece.
- Keep boxes tight; score = your confidence 0..1.
- If nothing found, return {"detections":[]}.
`;

export const detectRoofDamageOpenAI = functions.https.onCall(async (data: any, context: any) => {
  const { userId, imageUrl } = data || {};
  if (!context.auth?.uid || context.auth.uid !== userId) {
    throw new functions.https.HttpsError("permission-denied", "Not authorized");
  }
  if (!imageUrl) throw new functions.https.HttpsError("invalid-argument", "imageUrl required");

  // Initialize OpenAI client inside the function
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  // Get image dimensions so the model can reason in pixel space (helps consistency)
  try {
    await axios.get(imageUrl, { responseType: "arraybuffer" });
    // Lightweight sniff via sharp would be ideal, but to avoid extra deps, parse common headers or skip.
    // OPTIONAL: If you add sharp, you can do:
    // const sharp = (await import('sharp')).default;
    // const meta = await sharp(resp.data).metadata(); width = meta.width||0; height=meta.height||0;
  } catch {
    /* non-fatal */
  }

  const userPrompt = `
Return ONLY JSON. If unsure, detections can be empty.
If you must assume pixel size, still return tight boxes (x,y,w,h).
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ],
    // Ask for JSON back
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "RoofDetections",
        schema: {
          type: "object",
          properties: {
            detections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: {
                    type: "string",
                    enum: ["hail_hit", "crease", "missing_shingle", "cracked_tile"],
                  },
                  x: { type: "number" },
                  y: { type: "number" },
                  w: { type: "number" },
                  h: { type: "number" },
                  score: { type: "number" },
                },
                required: ["label", "x", "y", "w", "h", "score"],
                additionalProperties: false,
              },
            },
          },
          required: ["detections"],
          additionalProperties: false,
        },
      },
    },
  });

  const json = completion.choices[0]?.message?.content
    ? JSON.parse(completion.choices[0].message.content)
    : { detections: [] };
  return {
    detections: Array.isArray(json.detections) ? json.detections : [],
  };
});

// Companion function for annotation workflow integration
export const annotateWithOpenAI = functions.https.onCall(async (data: any, context: any) => {
  const { userId, projectId, imageUrl, photoId } = data || {};
  if (!context.auth?.uid || context.auth.uid !== userId) {
    throw new functions.https.HttpsError("permission-denied", "Not authorized");
  }

  // Initialize OpenAI client inside the function
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  // Call the detection function logic directly
  const detectionImageUrl = imageUrl;
  if (!detectionImageUrl)
    throw new functions.https.HttpsError("invalid-argument", "imageUrl required");

  // Get image dimensions so the model can reason in pixel space (helps consistency)
  try {
    await axios.get(detectionImageUrl, { responseType: "arraybuffer" });
  } catch {
    /* non-fatal */
  }

  const userPrompt = `
Return ONLY JSON. If unsure, detections can be empty.
If you must assume pixel size, still return tight boxes (x,y,w,h).
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          { type: "image_url", image_url: { url: detectionImageUrl } },
        ],
      },
    ],
    // Ask for JSON back
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "RoofDetections",
        schema: {
          type: "object",
          properties: {
            detections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: {
                    type: "string",
                    enum: ["hail_hit", "crease", "missing_shingle", "cracked_tile"],
                  },
                  x: { type: "number" },
                  y: { type: "number" },
                  w: { type: "number" },
                  h: { type: "number" },
                  score: { type: "number" },
                },
                required: ["label", "x", "y", "w", "h", "score"],
                additionalProperties: false,
              },
            },
          },
          required: ["detections"],
          additionalProperties: false,
        },
      },
    },
  });

  const json = completion.choices[0]?.message?.content
    ? JSON.parse(completion.choices[0].message.content)
    : { detections: [] };
  const detections = {
    detections: Array.isArray(json.detections) ? json.detections : [],
  };

  // Store results in evidence collection
  if (projectId && photoId && detections.detections.length > 0) {
    const evidenceRef = admin
      .firestore()
      .collection(`users/${userId}/projects/${projectId}/evidence`)
      .doc(photoId);

    await evidenceRef.update({
      openaiDetections: detections.detections,
      lastDetection: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  return detections;
});
