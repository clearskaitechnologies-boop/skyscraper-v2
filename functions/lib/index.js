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
Object.defineProperty(exports, "__esModule", { value: true });
exports.annotateWithOpenAI =
  exports.detectRoofDamageOpenAI =
  exports.triggerVendorSync =
  exports.nightlyVendorSync =
  exports.getWeatherHistory =
  exports.getWeatherAnalysis =
  exports.getWeatherReport =
  exports.getQuickDOL =
  exports.generateDamageSummary =
  exports.getAnnotationHistory =
  exports.annotateDamage =
  exports.seedSampleVendors =
  exports.syncVendorCatalog =
  exports.seedLayoutPresets =
  exports.buildPacket =
    void 0;
require("dotenv/config");
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const builders_1 = require("./builders");
admin.initializeApp();
exports.buildPacket = functions.https.onCall(async (data, context) => {
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
  const layout = presetSnap.data()?.sequence || [];
  const url = await (0, builders_1.buildPacketByLayout)(
    userId,
    layout,
    { ...payload, layoutKey },
    branding
  );
  return { url };
});
exports.seedLayoutPresets = functions.https.onCall(async (data, context) => {
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
var vendorSync_1 = require("./vendorSync");
Object.defineProperty(exports, "syncVendorCatalog", {
  enumerable: true,
  get: function () {
    return vendorSync_1.syncVendorCatalog;
  },
});
Object.defineProperty(exports, "seedSampleVendors", {
  enumerable: true,
  get: function () {
    return vendorSync_1.seedSampleVendors;
  },
});
var annotate_1 = require("./annotate");
Object.defineProperty(exports, "annotateDamage", {
  enumerable: true,
  get: function () {
    return annotate_1.annotateDamage;
  },
});
Object.defineProperty(exports, "getAnnotationHistory", {
  enumerable: true,
  get: function () {
    return annotate_1.getAnnotationHistory;
  },
});
Object.defineProperty(exports, "generateDamageSummary", {
  enumerable: true,
  get: function () {
    return annotate_1.generateDamageSummary;
  },
});
var weather_1 = require("./weather");
Object.defineProperty(exports, "getQuickDOL", {
  enumerable: true,
  get: function () {
    return weather_1.getQuickDOL;
  },
});
Object.defineProperty(exports, "getWeatherReport", {
  enumerable: true,
  get: function () {
    return weather_1.getWeatherReport;
  },
});
Object.defineProperty(exports, "getWeatherAnalysis", {
  enumerable: true,
  get: function () {
    return weather_1.getWeatherAnalysis;
  },
});
Object.defineProperty(exports, "getWeatherHistory", {
  enumerable: true,
  get: function () {
    return weather_1.getWeatherHistory;
  },
});
var scheduler_1 = require("./scheduler");
Object.defineProperty(exports, "nightlyVendorSync", {
  enumerable: true,
  get: function () {
    return scheduler_1.nightlyVendorSync;
  },
});
Object.defineProperty(exports, "triggerVendorSync", {
  enumerable: true,
  get: function () {
    return scheduler_1.triggerVendorSync;
  },
});
var openaiDetect_1 = require("./openaiDetect");
Object.defineProperty(exports, "detectRoofDamageOpenAI", {
  enumerable: true,
  get: function () {
    return openaiDetect_1.detectRoofDamageOpenAI;
  },
});
Object.defineProperty(exports, "annotateWithOpenAI", {
  enumerable: true,
  get: function () {
    return openaiDetect_1.annotateWithOpenAI;
  },
});
