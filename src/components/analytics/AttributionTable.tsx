"use client";

import { DollarSign,Download, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AttributionRow {
  source: string;
  scans: number;
  inspections: number;
  leads: number;
  claims: number;
  jobsWon: number;
  revenue: number;
  conversionRate: number;
}

interface AttributionTableProps {
  attributions: AttributionRow[];
  batchJobId: string;
}

export function AttributionTable({ attributions, batchJobId }: AttributionTableProps) {
  const totalRevenue = attributions.reduce((sum, row) => sum + row.revenue, 0);
  const totalConversions = attributions.reduce((sum, row) => sum + row.jobsWon, 0);

  const handleExportCsv = () => {
    const headers = [
      "Source",
      "Scans",
      "Inspections",
      "Leads",
      "Claims",
      "Jobs Won",
      "Revenue",
      "Conversion Rate",
    ];
    const rows = attributions.map((row) => [
      row.source,
      row.scans,
      row.inspections,
      row.leads,
      row.claims,
      row.jobsWon,
      row.revenue.toFixed(2),
      `${row.conversionRate.toFixed(1)}%`,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attribution-report-${batchJobId}.csv`;
    a.click();
  };

  const getSourceBadge = (source: string) => {
    const colors: Record<string, string> = {
      qr: "bg-blue-600",
      mailer: "bg-purple-600",
      ad: "bg-orange-600",
      organic: "bg-green-600",
      direct: "bg-gray-600",
    };
    return (
      <Badge className={colors[source] || "bg-gray-600"}>
        {source.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Attribution & Revenue
            </CardTitle>
            <CardDescription>Performance breakdown by source</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportCsv}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border bg-green-50 p-4 dark:bg-green-950/20">
            <div className="mb-2 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Total Revenue</span>
            </div>
            <p className="text-3xl font-bold">${totalRevenue.toLocaleString()}</p>
          </div>

          <div className="rounded-lg border bg-blue-50 p-4 dark:bg-blue-950/20">
            <div className="mb-2 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Jobs Won</span>
            </div>
            <p className="text-3xl font-bold">{totalConversions}</p>
          </div>
        </div>

        {/* Attribution Table */}
        {attributions.length === 0 ? (
          <div className="py-12 text-center">
            <TrendingUp className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
            <h4 className="mb-1 font-semibold">No Attribution Data Yet</h4>
            <p className="text-sm text-muted-foreground">
              Data will appear as conversions are tracked through the system.
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Scans</TableHead>
                  <TableHead className="text-right">Inspections</TableHead>
                  <TableHead className="text-right">Leads</TableHead>
                  <TableHead className="text-right">Claims</TableHead>
                  <TableHead className="text-right">Jobs Won</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Conv. Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attributions.map((row) => (
                  <TableRow key={row.source}>
                    <TableCell>{getSourceBadge(row.source)}</TableCell>
                    <TableCell className="text-right font-medium">{row.scans}</TableCell>
                    <TableCell className="text-right">{row.inspections}</TableCell>
                    <TableCell className="text-right">{row.leads}</TableCell>
                    <TableCell className="text-right">{row.claims}</TableCell>
                    <TableCell className="text-right font-bold text-green-600">
                      {row.jobsWon}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      ${row.revenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{row.conversionRate.toFixed(1)}%</Badge>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Totals Row */}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell>TOTAL</TableCell>
                  <TableCell className="text-right">
                    {attributions.reduce((sum, row) => sum + row.scans, 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {attributions.reduce((sum, row) => sum + row.inspections, 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {attributions.reduce((sum, row) => sum + row.leads, 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {attributions.reduce((sum, row) => sum + row.claims, 0)}
                  </TableCell>
                  <TableCell className="text-right text-green-600">{totalConversions}</TableCell>
                  <TableCell className="text-right">${totalRevenue.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    {attributions.reduce((sum, row) => sum + row.scans, 0) > 0
                      ? (
                          (totalConversions /
                            attributions.reduce((sum, row) => sum + row.scans, 0)) *
                          100
                        ).toFixed(1)
                      : "0.0"}
                    %
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
