export async function pullDOL(
  address: { line1?: string; city?: string; state?: string; zip?: string },
  orgId?: string
) {
  const res = await fetch("/api/dol-pull", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ address, org_id: orgId }),
  });
  if (!res.ok) throw new Error("DOL pull failed");
  return res.json();
}
