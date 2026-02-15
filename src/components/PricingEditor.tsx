import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type PriceLine = {
  item: string;
  qty: number;
  unit: string;
  unitPrice: number;
  taxable?: boolean;
  notes?: string;
};

export type PriceTable = {
  title?: string;
  lines: PriceLine[];
  taxRate?: number;
  discount?: number;
};

interface PricingEditorProps {
  value?: PriceTable;
  onChange: (value: PriceTable) => void;
}

export default function PricingEditor({ value, onChange }: PricingEditorProps) {
  const [lines, setLines] = useState<PriceLine[]>(value?.lines || []);
  const [taxRate, setTaxRate] = useState<number>((value?.taxRate || 0) * 100);
  const [discount, setDiscount] = useState<number>(value?.discount || 0);

  const addLine = () => {
    const newLines = [...lines, { item: "", qty: 1, unit: "ea", unitPrice: 0, taxable: true }];
    setLines(newLines);
    onChange({ lines: newLines, taxRate: taxRate / 100, discount });
  };

  const updateLine = (index: number, field: keyof PriceLine, val: any) => {
    const newLines = lines.map((line, i) => (i === index ? { ...line, [field]: val } : line));
    setLines(newLines);
    onChange({ lines: newLines, taxRate: taxRate / 100, discount });
  };

  const removeLine = (index: number) => {
    const newLines = lines.filter((_, i) => i !== index);
    setLines(newLines);
    onChange({ lines: newLines, taxRate: taxRate / 100, discount });
  };

  const handleTaxChange = (val: number) => {
    setTaxRate(val);
    onChange({ lines, taxRate: val / 100, discount });
  };

  const handleDiscountChange = (val: number) => {
    setDiscount(val);
    onChange({ lines, taxRate: taxRate / 100, discount: val });
  };

  const subtotal = lines.reduce((sum, line) => sum + line.qty * line.unitPrice, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax - discount;

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Price Breakdown</h3>
        <Button onClick={addLine} size="sm" variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Line Item
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tax-rate">Tax Rate (%)</Label>
          <Input
            id="tax-rate"
            type="number"
            step="0.1"
            value={taxRate}
            onChange={(e) => handleTaxChange(Number(e.target.value))}
            placeholder="8.5"
          />
        </div>
        <div>
          <Label htmlFor="discount">Discount ($)</Label>
          <Input
            id="discount"
            type="number"
            step="0.01"
            value={discount}
            onChange={(e) => handleDiscountChange(Number(e.target.value))}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left font-medium">Item</th>
                <th className="w-24 p-3 text-left font-medium">Qty</th>
                <th className="w-24 p-3 text-left font-medium">Unit</th>
                <th className="w-32 p-3 text-left font-medium">Unit Price</th>
                <th className="w-32 p-3 text-left font-medium">Line Total</th>
                <th className="w-16 p-3 text-left font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, index) => {
                const lineTotal = line.qty * line.unitPrice;
                return (
                  <tr key={index} className="border-t">
                    <td className="p-3">
                      <Input
                        value={line.item}
                        onChange={(e) => updateLine(index, "item", e.target.value)}
                        placeholder="Item description"
                        className="h-8"
                      />
                    </td>
                    <td className="p-3">
                      <Input
                        type="number"
                        value={line.qty}
                        onChange={(e) => updateLine(index, "qty", Number(e.target.value))}
                        className="h-8"
                      />
                    </td>
                    <td className="p-3">
                      <Input
                        value={line.unit}
                        onChange={(e) => updateLine(index, "unit", e.target.value)}
                        placeholder="ea"
                        className="h-8"
                      />
                    </td>
                    <td className="p-3">
                      <Input
                        type="number"
                        step="0.01"
                        value={line.unitPrice}
                        onChange={(e) => updateLine(index, "unitPrice", Number(e.target.value))}
                        className="h-8"
                      />
                    </td>
                    <td className="p-3 font-medium">${lineTotal.toFixed(2)}</td>
                    <td className="p-3">
                      <Button
                        onClick={() => removeLine(index)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {lines.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                    No line items yet. Click "Add Line Item" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {lines.length > 0 && (
        <div className="flex justify-end">
          <div className="w-64 space-y-2 rounded-lg bg-muted/50 p-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {taxRate > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tax ({taxRate}%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount:</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 text-base font-bold">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
