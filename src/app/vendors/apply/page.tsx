"use client";
import { useState } from "react";

export default function VendorApply() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", websiteUrl: "", description: "" });

  function update(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/trades/onboard", { method: "POST", body: JSON.stringify(form) });
    setLoading(false);
    if (!res.ok) alert("Failed"); else alert("Submitted – pending review.");
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Apply as a Trade Partner</h1>
      <input className="w-full border p-2" name="name" placeholder="Company Name" value={form.name} onChange={update} />
      <input className="w-full border p-2" name="email" placeholder="Email" value={form.email} onChange={update} />
      <input className="w-full border p-2" name="phone" placeholder="Phone" value={form.phone} onChange={update} />
      <input className="w-full border p-2" name="websiteUrl" placeholder="Website" value={form.websiteUrl} onChange={update} />
      <textarea className="w-full border p-2" name="description" placeholder="Description" value={form.description} onChange={update} />
      <button className="rounded bg-blue-600 px-4 py-2 text-sm text-white" disabled={loading}>{loading ? "Submitting..." : "Submit"}</button>
    </form>
  );
}