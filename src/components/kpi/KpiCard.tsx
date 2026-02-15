/**
 * KPI Card component for CRM dashboard
 */
import { Link } from "react-router-dom";

import { Card } from "@/components/ui/card";

interface KpiCardProps {
  title: string;
  value: string | number;
  to: string;
}

export default function KpiCard({ title, value, to }: KpiCardProps) {
  return (
    <Link to={to}>
      <Card className="p-5 transition-shadow hover:shadow-lg">
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="mt-1 text-3xl font-semibold">{value}</div>
        <div className="mt-3 text-xs text-primary underline">View details →</div>
      </Card>
    </Link>
  );
}
