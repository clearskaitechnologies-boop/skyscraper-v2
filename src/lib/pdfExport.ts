type Html2CanvasFn = (
  node: HTMLElement,
  opts: Record<string, unknown>
) => Promise<HTMLCanvasElement>;
type JsPDFCtor = new (opts?: Record<string, unknown>) => {
  internal: { pageSize: { getWidth: () => number; getHeight: () => number } };
  addImage: (...args: unknown[]) => void;
  save: (name?: string) => void;
};

let html2canvasPromise: Promise<unknown> | null = null;
let jsPDFPromise: Promise<unknown> | null = null;

async function loadDeps() {
  if (!html2canvasPromise) {
    html2canvasPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
      script.onload = () =>
        resolve((window as unknown as { html2canvas?: unknown }).html2canvas as unknown);
      document.head.appendChild(script);
    });
  }
  if (!jsPDFPromise) {
    jsPDFPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js";
      script.onload = () =>
        resolve(
          ((window as unknown as { jspdf?: { jsPDF?: unknown } }).jspdf &&
            (window as unknown as { jspdf?: { jsPDF?: unknown } }).jspdf!.jsPDF) as unknown
        );
      document.head.appendChild(script);
    });
  }
  const [html2canvas, jsPDF] = await Promise.all([html2canvasPromise, jsPDFPromise]);
  return { html2canvas, jsPDF };
}

export async function nodeToPDF(
  node: HTMLElement,
  filename = "report.pdf",
  { inlineRemoteImages = true } = {}
) {
  const { html2canvas, jsPDF } = await loadDeps();

  // Attempt to inline <img> with same-origin/CORS-enabled sources
  if (inlineRemoteImages) {
    const imgs = Array.from(node.querySelectorAll("img"));
    await Promise.all(
      imgs.map(async (img) => {
        try {
          const url = new URL(img.src, location.origin).toString();
          const res = await fetch(url, { mode: "cors" });
          if (!res.ok) return;
          const blob = await res.blob();
          const objectUrl = URL.createObjectURL(blob);
          img.setAttribute("data-original-src", img.src);
          img.src = objectUrl;
        } catch {
          // Silently fail for images that can't be loaded
        }
      })
    );
  }

  const canvas = await (html2canvas as unknown as Html2CanvasFn)(node, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
    allowTaint: false,
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new (jsPDF as unknown as JsPDFCtor)({
    orientation: canvas.width > canvas.height ? "l" : "p",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
  const imgWidth = canvas.width * ratio;
  const imgHeight = canvas.height * ratio;

  pdf.addImage(
    imgData,
    "PNG",
    (pageWidth - imgWidth) / 2,
    (pageHeight - imgHeight) / 2,
    imgWidth,
    imgHeight,
    undefined,
    "FAST"
  );
  pdf.save(filename);

  // Restore any swapped object URLs
  if (inlineRemoteImages) {
    node.querySelectorAll("img[data-original-src]").forEach((img) => {
      const el = img as HTMLImageElement;
      el.src = el.getAttribute("data-original-src")!;
      el.removeAttribute("data-original-src");
    });
  }

  return pdf;
}
