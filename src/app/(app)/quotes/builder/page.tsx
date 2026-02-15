"use client";

import { useUser } from "@clerk/nextjs";
import { Calculator,Download, FileText, Plus, Send, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function QuoteBuilderPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const [clientName, setClientName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", description: "Roof Inspection", quantity: 1, unitPrice: 250, total: 250 },
  ]);
  const [taxRate, setTaxRate] = useState(8.5);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setLineItems([...lineItems, newItem]);
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "quantity" || field === "unitPrice") {
            updated.total = Number(updated.quantity) * Number(updated.unitPrice);
          }
          return updated;
        }
        return item;
      })
    );
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * taxRate) / 100;
  const total = taxableAmount + taxAmount;

  const generatePDF = () => {
    alert("Generating PDF quote...");
  };

  const sendQuote = () => {
    alert("Sending quote to client...");
  };

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-[color:var(--text)]">Quote Builder</h1>
          <p className="text-gray-600">Create professional quotes and estimates</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={generatePDF} className="gap-2 bg-red-600 hover:bg-red-700">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          <Button onClick={sendQuote} className="gap-2">
            <Send className="h-4 w-4" />
            Send to Client
          </Button>
        </div>
      </div>

      {/* Quote Form */}
      <div className="rounded-lg bg-white p-8 shadow">
        {/* Client Info */}
        <div className="mb-8 grid grid-cols-2 gap-6">
          <div>
            <label className="mb-2 block text-sm font-medium">Client Name</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full rounded-lg border px-4 py-2"
              placeholder="John Smith"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Project Name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full rounded-lg border px-4 py-2"
              placeholder="Residential Roof Replacement"
            />
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Line Items</h2>
            <Button onClick={addLineItem} className="gap-2 bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>

          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Qty</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                          className="w-full rounded border px-3 py-2"
                          placeholder="Item description"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateLineItem(item.id, "quantity", Number(e.target.value))
                          }
                          className="w-20 rounded border px-3 py-2"
                          min="1"
                          placeholder="Qty"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateLineItem(item.id, "unitPrice", Number(e.target.value))
                          }
                          className="w-28 rounded border px-3 py-2"
                          min="0"
                          step="0.01"
                          placeholder="Price"
                        />
                      </td>
                      <td className="px-4 py-3 font-semibold">${item.total.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => removeLineItem(item.id)}
                          className="rounded p-2 text-red-600 hover:bg-red-50"
                          title="Remove line item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Calculations */}
        <div className="flex justify-end">
          <div className="w-96 space-y-4">
            <div className="flex items-center justify-between border-b py-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Discount</span>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-20 rounded border px-2 py-1 text-sm"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="0"
                  aria-label="Discount percentage"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
              <span className="font-semibold text-red-600">-${discountAmount.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Tax</span>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-20 rounded border px-2 py-1 text-sm"
                  min="0"
                  max="100"
                  placeholder="0"
                  aria-label="Tax rate percentage"
                  step="0.1"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
              <span className="font-semibold">${taxAmount.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between border-t-2 border-gray-300 py-3">
              <span className="flex items-center gap-2 text-xl font-bold">
                <Calculator className="h-5 w-5" />
                Total
              </span>
              <span className="text-2xl font-bold text-green-600">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Terms & Notes */}
        <div className="mt-8 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Terms & Conditions</label>
            <textarea
              className="w-full rounded-lg border px-4 py-3"
              rows={4}
              placeholder="Payment terms, warranty information, etc."
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Internal Notes</label>
            <textarea
              className="w-full rounded-lg border px-4 py-3"
              rows={2}
              placeholder="Notes for internal use only (not visible to client)"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1">
            Save as Draft
          </Button>
          <Button className="flex-1 gap-2 bg-green-600 hover:bg-green-700">
            <FileText className="h-5 w-5" />
            Mark as Final
          </Button>
        </div>
      </div>
    </div>
  );
}
