import axios from "axios";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

const db = admin.firestore();

/**
 * Admin callable that pulls a vendor's catalog from their API
 * and upserts it to Firestore under vendors/{vendorId}/products.
 * Replace API URL with real partner endpoint.
 */
export const syncVendorCatalog = functions.https.onCall(async (data, context) => {
  // Require admin in your auth logic; for now simple check:
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Login required");
  const { vendorId, apiUrl } = data;
  if (!vendorId || !apiUrl)
    throw new functions.https.HttpsError("invalid-argument", "vendorId and apiUrl required");

  try {
    const res = await axios.get(apiUrl, { timeout: 10000 });
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
    products.forEach((p: any) => {
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
export const seedSampleVendors = functions.https.onCall(async (data, context) => {
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
