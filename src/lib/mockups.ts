export async function generateMockup(reportIntakeId: string, page = "cover") {
  const res = await fetch("/api/mockup/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ reportIntakeId, page }),
  });
  if (!res.ok) throw new Error("Mockup generation failed");
  return res.json();
}

export async function generatePdf(reportIntakeId: string) {
  const res = await fetch("/api/generate-pdf", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ reportIntakeId }),
  });
  if (!res.ok) throw new Error("PDF generation failed");
  return res.json();
}
