"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = photoGrid;
const pdf_lib_1 = require("pdf-lib");
const index_1 = require("./index");
const axios_1 = __importDefault(require("axios"));
async function photoGrid(page, data, branding) {
  await (0, index_1.drawHeader)(page, branding, data.photoGridTitle || "Photo Evidence");
  const items = (data.photoGrid || []).slice(0, 6); // 6 photos per page
  // Grid configuration
  const startX = 40;
  const startY = 690;
  const cellWidth = 260;
  const cellHeight = 180;
  const gapX = 12;
  const gapY = 24; // Extra space for captions
  const captionHeight = 14;
  // Calculate grid positions (2 columns, 3 rows)
  const cols = 2;
  let currentX = startX;
  let currentY = startY;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    try {
      // Fetch and embed image
      const response = await axios_1.default.get(item.url, {
        responseType: "arraybuffer",
        timeout: 10000, // 10 second timeout
      });
      const imageBytes = new Uint8Array(response.data);
      // Determine image type and embed
      let image;
      if (
        item.url.toLowerCase().includes(".png") ||
        response.headers["content-type"]?.includes("image/png")
      ) {
        image = await page.doc.embedPng(imageBytes);
      } else {
        image = await page.doc.embedJpg(imageBytes);
      }
      // Calculate aspect ratio to fit within cell
      const imageAspectRatio = image.width / image.height;
      const cellAspectRatio = cellWidth / cellHeight;
      let drawWidth = cellWidth;
      let drawHeight = cellHeight;
      if (imageAspectRatio > cellAspectRatio) {
        // Image is wider than cell - fit to width
        drawWidth = cellWidth;
        drawHeight = cellWidth / imageAspectRatio;
      } else {
        // Image is taller than cell - fit to height
        drawHeight = cellHeight;
        drawWidth = cellHeight * imageAspectRatio;
      }
      // Center image in cell
      const imageX = currentX + (cellWidth - drawWidth) / 2;
      const imageY = currentY + (cellHeight - drawHeight) / 2;
      // Draw image
      page.drawImage(image, {
        x: imageX,
        y: imageY,
        width: drawWidth,
        height: drawHeight,
      });
      // Draw border around image cell
      page.drawRectangle({
        x: currentX,
        y: currentY,
        width: cellWidth,
        height: cellHeight,
        borderColor: (0, pdf_lib_1.rgb)(0.8, 0.8, 0.8),
        borderWidth: 1,
      });
      // Draw caption if provided
      if (item.caption && item.caption.trim()) {
        const font = await page.doc.embedFont("Helvetica");
        const captionText = item.caption.substring(0, 80); // Limit caption length
        // Word wrap caption to fit cell width
        const words = captionText.split(" ");
        const lines = [];
        let currentLine = "";
        for (const word of words) {
          const testLine = currentLine + (currentLine ? " " : "") + word;
          const textWidth = font.widthOfTextAtSize(testLine, 9);
          if (textWidth <= cellWidth - 8) {
            currentLine = testLine;
          } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          }
        }
        if (currentLine) lines.push(currentLine);
        // Draw caption lines
        for (let lineIdx = 0; lineIdx < Math.min(lines.length, 2); lineIdx++) {
          page.drawText(lines[lineIdx], {
            x: currentX + 4,
            y: currentY - 12 - lineIdx * 10,
            size: 9,
            font,
            color: (0, pdf_lib_1.rgb)(0.2, 0.2, 0.2),
          });
        }
      }
    } catch (error) {
      console.error(`Failed to load image ${item.url}:`, error);
      // Draw placeholder for failed images
      page.drawRectangle({
        x: currentX,
        y: currentY,
        width: cellWidth,
        height: cellHeight,
        color: (0, pdf_lib_1.rgb)(0.95, 0.95, 0.95),
        borderColor: (0, pdf_lib_1.rgb)(0.8, 0.8, 0.8),
        borderWidth: 1,
      });
      // Draw error text
      const font = await page.doc.embedFont("Helvetica");
      page.drawText("Image not available", {
        x: currentX + cellWidth / 2 - 40,
        y: currentY + cellHeight / 2,
        size: 10,
        font,
        color: (0, pdf_lib_1.rgb)(0.5, 0.5, 0.5),
      });
    }
    // Move to next position
    const col = i % cols;
    const row = Math.floor(i / cols);
    if (col === cols - 1) {
      // End of row - move to next row
      currentX = startX;
      currentY = startY - (row + 1) * (cellHeight + gapY + captionHeight);
    } else {
      // Move to next column
      currentX += cellWidth + gapX;
    }
  }
  // Add page info
  if (items.length > 0) {
    const font = await page.doc.embedFont("Helvetica");
    page.drawText(`Showing ${items.length} evidence photos`, {
      x: startX,
      y: 60,
      size: 10,
      font,
      color: (0, pdf_lib_1.rgb)(0.5, 0.5, 0.5),
    });
  }
  await (0, index_1.drawFooter)(page, branding);
}
