interface PieSlice {
  label: string;
  value: number;
  color: string;
}

export function PieChart({ data, size = 180 }: { data: PieSlice[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = size / 2 - 10;
  const cx = size / 2;
  const cy = size / 2;
  let cumulative = 0;

  const slices = data.map((d) => {
    const fraction = d.value / total;
    const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    cumulative += fraction;
    const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const largeArc = fraction > 0.5 ? 1 : 0;

    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    const midAngle = (startAngle + endAngle) / 2;
    const labelX = cx + (radius * 0.65) * Math.cos(midAngle);
    const labelY = cy + (radius * 0.65) * Math.sin(midAngle);

    return { ...d, path, fraction, labelX, labelY };
  });

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s, i) => (
          <g key={i}>
            <path d={s.path} fill={s.color} stroke="white" strokeWidth={2} />
            {s.fraction > 0.08 && (
              <text
                x={s.labelX}
                y={s.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-white text-xs font-bold"
              >
                {Math.round(s.fraction * 100)}%
              </text>
            )}
          </g>
        ))}
      </svg>
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="h-3 w-3 rounded-sm" style={{ background: d.color }} />
            <span className="font-medium text-slate-700">{d.label}</span>
            <span className="text-slate-400">({d.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
