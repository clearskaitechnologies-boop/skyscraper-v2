"use client";
import { useState } from "react";

export default function VendorApply() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    websiteUrl: "",
    description: "",
  });

  function update(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/trades/onboard", { method: "POST", body: JSON.stringify(form) });
    setLoading(false);
    if (!res.ok) alert("Failed");
    else alert("Submitted – pending review.");
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Apply as a Trade Partner</h1>
      <div>
        <label htmlFor="vendor-name" className="mb-1 block text-sm font-medium text-gray-700">
          Company Name
        </label>
        <input
          id="vendor-name"
          className="w-full rounded-lg border p-2"
          name="name"
          placeholder="Enter company name"
          value={form.name}
          onChange={update}
          required
        />
      </div>
      <div>
        <label htmlFor="vendor-email" className="mb-1 block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="vendor-email"
          type="email"
          className="w-full rounded-lg border p-2"
          name="email"
          placeholder="contact@company.com"
          value={form.email}
          onChange={update}
          required
        />
      </div>
      <div>
        <label htmlFor="vendor-phone" className="mb-1 block text-sm font-medium text-gray-700">
          Phone
        </label>
        <input
          id="vendor-phone"
          type="tel"
          className="w-full rounded-lg border p-2"
          name="phone"
          placeholder="(555) 555-5555"
          value={form.phone}
          onChange={update}
        />
      </div>
      <div>
        <label htmlFor="vendor-website" className="mb-1 block text-sm font-medium text-gray-700">
          Website
        </label>
        <input
          id="vendor-website"
          type="url"
          className="w-full rounded-lg border p-2"
          name="websiteUrl"
          placeholder="https://yourcompany.com"
          value={form.websiteUrl}
          onChange={update}
        />
      </div>
      <div>
        <label
          htmlFor="vendor-description"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          id="vendor-description"
          className="w-full rounded-lg border p-2"
          name="description"
          placeholder="Tell us about your services…"
          value={form.description}
          onChange={update}
          rows={4}
        />
      </div>
      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Submitting…" : "Submit Application"}
      </button>
    </form>
  );
}
