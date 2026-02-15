import * as admin from "firebase-admin";
import { PDFDocument } from "pdf-lib";

type SectionName =
  | "coverPage"
  | "overviewPage"
  | "inspectionSummary"
  | "damageReport"
  | "weatherReport"
  | "codeCompliance"
  | "recommendations"
  | "timeline"
  | "mockupPage"
  | "agreement"
  | "materialSpecs"
  | "brochures"
  | "estimate"
  | "financeAgreement"
  | "photoGrid";

export async function buildPacketByLayout(
  userId: string,
  layout: SectionName[],
  data: any,
  branding: any
) {
  const pdf = await PDFDocument.create();

  for (const name of layout) {
    const mod = await import(`./pdf/${name}.js`);
    const page = pdf.addPage([612, 792]);
    // attach doc for helper embeds
    (page as any).doc = pdf;
    await mod.default(page, data, branding);
  }

  const bytes = await pdf.save();
  const outPath = `claimPackets/${userId}/${Date.now()}_${data?.layoutKey || "Packet"}.pdf`;
  const bucket = admin.storage().bucket();
  const file = bucket.file(outPath);
  await file.save(Buffer.from(bytes), {
    contentType: "application/pdf",
    resumable: false,
  });
  await file.makePublic();
  const url = `https://storage.googleapis.com/${bucket.name}/${outPath}`;
  await admin
    .firestore()
    .collection("users")
    .doc(userId)
    .collection("reports")
    .add({
      fileName: data?.fileName || `${data?.layoutKey || "Packet"}.pdf`,
      fileUrl: url,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  return url;
}
