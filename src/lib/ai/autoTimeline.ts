export async function autoGenerateTimeline(documentType: string) {
  const map: Record<string, { title: string; description: string }> = {
    inspection: { title: "Inspection Completed", description: "Inspection photos or documents were added." },
    weather_report: { title: "Weather Verification Completed", description: "Weather report added to file." },
    denial_letter: { title: "Insurance Denied Claim", description: "We will review and prepare a supplement." },
    approval_letter: { title: "Insurance Approved Claim", description: "Next step: material ordering." },
    supplement: { title: "Supplement Submitted", description: "We submitted additional documentation for approval." },
  };
  return map[documentType] || null;
}