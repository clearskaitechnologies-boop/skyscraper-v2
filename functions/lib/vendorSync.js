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
exports.seedSampleVendors = exports.syncVendorCatalog = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const axios_1 = __importDefault(require("axios"));
const db = admin.firestore();
/**
 * Admin callable that pulls a vendor's catalog from their API
 * and upserts it to Firestore under vendors/{vendorId}/products.
 * Replace API URL with real partner endpoint.
 */
exports.syncVendorCatalog = functions.https.onCall(async (data, context) => {
  // Require admin in your auth logic; for now simple check:
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Login required");
  const { vendorId, apiUrl } = data;
  if (!vendorId || !apiUrl)
    throw new functions.https.HttpsError("invalid-argument", "vendorId and apiUrl required");
  try {
    const res = await axios_1.default.get(apiUrl, { timeout: 10000 });
    const products = res.data.products || [];
    const vendorRef = db.collection("vendors").doc(vendorId);
    await vendorRef.set(
      {
        name: res.data.name || vendorId,
        logoUrl: res.data.logoUrl || "",
        site: res.data.site || "",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    const batch = db.batch();
    products.forEach((p) => {
      const ref = vendorRef.collection("products").doc(p.id || p.productId);
      batch.set(
        ref,
        {
          label: p.label || p.name,
          system: p.system || p.category,
          brochureUrls: p.brochureUrls || p.documents || [],
          colors: p.colors || [], // [{name:'Charcoal', swatchUrl:'...'}]
          specs: p.specs || p.specifications || {}, // { underlayment:'...', ...}
          images: p.images || p.gallery || [], // gallery
          price: p.price || null,
          availability: p.availability || "In Stock",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    });
    await batch.commit();
    return { vendorId, count: products.length, status: "success" };
  } catch (error) {
    console.error("Vendor sync error:", error);
    throw new functions.https.HttpsError("internal", `Failed to sync vendor: ${error}`);
  }
});
/**
 * Seed function to create sample vendor data for testing
 */
exports.seedSampleVendors = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Login required");
  const sampleVendors = [
    {
      id: "gaf",
      name: "GAF Materials Corporation",
      logoUrl: "https://example.com/gaf-logo.png",
      site: "https://gaf.com",
      products: [
        {
          id: "timberline-hdz",
          label: "Timberline HDZ Shingles",
          system: "Asphalt Shingles",
          brochureUrls: ["https://example.com/hdz-brochure.pdf"],
          colors: [
            {
              name: "Charcoal",
              swatchUrl: "https://example.com/charcoal.jpg",
            },
            {
              name: "Weathered Wood",
              swatchUrl: "https://example.com/weathered.jpg",
            },
          ],
          specs: {
            "Wind Rating": "130 mph",
            "Impact Rating": "Class 4",
            Warranty: "Lifetime Limited",
          },
          images: ["https://example.com/hdz-roof1.jpg"],
          price: 345.0,
        },
      ],
    },
    {
      id: "owens-corning",
      name: "Owens Corning",
      logoUrl: "https://example.com/oc-logo.png",
      site: "https://owenscorning.com",
      products: [
        {
          id: "duration-storm",
          label: "Duration STORM Impact Resistant Shingles",
          system: "Asphalt Shingles",
          brochureUrls: ["https://example.com/storm-brochure.pdf"],
          colors: [
            {
              name: "Estate Gray",
              swatchUrl: "https://example.com/estate-gray.jpg",
            },
            { name: "Onyx Black", swatchUrl: "https://example.com/onyx.jpg" },
          ],
          specs: {
            "Wind Rating": "110 mph",
            "Impact Rating": "Class 4",
            Warranty: "Limited Lifetime",
          },
          images: ["https://example.com/storm-roof1.jpg"],
          price: 385.0,
        },
      ],
    },
  ];
  const batch = db.batch();
  sampleVendors.forEach((vendor) => {
    const vendorRef = db.collection("vendors").doc(vendor.id);
    batch.set(vendorRef, {
      name: vendor.name,
      logoUrl: vendor.logoUrl,
      site: vendor.site,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    vendor.products.forEach((product) => {
      const productRef = vendorRef.collection("products").doc(product.id);
      batch.set(productRef, {
        ...product,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
  });
  await batch.commit();
  return { status: "success", vendors: sampleVendors.length };
});
