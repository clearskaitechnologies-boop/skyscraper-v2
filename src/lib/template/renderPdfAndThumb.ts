import { chromium } from "playwright";

export async function renderPdfAndThumbnail(html: string) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1240, height: 1754 } }); // ~A4ish at 150dpi feel

  await page.setContent(html, { waitUntil: "networkidle" });

  // PDF
  const pdfBuffer = await page.pdf({
    format: "Letter",
    printBackground: true,
    margin: { top: "0.4in", right: "0.4in", bottom: "0.4in", left: "0.4in" },
  });

  // Thumbnail from first page (top of document)
  const pngBuffer = await page.screenshot({
    type: "png",
    fullPage: false,
  });

  await browser.close();
  return { pdfBuffer, pngBuffer };
}
