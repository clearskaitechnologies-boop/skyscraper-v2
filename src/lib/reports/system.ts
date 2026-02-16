/**
 * TASK 81: ADVANCED REPORTING SYSTEM
 *
 * Report generation, scheduling, distribution, and customization.
 * Supports multiple formats, templates, and automated delivery.
 */

import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

// Report Types
export type ReportType =
  | "CLAIMS_SUMMARY"
  | "JOBS_STATUS"
  | "FINANCIAL"
  | "PERFORMANCE"
  | "COMPLIANCE"
  | "CUSTOM";

export type ReportFormat = "PDF" | "EXCEL" | "CSV" | "HTML" | "JSON";

export type ReportScheduleFrequency =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "YEARLY"
  | "ON_DEMAND";

interface ReportConfig {
  type: ReportType;
  format: ReportFormat;
  title: string;
  description?: string;
  filters?: Record<string, any>;
  groupBy?: string[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  includeCharts?: boolean;
  includeRawData?: boolean;
}

interface ReportSchedule {
  frequency: ReportScheduleFrequency;
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  time: string; // HH:mm format
  timezone: string;
  recipients: string[]; // Email addresses
  active: boolean;
}

interface ReportData {
  summary: Record<string, any>;
  data: any[];
  charts?: ChartData[];
  metadata: {
    generatedAt: Date;
    generatedBy: string;
    period: { start: Date; end: Date };
    filters: Record<string, any>;
  };
}

interface ChartData {
  type: "bar" | "line" | "pie" | "area" | "scatter";
  title: string;
  data: any[];
  xAxis?: string;
  yAxis?: string;
  series?: string[];
}

/**
 * Generate report based on configuration
 */
export async function generateReport(
  config: ReportConfig,
  organizationId: string,
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<ReportData> {
  const period = {
    start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: endDate || new Date(),
  };

  let reportData: ReportData;

  switch (config.type) {
    case "CLAIMS_SUMMARY":
      reportData = await generateClaimsSummaryReport(organizationId, period, config.filters);
      break;
    case "JOBS_STATUS":
      reportData = await generateJobsStatusReport(organizationId, period, config.filters);
      break;
    case "FINANCIAL":
      reportData = await generateFinancialReport(organizationId, period, config.filters);
      break;
    case "PERFORMANCE":
      reportData = await generatePerformanceReport(organizationId, period, config.filters);
      break;
    case "COMPLIANCE":
      reportData = await generateComplianceReport(organizationId, period);
      break;
    case "CUSTOM":
      reportData = await generateCustomReport(organizationId, period, config);
      break;
    default:
      throw new Error(`Unsupported report type: ${config.type}`);
  }

  // Store report in database
  await prisma.report.create({
    data: {
      organizationId,
      userId,
      type: config.type,
      format: config.format,
      title: config.title,
      description: config.description,
      data: reportData as any,
      filters: config.filters || {},
      startDate: period.start,
      endDate: period.end,
      generatedAt: new Date(),
    },
  });

  return reportData;
}

/**
 * Generate Claims Summary Report
 */
async function generateClaimsSummaryReport(
  organizationId: string,
  period: { start: Date; end: Date },
  filters?: Record<string, any>
): Promise<ReportData> {
  const whereClause: any = {
    organizationId,
    createdAt: { gte: period.start, lte: period.end },
  };

  if (filters?.status) whereClause.status = filters.status;
  if (filters?.type) whereClause.claimType = filters.type;

  const claims = await prisma.claims.findMany({
    where: whereClause,
    include: {
      jobs: true,
      documents: true,
    },
  });

  const summary = {
    totalClaims: claims.length,
    byStatus: {} as Record<string, number>,
    byType: {} as Record<string, number>,
    totalValue: 0,
    avgProcessingTime: 0,
    completionRate: 0,
  };

  claims.forEach((claim) => {
    summary.byStatus[claim.status] = (summary.byStatus[claim.status] || 0) + 1;
    summary.byType[claim.claimType || "Unknown"] =
      (summary.byType[claim.claimType || "Unknown"] || 0) + 1;
    summary.totalValue += Number(claim.estimatedValue || 0);
  });

  const completedClaims = claims.filter((c) => c.status === "CLOSED");
  summary.completionRate = (completedClaims.length / claims.length) * 100;

  const charts: ChartData[] = [
    {
      type: "pie",
      title: "Claims by Status",
      data: Object.entries(summary.byStatus).map(([status, count]) => ({
        label: status,
        value: count,
      })),
    },
    {
      type: "bar",
      title: "Claims by Type",
      data: Object.entries(summary.byType).map(([type, count]) => ({
        label: type,
        value: count,
      })),
    },
  ];

  return {
    summary,
    data: claims,
    charts,
    metadata: {
      generatedAt: new Date(),
      generatedBy: "system",
      period,
      filters: filters || {},
    },
  };
}

/**
 * Generate Jobs Status Report
 */
async function generateJobsStatusReport(
  organizationId: string,
  period: { start: Date; end: Date },
  filters?: Record<string, any>
): Promise<ReportData> {
  const jobs = await prisma.job.findMany({
    where: {
      organizationId,
      createdAt: { gte: period.start, lte: period.end },
    },
    include: {
      claim: true,
      tasks: true,
    },
  });

  const summary = {
    totalJobs: jobs.length,
    byPhase: {} as Record<string, number>,
    activeJobs: 0,
    completedJobs: 0,
    avgCompletionTime: 0,
    totalRevenue: 0,
  };

  jobs.forEach((job) => {
    summary.byPhase[job.phase] = (summary.byPhase[job.phase] || 0) + 1;
    if (job.status === "ACTIVE") summary.activeJobs++;
    if (job.status === "COMPLETED") summary.completedJobs++;
    summary.totalRevenue += Number(job.estimatedCost || 0);
  });

  const charts: ChartData[] = [
    {
      type: "bar",
      title: "Jobs by Phase",
      data: Object.entries(summary.byPhase).map(([phase, count]) => ({
        label: phase,
        value: count,
      })),
    },
  ];

  return {
    summary,
    data: jobs,
    charts,
    metadata: {
      generatedAt: new Date(),
      generatedBy: "system",
      period,
      filters: filters || {},
    },
  };
}

/**
 * Generate Financial Report
 */
async function generateFinancialReport(
  organizationId: string,
  period: { start: Date; end: Date },
  filters?: Record<string, any>
): Promise<ReportData> {
  const invoices = await prisma.invoice.findMany({
    where: {
      organizationId,
      createdAt: { gte: period.start, lte: period.end },
    },
  });

  const payments = await prisma.payment.findMany({
    where: {
      organizationId,
      createdAt: { gte: period.start, lte: period.end },
    },
  });

  const summary = {
    totalInvoices: invoices.length,
    totalInvoiced: invoices.reduce((sum, inv) => sum + Number(inv.amount), 0),
    totalPaid: payments.reduce((sum, pay) => sum + Number(pay.amount), 0),
    outstandingBalance: 0,
    avgInvoiceValue: 0,
  };

  summary.outstandingBalance = summary.totalInvoiced - summary.totalPaid;
  summary.avgInvoiceValue = summary.totalInvoiced / invoices.length;

  return {
    summary,
    data: { invoices, payments },
    metadata: {
      generatedAt: new Date(),
      generatedBy: "system",
      period,
      filters: filters || {},
    },
  };
}

/**
 * Generate Performance Report
 */
async function generatePerformanceReport(
  organizationId: string,
  period: { start: Date; end: Date }
): Promise<ReportData> {
  const users = await prisma.users.findMany({
    where: {
      userOrganizations: {
        some: { organizationId },
      },
    },
  });

  const tasks = await prisma.task.findMany({
    where: {
      organizationId,
      createdAt: { gte: period.start, lte: period.end },
    },
  });

  const summary = {
    totalUsers: users.length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t) => t.status === "COMPLETED").length,
    avgCompletionRate: 0,
    topPerformers: [] as { userId: string; tasksCompleted: number }[],
  };

  summary.avgCompletionRate = (summary.completedTasks / summary.totalTasks) * 100;

  return {
    summary,
    data: { users, tasks },
    metadata: {
      generatedAt: new Date(),
      generatedBy: "system",
      period,
      filters: {},
    },
  };
}

/**
 * Generate Compliance Report
 */
async function generateComplianceReport(
  organizationId: string,
  period: { start: Date; end: Date }
): Promise<ReportData> {
  // Get audit logs for compliance
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      organizationId,
      createdAt: { gte: period.start, lte: period.end },
    },
  });

  const summary = {
    totalActions: auditLogs.length,
    byAction: {} as Record<string, number>,
    securityEvents: 0,
    dataAccessEvents: 0,
  };

  auditLogs.forEach((log) => {
    summary.byAction[log.action] = (summary.byAction[log.action] || 0) + 1;
    if (["LOGIN", "LOGOUT", "PASSWORD_CHANGE"].includes(log.action)) {
      summary.securityEvents++;
    }
    if (["VIEW", "EXPORT"].includes(log.action)) {
      summary.dataAccessEvents++;
    }
  });

  return {
    summary,
    data: auditLogs,
    metadata: {
      generatedAt: new Date(),
      generatedBy: "system",
      period,
      filters: {},
    },
  };
}

/**
 * Generate Custom Report
 */
async function generateCustomReport(
  organizationId: string,
  period: { start: Date; end: Date },
  config: ReportConfig
): Promise<ReportData> {
  // Custom report logic based on filters and groupBy
  const summary = {
    message: "Custom report generated",
  };

  return {
    summary,
    data: [],
    metadata: {
      generatedAt: new Date(),
      generatedBy: "system",
      period,
      filters: config.filters || {},
    },
  };
}

/**
 * Schedule recurring report
 */
export async function scheduleReport(
  config: ReportConfig,
  schedule: ReportSchedule,
  organizationId: string,
  userId: string
): Promise<string> {
  const reportSchedule = await prisma.reportSchedule.create({
    data: {
      organizationId,
      userId,
      type: config.type,
      format: config.format,
      title: config.title,
      description: config.description,
      config: config as any,
      frequency: schedule.frequency,
      dayOfWeek: schedule.dayOfWeek,
      dayOfMonth: schedule.dayOfMonth,
      time: schedule.time,
      timezone: schedule.timezone,
      recipients: schedule.recipients,
      active: schedule.active,
      nextRun: calculateNextRun(schedule),
    },
  });

  return reportSchedule.id;
}

/**
 * Calculate next run time for scheduled report
 */
function calculateNextRun(schedule: ReportSchedule): Date {
  const now = new Date();
  const [hours, minutes] = schedule.time.split(":").map(Number);

  const nextRun = new Date(now);
  nextRun.setHours(hours, minutes, 0, 0);

  switch (schedule.frequency) {
    case "DAILY":
      if (nextRun <= now) nextRun.setDate(nextRun.getDate() + 1);
      break;
    case "WEEKLY":
      nextRun.setDate(nextRun.getDate() + ((7 + (schedule.dayOfWeek || 0) - nextRun.getDay()) % 7));
      if (nextRun <= now) nextRun.setDate(nextRun.getDate() + 7);
      break;
    case "MONTHLY":
      nextRun.setDate(schedule.dayOfMonth || 1);
      if (nextRun <= now) nextRun.setMonth(nextRun.getMonth() + 1);
      break;
    case "QUARTERLY":
      nextRun.setMonth(Math.floor(nextRun.getMonth() / 3) * 3);
      nextRun.setDate(1);
      if (nextRun <= now) nextRun.setMonth(nextRun.getMonth() + 3);
      break;
    case "YEARLY":
      nextRun.setMonth(0, 1);
      if (nextRun <= now) nextRun.setFullYear(nextRun.getFullYear() + 1);
      break;
  }

  return nextRun;
}

/**
 * Execute scheduled reports
 */
export async function runScheduledReports(): Promise<void> {
  const dueReports = await prisma.reportSchedule.findMany({
    where: {
      active: true,
      nextRun: { lte: new Date() },
    },
  });

  for (const schedule of dueReports) {
    try {
      const reportData = await generateReport(
        schedule.config as any,
        schedule.orgId,
        schedule.userId
      );

      // Send report to recipients
      await distributeReport(schedule, reportData);

      // Update next run time
      await prisma.reportSchedule.update({
        where: { id: schedule.id },
        data: {
          lastRun: new Date(),
          nextRun: calculateNextRun(schedule as any),
        },
      });
    } catch (error) {
      logger.error(`Failed to run scheduled report ${schedule.id}:`, error);
    }
  }
}

/**
 * Distribute report to recipients
 */
async function distributeReport(schedule: any, reportData: ReportData): Promise<void> {
  // TODO: Implement email sending
  logger.debug(`Distributing report to: ${schedule.recipients.join(", ")}`);
}

/**
 * Export report to file
 */
export async function exportReport(reportData: ReportData, format: ReportFormat): Promise<Buffer> {
  switch (format) {
    case "JSON":
      return Buffer.from(JSON.stringify(reportData, null, 2));
    case "CSV":
      return exportToCSV(reportData);
    case "PDF":
      return exportToPDF(reportData);
    case "EXCEL":
      return exportToExcel(reportData);
    case "HTML":
      return exportToHTML(reportData);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function exportToCSV(reportData: ReportData): Buffer {
  // Simple CSV export
  const rows = reportData.data.map((row: any) => Object.values(row).join(","));
  const csv = [Object.keys(reportData.data[0] || {}).join(","), ...rows].join("\n");
  return Buffer.from(csv);
}

function exportToPDF(reportData: ReportData): Buffer {
  // TODO: Implement PDF generation with puppeteer
  return Buffer.from("PDF generation not implemented");
}

function exportToExcel(reportData: ReportData): Buffer {
  // TODO: Implement Excel export with xlsx
  return Buffer.from("Excel export not implemented");
}

function exportToHTML(reportData: ReportData): Buffer {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Report Summary</h1>
        <pre>${JSON.stringify(reportData.summary, null, 2)}</pre>
      </body>
    </html>
  `;
  return Buffer.from(html);
}
