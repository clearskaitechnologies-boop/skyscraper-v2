/**
 * TASK 177: MONITORING DASHBOARDS
 *
 * Real-time system monitoring with customizable dashboards.
 */

import prisma from "@/lib/prisma";

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  refreshInterval: number;
  createdBy: string;
}

export interface DashboardWidget {
  id: string;
  type: "METRIC" | "CHART" | "TABLE" | "LOG" | "ALERT" | "MAP";
  title: string;
  config: WidgetConfig;
  position: { x: number; y: number; w: number; h: number };
}

export interface WidgetConfig {
  query?: string;
  metricName?: string;
  timeRange?: number;
  chartType?: "LINE" | "BAR" | "PIE" | "GAUGE";
  thresholds?: { warning: number; critical: number };
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  gap: number;
}

/**
 * Create dashboard
 */
export async function createDashboard(data: {
  name: string;
  description: string;
  userId: string;
  refreshInterval?: number;
}): Promise<string> {
  const dashboard = await prisma.dashboard.create({
    data: {
      name: data.name,
      description: data.description,
      widgets: [],
      layout: { columns: 12, rows: 12, gap: 16 } as any,
      refreshInterval: data.refreshInterval || 30,
      createdBy: data.userId,
    } as any,
  });

  return dashboard.id;
}

/**
 * Add widget to dashboard
 */
export async function addWidget(
  dashboardId: string,
  widget: Omit<DashboardWidget, "id">
): Promise<string> {
  const dashboard = await prisma.dashboard.findUnique({
    where: { id: dashboardId },
  });

  if (!dashboard) {
    throw new Error("Dashboard not found");
  }

  const newWidget: DashboardWidget = {
    ...widget,
    id: `widget_${crypto.randomUUID().slice(0, 8)}`,
  };

  const widgets = [...(dashboard.widgets as DashboardWidget[]), newWidget];

  await prisma.dashboard.update({
    where: { id: dashboardId },
    data: { widgets: widgets as any } as any,
  });

  return newWidget.id;
}

/**
 * Get dashboard data
 */
export async function getDashboardData(dashboardId: string): Promise<{
  dashboard: Dashboard;
  widgetData: Record<string, any>;
}> {
  const dashboard = await prisma.dashboard.findUnique({
    where: { id: dashboardId },
  });

  if (!dashboard) {
    throw new Error("Dashboard not found");
  }

  const widgets = dashboard.widgets as DashboardWidget[];
  const widgetData: Record<string, any> = {};

  // Fetch data for each widget
  for (const widget of widgets) {
    widgetData[widget.id] = await fetchWidgetData(widget);
  }

  return {
    dashboard: dashboard as any,
    widgetData,
  };
}

/**
 * Fetch widget data
 */
async function fetchWidgetData(widget: DashboardWidget): Promise<any> {
  switch (widget.type) {
    case "METRIC":
      return fetchMetricData(widget.config);

    case "CHART":
      return fetchChartData(widget.config);

    case "TABLE":
      return fetchTableData(widget.config);

    case "LOG":
      return fetchLogData(widget.config);

    case "ALERT":
      return fetchAlertData();

    case "MAP":
      return fetchMapData();

    default:
      return null;
  }
}

/**
 * Fetch metric data
 */
async function fetchMetricData(config: WidgetConfig): Promise<any> {
  if (!config.metricName) return null;

  const timeRange = config.timeRange || 3600;
  const since = new Date(Date.now() - timeRange * 1000);

  const metrics = await prisma.metric.findMany({
    where: {
      name: config.metricName,
      timestamp: { gte: since },
    },
    orderBy: { timestamp: "desc" },
    take: 1,
  });

  return {
    value: metrics[0]?.value || 0,
    timestamp: metrics[0]?.timestamp || new Date(),
  };
}

/**
 * Fetch chart data
 */
async function fetchChartData(config: WidgetConfig): Promise<any> {
  if (!config.metricName) return null;

  const timeRange = config.timeRange || 3600;
  const since = new Date(Date.now() - timeRange * 1000);

  const metrics = await prisma.metric.findMany({
    where: {
      name: config.metricName,
      timestamp: { gte: since },
    },
    orderBy: { timestamp: "asc" },
  });

  return {
    labels: metrics.map((m) => m.timestamp),
    values: metrics.map((m) => m.value),
  };
}

/**
 * Fetch table data
 */
async function fetchTableData(config: WidgetConfig): Promise<any> {
  // TODO: Execute custom query
  return {
    columns: ["Name", "Value", "Status"],
    rows: [
      ["Service A", "100", "Healthy"],
      ["Service B", "95", "Healthy"],
      ["Service C", "50", "Warning"],
    ],
  };
}

/**
 * Fetch log data
 */
async function fetchLogData(config: WidgetConfig): Promise<any> {
  const logs = await prisma.logEntry.findMany({
    orderBy: { timestamp: "desc" },
    take: 50,
  });

  return logs.map((log) => ({
    timestamp: log.timestamp,
    level: log.level,
    message: log.message,
  }));
}

/**
 * Fetch alert data
 */
async function fetchAlertData(): Promise<any> {
  const alerts = await prisma.alert.findMany({
    where: { status: { in: ["FIRING", "ACKNOWLEDGED"] } },
    orderBy: { firedAt: "desc" },
    take: 10,
  });

  return alerts.map((alert) => ({
    severity: alert.severity,
    message: alert.message,
    firedAt: alert.firedAt,
  }));
}

/**
 * Fetch map data
 */
async function fetchMapData(): Promise<any> {
  // TODO: Get geographic distribution
  return {
    locations: [
      { region: "us-east-1", lat: 39.0, lon: -77.0, load: 75 },
      { region: "eu-west-1", lat: 53.0, lon: -8.0, load: 60 },
      { region: "ap-southeast-1", lat: 1.3, lon: 103.8, load: 85 },
    ],
  };
}

/**
 * Update widget position
 */
export async function updateWidgetPosition(
  dashboardId: string,
  widgetId: string,
  position: DashboardWidget["position"]
): Promise<void> {
  const dashboard = await prisma.dashboard.findUnique({
    where: { id: dashboardId },
  });

  if (!dashboard) return;

  const widgets = (dashboard.widgets as DashboardWidget[]).map((w) =>
    w.id === widgetId ? { ...w, position } : w
  );

  await prisma.dashboard.update({
    where: { id: dashboardId },
    data: { widgets: widgets as any } as any,
  });
}

/**
 * Clone dashboard
 */
export async function cloneDashboard(dashboardId: string, userId: string): Promise<string> {
  const source = await prisma.dashboard.findUnique({
    where: { id: dashboardId },
  });

  if (!source) {
    throw new Error("Dashboard not found");
  }

  const clone = await prisma.dashboard.create({
    data: {
      name: `${source.name} (Copy)`,
      description: source.description,
      widgets: source.widgets,
      layout: source.layout,
      refreshInterval: source.refreshInterval,
      createdBy: userId,
    } as any,
  });

  return clone.id;
}
