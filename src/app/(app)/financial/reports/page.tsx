"use client";

import { useUser } from "@clerk/nextjs";
import { BarChart3, Calendar, DollarSign, Download, TrendingDown, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHero } from "@/components/layout/PageHero";
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
    <PageContainer maxWidth="7xl">
      <PageHero
        title="Financial Reporting Suite"
        subtitle="P&L, cash flow, balance sheets, and forecasting"
        icon={<BarChart3 className="h-5 w-5" />}
        section="finance"
      >
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </PageHero>

      {/* Controls */}
      <div className="flex items-center gap-4 rounded-2xl border border-slate-200/60 bg-white/80 p-4 shadow-sm backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/60">
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="rounded-xl border border-slate-200/60 bg-white px-4 py-2 text-sm dark:border-slate-700/50 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="profit-loss">Profit & Loss</option>
          <option value="cash-flow">Cash Flow</option>
          <option value="balance-sheet">Balance Sheet</option>
          <option value="forecast">Forecast</option>
        </select>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="rounded-xl border border-slate-200/60 bg-white px-4 py-2 text-sm dark:border-slate-700/50 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="mtd">Month to Date</option>
          <option value="qtd">Quarter to Date</option>
          <option value="ytd">Year to Date</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/60">
        <div className="border-b border-slate-200/60 p-6 dark:border-slate-700/50">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Profit & Loss Statement
          </h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200/40 dark:border-slate-700/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Account
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 dark:divide-slate-700/30">
                <tr className="bg-blue-50/60 font-semibold dark:bg-blue-900/10">
                  <td className="px-4 py-3 text-slate-900 dark:text-slate-100">Revenue</td>
                  <td className="px-4 py-3 text-right text-slate-900 dark:text-slate-100">
                    $328,450
                  </td>
                  <td className="px-4 py-3 text-right text-slate-900 dark:text-slate-100">100%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 pl-8 text-slate-700 dark:text-slate-300">Job Revenue</td>
                  <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                    $312,000
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400">95%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 pl-8 text-slate-700 dark:text-slate-300">
                    Other Income
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                    $16,450
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400">5%</td>
                </tr>
                <tr className="bg-red-50/60 font-semibold dark:bg-red-900/10">
                  <td className="px-4 py-3 text-slate-900 dark:text-slate-100">Expenses</td>
                  <td className="px-4 py-3 text-right text-slate-900 dark:text-slate-100">
                    $198,230
                  </td>
                  <td className="px-4 py-3 text-right text-slate-900 dark:text-slate-100">60.4%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 pl-8 text-slate-700 dark:text-slate-300">Labor</td>
                  <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                    $89,400
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400">27.2%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 pl-8 text-slate-700 dark:text-slate-300">Materials</td>
                  <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                    $67,830
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400">20.7%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 pl-8 text-slate-700 dark:text-slate-300">Equipment</td>
                  <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                    $23,000
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400">7.0%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 pl-8 text-slate-700 dark:text-slate-300">Other</td>
                  <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                    $18,000
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400">5.5%</td>
                </tr>
                <tr className="bg-green-50/60 font-bold dark:bg-green-900/10">
                  <td className="px-4 py-3 text-slate-900 dark:text-slate-100">Net Profit</td>
                  <td className="px-4 py-3 text-right text-green-600 dark:text-green-400">
                    $130,220
                  </td>
                  <td className="px-4 py-3 text-right text-green-600 dark:text-green-400">39.7%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
