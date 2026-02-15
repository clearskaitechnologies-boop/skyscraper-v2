"use client";
import { Line, LineChart, ResponsiveContainer } from "recharts";

export default function SparkLine({ data }: { data: { x: number; y: number }[] }) {
  return (
    <div className="h-32">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="y" stroke="#0ea5e9" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
