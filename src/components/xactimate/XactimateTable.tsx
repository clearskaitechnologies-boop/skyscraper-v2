// src/components/xactimate/XactimateTable.tsx
"use client";

import { useMemo } from "react";

import { XactimateLineItem } from "@/types/xactimate";

type Props = {
  items: XactimateLineItem[];
  setItems: (items: XactimateLineItem[]) => void;
  taxRate: number; // e.g. 9.1 for 9.1%
  opPercent: number; // e.g. 10 for 10%
  opEnabled: boolean;
};

export function XactimateTable({
  items,
  setItems,
  taxRate,
  opPercent,
  opEnabled,
}: Props) {
  function updateItem(idx: number, patch: Partial<XactimateLineItem>) {
    const next = [...items];
    next[idx] = { ...next[idx], ...patch };
    setItems(next);
  }

  function removeItem(idx: number) {
    const next = [...items];
    next.splice(idx, 1);
    setItems(next);
  }

  function addBlankItem() {
    setItems([
      ...items,
      {
        id: `tmp-${Date.now()}`,
        code: "",
        description: "",
        category: "",
        roomArea: "",
        quantity: 1,
        unit: "EA",
        unitPrice: 0,
        taxable: true,
        opEligible: true,
      },
    ]);
  }

  const totals = useMemo(() => {
    let subtotal = 0;
    let taxableAmount = 0;
    let opBase = 0;

    for (const item of items) {
      const lineTotal = (item.quantity || 0) * (item.unitPrice || 0);
      subtotal += lineTotal;
      if (item.taxable) taxableAmount += lineTotal;
      if (opEnabled && item.opEligible) opBase += lineTotal;
    }

    const tax = taxableAmount * (taxRate / 100);
    const opAmount = opBase * (opPercent / 100);
    const grandTotal = subtotal + tax + opAmount;

    return { subtotal, taxableAmount, opBase, tax, opAmount, grandTotal };
  }, [items, taxRate, opPercent, opEnabled]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Xactimate Line Items
        </h3>
        <button
          type="button"
          onClick={addBlankItem}
          className="rounded bg-gray-200 px-3 py-1 text-xs transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          + Add Line
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full text-[11px]">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="border-b border-gray-200 px-2 py-1 text-left dark:border-gray-700">Code</th>
              <th className="border-b border-gray-200 px-2 py-1 text-left dark:border-gray-700">Description</th>
              <th className="border-b border-gray-200 px-2 py-1 text-left dark:border-gray-700">Category</th>
              <th className="border-b border-gray-200 px-2 py-1 text-left dark:border-gray-700">Area</th>
              <th className="border-b border-gray-200 px-2 py-1 text-right dark:border-gray-700">Qty</th>
              <th className="border-b border-gray-200 px-2 py-1 text-left dark:border-gray-700">Unit</th>
              <th className="border-b border-gray-200 px-2 py-1 text-right dark:border-gray-700">Unit $</th>
              <th className="border-b border-gray-200 px-2 py-1 text-center dark:border-gray-700">Tax</th>
              <th className="border-b border-gray-200 px-2 py-1 text-center dark:border-gray-700">O&P</th>
              <th className="border-b border-gray-200 px-2 py-1 text-right dark:border-gray-700">Line Total</th>
              <th className="border-b border-gray-200 px-2 py-1 text-center dark:border-gray-700">X</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  className="px-2 py-3 text-center text-xs text-gray-500 dark:text-gray-400"
                >
                  No line items yet. Click &ldquo;+ Add Line&rdquo; to begin.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => {
                const lineTotal =
                  (item.quantity || 0) * (item.unitPrice || 0);

                return (
                  <tr key={item.id ?? idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-1 py-1">
                      <input
                        className="w-full border-none bg-transparent px-1 text-[11px] outline-none"
                        value={item.code}
                        onChange={(e) =>
                          updateItem(idx, { code: e.target.value })
                        }
                      />
                    </td>
                    <td className="px-1 py-1">
                      <input
                        className="w-full border-none bg-transparent px-1 text-[11px] outline-none"
                        value={item.description}
                        onChange={(e) =>
                          updateItem(idx, {
                            description: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td className="px-1 py-1">
                      <input
                        className="w-full border-none bg-transparent px-1 text-[11px] outline-none"
                        value={item.category ?? ""}
                        onChange={(e) =>
                          updateItem(idx, { category: e.target.value })
                        }
                      />
                    </td>
                    <td className="px-1 py-1">
                      <input
                        className="w-full border-none bg-transparent px-1 text-[11px] outline-none"
                        value={item.roomArea ?? ""}
                        onChange={(e) =>
                          updateItem(idx, { roomArea: e.target.value })
                        }
                      />
                    </td>
                    <td className="px-1 py-1 text-right">
                      <input
                        type="number"
                        className="w-full border-none bg-transparent px-1 text-right text-[11px] outline-none"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(idx, {
                            quantity: Number(e.target.value) || 0,
                          })
                        }
                      />
                    </td>
                    <td className="px-1 py-1">
                      <input
                        className="w-full border-none bg-transparent px-1 text-[11px] outline-none"
                        value={item.unit}
                        onChange={(e) =>
                          updateItem(idx, { unit: e.target.value })
                        }
                      />
                    </td>
                    <td className="px-1 py-1 text-right">
                      <input
                        type="number"
                        className="w-full border-none bg-transparent px-1 text-right text-[11px] outline-none"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(idx, {
                            unitPrice: Number(e.target.value) || 0,
                          })
                        }
                      />
                    </td>
                    <td className="px-1 py-1 text-center">
                      <input
                        type="checkbox"
                        checked={item.taxable}
                        onChange={(e) =>
                          updateItem(idx, { taxable: e.target.checked })
                        }
                      />
                    </td>
                    <td className="px-1 py-1 text-center">
                      <input
                        type="checkbox"
                        checked={item.opEligible}
                        onChange={(e) =>
                          updateItem(idx, {
                            opEligible: e.target.checked,
                          })
                        }
                      />
                    </td>
                    <td className="px-1 py-1 text-right font-medium">
                      ${lineTotal.toFixed(2)}
                    </td>
                    <td className="px-1 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs dark:border-gray-700 dark:bg-gray-800">
        <div className="space-y-1">
          <div>
            <span className="font-medium">Subtotal: </span>
            ${totals.subtotal.toFixed(2)}
          </div>
          <div>
            <span className="font-medium">Taxable Base: </span>
            ${totals.taxableAmount.toFixed(2)}
          </div>
          <div>
            <span className="font-medium">O&amp;P Base: </span>
            ${totals.opBase.toFixed(2)}
          </div>
        </div>
        <div className="space-y-1">
          <div>
            <span className="font-medium">
              Tax ({taxRate.toFixed(2)}%):
            </span>{" "}
            ${totals.tax.toFixed(2)}
          </div>
          <div>
            <span className="font-medium">
              O&amp;P ({opEnabled ? opPercent.toFixed(2) : 0}%):
            </span>{" "}
            ${totals.opAmount.toFixed(2)}
          </div>
          <div className="text-base font-semibold">
            Grand Total: ${totals.grandTotal.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
