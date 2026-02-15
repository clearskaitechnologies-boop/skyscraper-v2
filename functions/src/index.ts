import "dotenv/config";

import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { buildPacketByLayout } from "./builders";

admin.initializeApp();

export const buildPacket = functions.https.onCall(async (data, context) => {
  const { userId, layoutKey, payload } = data;
  if (!context.auth?.uid || context.auth.uid !== userId) {
    throw new functions.https.HttpsError("permission-denied", "Not authorized");
  }

  // fetch branding
  const brandingSnap = await admin.firestore().doc(`users/${userId}/branding/branding`).get();
  const branding = brandingSnap.data() || {};

  // fetch preset sequence from Firestore
  const presetSnap = await admin
    .firestore()
    .doc(`users/${userId}/layoutPresets/${layoutKey}`)
    .get();
  if (!presetSnap.exists) {
    throw new functions.https.HttpsError("not-found", `Layout preset '${layoutKey}' not found`);
  }
  const layout: string[] = presetSnap.data()?.sequence || [];

  const url = await buildPacketByLayout(userId, layout as any, { ...payload, layoutKey }, branding);
  return { url };
});

export const seedLayoutPresets = functions.https.onCall(async (data, context) => {
  const { userId } = data;
  if (!context.auth?.uid || context.auth.uid !== userId)
    throw new functions.https.HttpsError("permission-denied", "");

  const db = admin.firestore();
  const ref = db.collection("users").doc(userId).collection("layoutPresets");

  await ref.doc("insuranceClaim").set({
    sequence: [
      "coverPage",
      "overviewPage",
      "inspectionSummary",
      "damageReport",
      "weatherReport",
      "codeCompliance",
      "recommendations",
      "timeline",
      "mockupPage",
      "agreement",
    ],
    label: "Insurance Claim Packet",
  });

  await ref.doc("retailProject").set({
    sequence: [
      "coverPage",
      "overviewPage",
      "materialSpecs",
      "brochures",
      "estimate",
      "timeline",
      "mockupPage",
      "financeAgreement",
    ],
    label: "Retail Project Packet",
  });

  return { ok: true };
});

// Export new feature functions
export { annotateDamage, generateDamageSummary,getAnnotationHistory } from "./annotate";
export { annotateWithOpenAI,detectRoofDamageOpenAI } from "./openaiDetect";
export { nightlyVendorSync, triggerVendorSync } from "./scheduler";
export { seedSampleVendors,syncVendorCatalog } from "./vendorSync";
export { getQuickDOL, getWeatherAnalysis, getWeatherHistory,getWeatherReport } from "./weather";
