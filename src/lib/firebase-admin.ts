// Firebase Admin SDK configuration for server-side operations
import { cert, getApps, initializeApp as initializeAdminApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID!,
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
};

// Initialize Firebase Admin
const adminApps = getApps();
const adminApp = adminApps.length === 0 ? initializeAdminApp(firebaseAdminConfig) : adminApps[0];

// Initialize Firebase Admin Storage
export const adminStorage = getStorage(adminApp);

export { adminApp };
