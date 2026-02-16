export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { arrayUnion, doc, getDoc, setDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/requireAuth";
import { db } from "@/lib/firebase";

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    const { orgId, userId } = auth;

    const { uid, projectId, product } = await req.json();

    if (!uid || !projectId || !product) {
      return NextResponse.json(
        { error: "Missing required fields: uid, projectId, product" },
        { status: 400 }
      );
    }

    const projectRef = doc(db, "users", uid, "projects", projectId);

    // Check if project exists, create if not
    const projectSnap = await getDoc(projectRef);
    if (!projectSnap.exists()) {
      await setDoc(projectRef, {
        id: projectId,
        name: "Default Project",
        createdAt: new Date().toISOString(),
        materials: [],
      });
    }

    // Add material to project
    await setDoc(
      projectRef,
      {
        materials: arrayUnion({
          vendorId: product.vendorId,
          productId: product.id,
          label: product.label,
          system: product.system,
          brochureUrls: product.brochureUrls || [],
          colors: product.colors || [],
          specs: product.specs || {},
          price: product.price || null,
          addedAt: new Date().toISOString(),
        }),
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      description: "Material added to project successfully",
    });
  } catch (error) {
    console.error("Error adding material to project:", error);
    return NextResponse.json({ error: "Failed to add material to project" }, { status: 500 });
  }
}
