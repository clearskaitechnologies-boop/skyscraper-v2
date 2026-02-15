export function ZeroLine() {
  // Simple SVG line chart with zeros across Jan–Dec
  const width = 600;
  const height = 140;
  const pad = 24;
  const xStep = (width - pad * 2) / 11;
  const yZero = height - pad - 1;
  const points = new Array(12)
    .fill(0)
    .map((_, i) => `${pad + i * xStep},${yZero}`)
    .join(" ");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    <div className="w-full overflow-x-auto">
      <svg width={width} height={height} className="text-muted-foreground">
        <line
          x1={pad}
          y1={yZero}
          x2={width - pad}
          y2={yZero}
          stroke="currentColor"
          strokeWidth="1"
        />
        <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" />
        {months.map((m, i) => (
          <text
            key={m}
            x={pad + i * xStep}
            y={height - 4}
            fontSize="10"
            textAnchor="middle"
            className="fill-muted-foreground"
          >
            {m}
          </text>
        ))}
        <text x={pad} y={12} fontSize="12" className="fill-foreground">
          Revenue & Projects
        </text>
      </svg>
      <p className="mt-2 text-xs text-muted-foreground">Data populates as you create work.</p>
    </div>
  );
}
