import axios from "axios";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

const db = admin.firestore();

export const nightlyVendorSync = functions.pubsub
  .schedule("0 6 * * *") // Every day at 6 AM UTC
  .timeZone("Etc/UTC")
  .onRun(async (context) => {
    console.log("Starting nightly vendor sync...");

    try {
      // Get all vendors with autoSync enabled
      const vendorsQuery = await db.collection("vendors").where("autoSync", "==", true).get();

      if (vendorsQuery.empty) {
        console.log("No vendors configured for auto-sync");
        return null;
      }

      console.log(`Found ${vendorsQuery.docs.length} vendors for sync`);

      const syncPromises = vendorsQuery.docs.map(async (vendorDoc) => {
        const vendor = vendorDoc.data();
        const vendorId = vendorDoc.id;

        console.log(`Syncing vendor: ${vendorId}`);

        if (!vendor.apiUrl) {
          console.warn(`Vendor ${vendorId} has no API URL configured`);
          return;
        }

        try {
          // Fetch catalog from vendor API
          const response = await axios.get(vendor.apiUrl, {
            timeout: 30000, // 30 second timeout
            headers: {
              "User-Agent": "SkaiScraper-VendorSync/1.0",
            },
          });

          const catalogData = response.data;
          const products = catalogData.products || [];

          if (!Array.isArray(products)) {
            console.warn(`Vendor ${vendorId} returned invalid product data`);
            return;
          }

          console.log(`Vendor ${vendorId}: Found ${products.length} products`);

          // Batch write products to Firestore
          const batch = db.batch();
          let batchCount = 0;
          const maxBatchSize = 500; // Firestore batch limit

          for (const product of products) {
            if (!product.id) {
              console.warn(`Product missing ID from vendor ${vendorId}`);
              continue;
            }

            const productRef = vendorDoc.ref.collection("products").doc(product.id);
            batch.set(
              productRef,
              {
                label: product.label || product.name || "Unnamed Product",
                system: product.system || product.category || "General",
                brochureUrls: Array.isArray(product.brochureUrls) ? product.brochureUrls : [],
                colors: Array.isArray(product.colors) ? product.colors : [],
                specs: typeof product.specs === "object" ? product.specs : {},
                images: Array.isArray(product.images) ? product.images : [],
                price: product.price || null,
                description: product.description || "",
                sku: product.sku || product.id,
                availability: product.availability || "in-stock",
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              },
              { merge: true }
            );

            batchCount++;

            // Commit batch if we hit the limit
            if (batchCount >= maxBatchSize) {
              await batch.commit();
              console.log(`Committed batch of ${batchCount} products for vendor ${vendorId}`);
              batchCount = 0;
            }
          }

          // Commit remaining products
          if (batchCount > 0) {
            await batch.commit();
            console.log(`Committed final batch of ${batchCount} products for vendor ${vendorId}`);
          }

          // Update vendor's last sync timestamp
          await vendorDoc.ref.update({
            lastSyncAt: admin.firestore.FieldValue.serverTimestamp(),
            lastSyncSuccess: true,
            lastSyncProductCount: products.length,
            lastSyncError: null,
          });

          console.log(`Successfully synced ${products.length} products for vendor ${vendorId}`);
        } catch (error) {
          console.error(`Failed to sync vendor ${vendorId}:`, error);

          // Update vendor with error info
          await vendorDoc.ref.update({
            lastSyncAt: admin.firestore.FieldValue.serverTimestamp(),
            lastSyncSuccess: false,
            lastSyncError: error instanceof Error ? error.message : "Unknown error",
          });
        }
      });

      // Wait for all vendor syncs to complete
      await Promise.allSettled(syncPromises);

      console.log("Nightly vendor sync completed");
      return null;
    } catch (error) {
      console.error("Nightly vendor sync failed:", error);
      throw error;
    }
  });

// Manual trigger function for testing
export const triggerVendorSync = functions.https.onCall(async (data, context) => {
  // Require admin authentication for manual triggers
  if (!context.auth?.uid) {
    throw new functions.https.HttpsError("permission-denied", "Authentication required");
  }

  // You can add admin role checking here if needed
  console.log(`Manual vendor sync triggered by user: ${context.auth.uid}`);

  try {
    // Run the same logic as the scheduled function
    const vendorsQuery = await db.collection("vendors").where("autoSync", "==", true).get();

    if (vendorsQuery.empty) {
      return {
        success: true,
        message: "No vendors configured for sync",
        vendorCount: 0,
      };
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const vendorDoc of vendorsQuery.docs) {
      const vendor = vendorDoc.data();
      const vendorId = vendorDoc.id;

      if (!vendor.apiUrl) {
        errorCount++;
        errors.push(`${vendorId}: No API URL configured`);
        continue;
      }

      try {
        const response = await axios.get(vendor.apiUrl, {
          timeout: 30000,
          headers: { "User-Agent": "SkaiScraper-VendorSync/1.0" },
        });

        const products = response.data.products || [];

        if (Array.isArray(products)) {
          const batch = db.batch();

          products.forEach((product: any) => {
            if (product.id) {
              const productRef = vendorDoc.ref.collection("products").doc(product.id);
              batch.set(
                productRef,
                {
                  label: product.label || product.name || "Unnamed Product",
                  system: product.system || product.category || "General",
                  brochureUrls: Array.isArray(product.brochureUrls) ? product.brochureUrls : [],
                  colors: Array.isArray(product.colors) ? product.colors : [],
                  specs: typeof product.specs === "object" ? product.specs : {},
                  images: Array.isArray(product.images) ? product.images : [],
                  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                },
                { merge: true }
              );
            }
          });

          await batch.commit();

          await vendorDoc.ref.update({
            lastSyncAt: admin.firestore.FieldValue.serverTimestamp(),
            lastSyncSuccess: true,
            lastSyncProductCount: products.length,
            lastSyncError: null,
          });

          successCount++;
        } else {
          errorCount++;
          errors.push(`${vendorId}: Invalid product data format`);
        }
      } catch (error) {
        errorCount++;
        errors.push(`${vendorId}: ${error instanceof Error ? error.message : "Unknown error"}`);

        await vendorDoc.ref.update({
          lastSyncAt: admin.firestore.FieldValue.serverTimestamp(),
          lastSyncSuccess: false,
          lastSyncError: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return {
      success: true,
      message: `Sync completed: ${successCount} successful, ${errorCount} failed`,
      vendorCount: vendorsQuery.docs.length,
      successCount,
      errorCount,
      errors: errors.slice(0, 10), // Limit error list to avoid response size issues
    };
  } catch (error) {
    console.error("Manual vendor sync failed:", error);
    throw new functions.https.HttpsError("internal", "Sync failed");
  }
});
