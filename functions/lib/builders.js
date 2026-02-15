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
exports.buildPacketByLayout = buildPacketByLayout;
const pdf_lib_1 = require("pdf-lib");
const admin = __importStar(require("firebase-admin"));
async function buildPacketByLayout(userId, layout, data, branding) {
  const pdf = await pdf_lib_1.PDFDocument.create();
  for (const name of layout) {
    const mod = await Promise.resolve(`${`./pdf/${name}.js`}`).then((s) =>
      __importStar(require(s))
    );
    const page = pdf.addPage([612, 792]);
    // attach doc for helper embeds
    page.doc = pdf;
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
