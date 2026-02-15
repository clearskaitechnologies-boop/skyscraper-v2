"use client";
import { Cell,Pie, PieChart, ResponsiveContainer } from "recharts";

export function ClaimSummaryPanel({ claim }: { claim: any }) {
  const data = [
    { name: "Accepted Losses", value: claim.accepted, color: "#117CFF" },
    { name: "Pending Losses", value: claim.pending, color: "#00D1FF" },
    { name: "Remaining Reserves", value: claim.reserves, color: "#7cc2ff" },
  ];

  return (
    <div>
      <h2 className="mb-3 text-lg font-medium">Financial Summary</h2>
      <div className="h-48">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={80}
              label
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-center text-sm text-[color:var(--muted)]">
        Exposure ${claim.exposure.toLocaleString()}
      </div>

      <h3 className="mt-6 text-sm font-semibold text-[color:var(--muted)]">
        Policy Terms Standing
      </h3>
      <div className="mt-2 space-y-2">
        {data.map((d) => (
          <div key={d.name}>
            <div className="mb-1 flex justify-between text-xs">
              <span>{d.name}</span>
              <span>${d.value.toLocaleString()}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
              <div
                className="h-2 rounded-full"
                style={{ width: `${(d.value / claim.exposure) * 100}%`, background: d.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
