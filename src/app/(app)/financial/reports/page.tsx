"use client";

import { useUser } from "@clerk/nextjs";
import { Calendar,DollarSign, Download, TrendingDown, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/StatCard";

export default function FinancialReportsPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const [reportType, setReportType] = useState("profit-loss");
  const [dateRange, setDateRange] = useState("ytd");

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-[color:var(--text)]">
            Financial Reporting Suite
          </h1>
          <p className="text-gray-600">P&L, cash flow, balance sheets, and forecasting</p>
        </div>
        <Button className="gap-2">
          <Download className="h-5 w-5" />
          Export Report
        </Button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 rounded-lg bg-white p-4 shadow dark:bg-slate-800">
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="rounded-lg border px-4 py-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          <option value="profit-loss">Profit & Loss</option>
          <option value="cash-flow">Cash Flow</option>
          <option value="balance-sheet">Balance Sheet</option>
          <option value="forecast">Forecast</option>
        </select>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="rounded-lg border px-4 py-2"
        >
          <option value="mtd">Month to Date</option>
          <option value="qtd">Quarter to Date</option>
          <option value="ytd">Year to Date</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          variant="gradient"
          gradientColor="success"
          label="Total Revenue"
          value="$328,450"
          icon={<TrendingUp className="h-5 w-5" />}
          description="+12.3% vs last period"
        />

        <StatCard
          variant="gradient"
          gradientColor="error"
          label="Total Expenses"
          value="$198,230"
          icon={<TrendingDown className="h-5 w-5" />}
          description="+5.2% vs last period"
        />

        <StatCard
          variant="gradient"
          gradientColor="blue"
          label="Net Profit"
          value="$130,220"
          icon={<DollarSign className="h-5 w-5" />}
          description="39.7% margin"
        />

        <StatCard
          variant="gradient"
          gradientColor="purple"
          label="Cash Balance"
          value="$245,600"
          icon={<Calendar className="h-5 w-5" />}
          description="As of today"
        />
      </div>

      {/* Detailed Report */}
      <div className="rounded-lg bg-white shadow dark:bg-slate-800">
        <div className="border-b p-6 dark:border-slate-700">
          <h2 className="text-xl font-bold dark:text-slate-100">Profit & Loss Statement</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-900">
                \n{" "}
                <tr>
                  \n{" "}
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-slate-300">
                    Account
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Amount</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr className="bg-blue-50 font-semibold">
                  <td className="px-4 py-3">Revenue</td>
                  <td className="px-4 py-3 text-right">$328,450</td>
                  <td className="px-4 py-3 text-right">100%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 pl-8">Job Revenue</td>
                  <td className="px-4 py-3 text-right">$312,000</td>
                  <td className="px-4 py-3 text-right">95%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 pl-8">Other Income</td>
                  <td className="px-4 py-3 text-right">$16,450</td>
                  <td className="px-4 py-3 text-right">5%</td>
                </tr>
                <tr className="bg-red-50 font-semibold">
                  <td className="px-4 py-3">Expenses</td>
                  <td className="px-4 py-3 text-right">$198,230</td>
                  <td className="px-4 py-3 text-right">60.4%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 pl-8">Labor</td>
                  <td className="px-4 py-3 text-right">$89,400</td>
                  <td className="px-4 py-3 text-right">27.2%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 pl-8">Materials</td>
                  <td className="px-4 py-3 text-right">$67,830</td>
                  <td className="px-4 py-3 text-right">20.7%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 pl-8">Equipment</td>
                  <td className="px-4 py-3 text-right">$23,000</td>
                  <td className="px-4 py-3 text-right">7.0%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 pl-8">Other</td>
                  <td className="px-4 py-3 text-right">$18,000</td>
                  <td className="px-4 py-3 text-right">5.5%</td>
                </tr>
                <tr className="bg-green-50 font-bold">
                  <td className="px-4 py-3">Net Profit</td>
                  <td className="px-4 py-3 text-right text-green-600">$130,220</td>
                  <td className="px-4 py-3 text-right text-green-600">39.7%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
