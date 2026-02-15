import React, { useState } from "react";

export default function CustomerForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
      });
      if (!res.ok) throw new Error("save failed");
      alert("Saved");
      setName("");
      setEmail("");
      setPhone("");
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md rounded bg-white p-4 shadow" aria-label="Customer form">
      <label htmlFor="name" className="mb-2 block">Name</label>
      <input
        id="name"
        name="name"
        placeholder="Customer name"
        className="mb-3 w-full rounded border p-2"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <label htmlFor="email" className="mb-2 block">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        placeholder="customer@example.com"
        className="mb-3 w-full rounded border p-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <label htmlFor="phone" className="mb-2 block">Phone</label>
      <input
        id="phone"
        name="phone"
        placeholder="(555) 123-4567"
        className="mb-3 w-full rounded border p-2"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white" disabled={saving}>
        {saving ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
