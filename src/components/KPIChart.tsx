import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const KPIChart = () => {
  const data = [
    { month: "Jan", revenue: 45000, projects: 8 },
    { month: "Feb", revenue: 52000, projects: 10 },
    { month: "Mar", revenue: 48000, projects: 9 },
    { month: "Apr", revenue: 61000, projects: 12 },
    { month: "May", revenue: 73000, projects: 14 },
    { month: "Jun", revenue: 127000, projects: 18 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue & Projects</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              name="Revenue ($)"
            />
            <Line
              type="monotone"
              dataKey="projects"
              stroke="hsl(var(--accent))"
              strokeWidth={2}
              name="Projects"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default KPIChart;
