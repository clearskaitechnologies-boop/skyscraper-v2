/**
 * Save Signature
 * DEPRECATED: generatedDocument and documentSignature models don't exist in schema.
 */

interface SaveSignatureOptions {
  documentId: string;
  signerName: string;
  signerEmail: string;
  role: string;
  signature: string;
}

export async function saveSignature({
  documentId,
  signerName,
  signerEmail,
  role,
  signature,
}: SaveSignatureOptions) {
  // generatedDocument and documentSignature models don't exist in schema
  console.log(`[signatures] Would save signature for document ${documentId} by ${signerName}`);
  throw new Error("Signature feature not implemented - models require schema updates");
}
