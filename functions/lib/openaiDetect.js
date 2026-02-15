"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.annotateWithOpenAI = exports.detectRoofDamageOpenAI = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const openai_1 = __importDefault(require("openai"));
const axios_1 = __importDefault(require("axios"));
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
exports.detectRoofDamageOpenAI = functions.https.onCall(async (data, context) => {
  const { userId, imageUrl } = data || {};
  if (!context.auth?.uid || context.auth.uid !== userId) {
    throw new functions.https.HttpsError("permission-denied", "Not authorized");
  }
  if (!imageUrl) throw new functions.https.HttpsError("invalid-argument", "imageUrl required");
  // Initialize OpenAI client inside the function
  const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
  // Get image dimensions so the model can reason in pixel space (helps consistency)
  try {
    await axios_1.default.get(imageUrl, { responseType: "arraybuffer" });
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
exports.annotateWithOpenAI = functions.https.onCall(async (data, context) => {
  const { userId, projectId, imageUrl, photoId } = data || {};
  if (!context.auth?.uid || context.auth.uid !== userId) {
    throw new functions.https.HttpsError("permission-denied", "Not authorized");
  }
  // Initialize OpenAI client inside the function
  const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
  // Call the detection function logic directly
  const detectionImageUrl = imageUrl;
  if (!detectionImageUrl)
    throw new functions.https.HttpsError("invalid-argument", "imageUrl required");
  // Get image dimensions so the model can reason in pixel space (helps consistency)
  try {
    await axios_1.default.get(detectionImageUrl, { responseType: "arraybuffer" });
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
