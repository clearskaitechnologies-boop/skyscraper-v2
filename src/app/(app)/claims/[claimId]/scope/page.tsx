"use client";

/**
 * Scope Editor Page
 * Xactimate-style line item editor for claim scope of work
 */

import { Calculator, Download, FileSpreadsheet, Loader2, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { logger } from "@/lib/logger";

interface LineItem {
  id: string;
  category: string;
  code: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  ocpApproved: boolean;
  disputed: boolean;
}

const CATEGORIES = [
  "Roofing",
  "Siding",
  "Gutters",
  "Interior",
  "General Conditions",
  "Overhead & Profit",
  "Labor",
  "Materials",
  "Permits",
  "Other",
];

const UNITS = ["SF", "LF", "EA", "SQ", "HR", "LS", "CY", "GAL"];

// Demo scope data
const DEMO_SCOPE: LineItem[] = [
  {
    id: "1",
    category: "Roofing",
    code: "RFG LAMI",
    description: "Remove & replace laminated comp shingles - 3-tab",
    quantity: 28.5,
    unit: "SQ",
    unitPrice: 485.0,
    total: 13822.5,
    ocpApproved: true,
    disputed: false,
  },
  {
    id: "2",
    category: "Roofing",
    code: "RFG FELT",
    description: "Synthetic underlayment - premium grade",
    quantity: 28.5,
    unit: "SQ",
    unitPrice: 45.0,
    total: 1282.5,
    ocpApproved: true,
    disputed: false,
  },
  {
    id: "3",
    category: "Roofing",
    code: "RFG ICE",
    description: "Ice & water shield membrane (eaves, valleys)",
    quantity: 450,
    unit: "LF",
    unitPrice: 4.25,
    total: 1912.5,
    ocpApproved: true,
    disputed: false,
  },
  {
    id: "4",
    category: "Roofing",
    code: "RFG DRIP",
    description: "Drip edge - aluminum",
    quantity: 320,
    unit: "LF",
    unitPrice: 3.75,
    total: 1200.0,
    ocpApproved: true,
    disputed: false,
  },
  {
    id: "5",
    category: "Roofing",
    code: "RFG RIDGE",
    description: "Ridge vent - continuous aluminum",
    quantity: 65,
    unit: "LF",
    unitPrice: 12.5,
    total: 812.5,
    ocpApproved: false,
    disputed: true,
  },
  {
    id: "6",
    category: "Roofing",
    code: "RFG FLASH",
    description: "Step flashing - aluminum",
    quantity: 85,
    unit: "LF",
    unitPrice: 8.0,
    total: 680.0,
    ocpApproved: true,
    disputed: false,
  },
  {
    id: "7",
    category: "Roofing",
    code: "RFG BOOT",
    description: "Pipe boot - rubber",
    quantity: 4,
    unit: "EA",
    unitPrice: 45.0,
    total: 180.0,
    ocpApproved: true,
    disputed: false,
  },
  {
    id: "8",
    category: "General Conditions",
    code: "GEN LABOR",
    description: "Debris removal & dump fees",
    quantity: 1,
    unit: "LS",
    unitPrice: 450.0,
    total: 450.0,
    ocpApproved: true,
    disputed: false,
  },
  {
    id: "9",
    category: "General Conditions",
    code: "GEN PERMIT",
    description: "Building permit",
    quantity: 1,
    unit: "EA",
    unitPrice: 385.0,
    total: 385.0,
    ocpApproved: false,
    disputed: true,
  },
  {
    id: "10",
    category: "Overhead & Profit",
    code: "O&P",
    description: "Contractor overhead & profit (10% + 10%)",
    quantity: 1,
    unit: "LS",
    unitPrice: 4145.0,
    total: 4145.0,
    ocpApproved: false,
    disputed: true,
  },
];

export default function ScopePage() {
  const params = useParams();
  const claimId = Array.isArray(params?.claimId) ? params.claimId[0] : params?.claimId;

  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchScope() {
      if (!claimId) return;

      // Demo claim handling
      if (claimId === "demo-claim") {
        setLineItems(DEMO_SCOPE);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/claims/${claimId}/scope`);
        if (res.ok) {
          const data = await res.json();
          setLineItems(data.lineItems || []);
        }
      } catch (err) {
        logger.error("Failed to fetch scope:", err);
        // Fall back to demo data
        setLineItems(DEMO_SCOPE);
      } finally {
        setLoading(false);
      }
    }
    fetchScope();
  }, [claimId]);

  const calculateTotals = useCallback(() => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const approved = lineItems
      .filter((item) => item.ocpApproved)
      .reduce((sum, item) => sum + item.total, 0);
    const disputed = lineItems
      .filter((item) => item.disputed)
      .reduce((sum, item) => sum + item.total, 0);
    return { subtotal, approved, disputed };
  }, [lineItems]);

  const handleItemChange = (id: string, field: keyof LineItem, value: any) => {
    setLineItems((items) =>
      items.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        // Recalculate total if quantity or unit price changes
        if (field === "quantity" || field === "unitPrice") {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      })
    );
  };

  const handleAddItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      category: "Roofing",
      code: "",
      description: "",
      quantity: 1,
      unit: "SF",
      unitPrice: 0,
      total: 0,
      ocpApproved: false,
      disputed: false,
    };
    setLineItems([...lineItems, newItem]);
  };

  const handleDeleteSelected = () => {
    setLineItems((items) => items.filter((item) => !selectedItems.has(item.id)));
    setSelectedItems(new Set());
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // For demo, just simulate save
      await new Promise((r) => setTimeout(r, 1000));
      // In production, would call: await fetch(`/api/claims/${claimId}/scope`, { method: 'POST', ... })
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    // Create CSV export
    const headers = [
      "Code",
      "Description",
      "Qty",
      "Unit",
      "Unit Price",
      "Total",
      "Approved",
      "Disputed",
    ];
    const rows = lineItems.map((item) => [
      item.code,
      item.description,
      item.quantity,
      item.unit,
      item.unitPrice,
      item.total,
      item.ocpApproved ? "Yes" : "No",
      item.disputed ? "Yes" : "No",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scope-${claimId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const { subtotal, approved, disputed } = calculateTotals();

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-teal-600" />
            <h1 className="text-2xl font-bold">Scope Editor</h1>
          </div>
          <p className="text-slate-500">Xactimate-style line item editor for claim scope of work</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/claims-ready-folder/${claimId}/sections/scope-pricing`}>
            <Button variant="outline">← Back to Folder</Button>
          </Link>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Totals Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              ${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-slate-500">Total Scope</div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-700">
              ${approved.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-green-600">Carrier Approved</div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-700">
              ${disputed.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-amber-600">Disputed Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{lineItems.length}</div>
            <div className="text-sm text-slate-500">Line Items</div>
          </CardContent>
        </Card>
      </div>

      {/* Line Items Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Line Items
            </CardTitle>
            <CardDescription>Click cells to edit values directly</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {selectedItems.size > 0 && (
              <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete ({selectedItems.size})
              </Button>
            )}
            <Button size="sm" onClick={handleAddItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectedItems.size === lineItems.length && lineItems.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedItems(new Set(lineItems.map((i) => i.id)));
                        } else {
                          setSelectedItems(new Set());
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead className="w-24">Category</TableHead>
                  <TableHead className="w-28">Code</TableHead>
                  <TableHead className="min-w-[250px]">Description</TableHead>
                  <TableHead className="w-20 text-right">Qty</TableHead>
                  <TableHead className="w-16">Unit</TableHead>
                  <TableHead className="w-24 text-right">Unit Price</TableHead>
                  <TableHead className="w-28 text-right">Total</TableHead>
                  <TableHead className="w-16 text-center">OCP</TableHead>
                  <TableHead className="w-16 text-center">Dispute</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.map((item) => (
                  <TableRow key={item.id} className={item.disputed ? "bg-amber-50" : ""}>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.has(item.id)}
                        onCheckedChange={(checked) => {
                          const next = new Set(selectedItems);
                          if (checked) {
                            next.add(item.id);
                          } else {
                            next.delete(item.id);
                          }
                          setSelectedItems(next);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={item.category}
                        onValueChange={(v) => handleItemChange(item.id, "category", v)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.code}
                        onChange={(e) => handleItemChange(item.id, "code", e.target.value)}
                        className="h-8 font-mono text-xs"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(item.id, "quantity", parseFloat(e.target.value) || 0)
                        }
                        className="h-8 text-right text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={item.unit}
                        onValueChange={(v) => handleItemChange(item.id, "unit", v)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNITS.map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(item.id, "unitPrice", parseFloat(e.target.value) || 0)
                        }
                        className="h-8 text-right text-sm"
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${item.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={item.ocpApproved}
                        onCheckedChange={(checked) =>
                          handleItemChange(item.id, "ocpApproved", !!checked)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={item.disputed}
                        onCheckedChange={(checked) =>
                          handleItemChange(item.id, "disputed", !!checked)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {lineItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <FileSpreadsheet className="mb-4 h-12 w-12 text-slate-300" />
              <h3 className="mb-2 text-lg font-medium">No Line Items</h3>
              <p className="mb-4 text-sm text-slate-500">
                Click "Add Item" to start building your scope
              </p>
              <Button onClick={handleAddItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Item
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="font-medium">Legend:</span>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded border border-green-300 bg-green-100" />
              <span>OCP Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded border border-amber-300 bg-amber-100" />
              <span>Disputed Item</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">SF</Badge>
              <span>= Square Feet</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">LF</Badge>
              <span>= Linear Feet</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">SQ</Badge>
              <span>= Roofing Square (100 SF)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">EA</Badge>
              <span>= Each</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">LS</Badge>
              <span>= Lump Sum</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
