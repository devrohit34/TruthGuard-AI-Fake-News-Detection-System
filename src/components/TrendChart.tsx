interface TrendPoint {
  label: string;
  fake: number;
  real: number;
}

export function TrendChart({ data, height = 200 }: { data: TrendPoint[]; height?: number }) {
  const width = 600;
  const padding = { top: 20, right: 20, bottom: 30, left: 30 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const max = Math.max(...data.flatMap((d) => [d.fake, d.real]), 1);

  const xStep = data.length > 1 ? chartW / (data.length - 1) : 0;

  const toX = (i: number) => padding.left + i * xStep;
  const toY = (v: number) => padding.top + chartH - (v / max) * chartH;

  const fakePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(d.fake)}`).join(' ');
  const realPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(d.real)}`).join(' ');

  const fakeArea = `${fakePath} L ${toX(data.length - 1)} ${padding.top + chartH} L ${toX(0)} ${padding.top + chartH} Z`;
  const realArea = `${realPath} L ${toX(data.length - 1)} ${padding.top + chartH} L ${toX(0)} ${padding.top + chartH} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: height }}>
      <defs>
        <linearGradient id="fakeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="realGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((p) => (
        <line
          key={p}
          x1={padding.left}
          y1={padding.top + chartH * p}
          x2={padding.left + chartW}
          y2={padding.top + chartH * p}
          stroke="#e2e8f0"
          strokeWidth={1}
        />
      ))}

      <path d={fakeArea} fill="url(#fakeGrad)" />
      <path d={realArea} fill="url(#realGrad)" />
      <path d={fakePath} fill="none" stroke="#ef4444" strokeWidth={2.5} strokeLinejoin="round" />
      <path d={realPath} fill="none" stroke="#22c55e" strokeWidth={2.5} strokeLinejoin="round" />

      {data.map((d, i) => (
        <g key={i}>
          <circle cx={toX(i)} cy={toY(d.fake)} r={3.5} fill="#ef4444" stroke="white" strokeWidth={1.5} />
          <circle cx={toX(i)} cy={toY(d.real)} r={3.5} fill="#22c55e" stroke="white" strokeWidth={1.5} />
          <text x={toX(i)} y={height - 8} textAnchor="middle" className="fill-slate-500 text-[10px]">
            {d.label}
          </text>
        </g>
      ))}

      <g transform={`translate(${width - 110}, 10)`}>
        <rect width={100} height={36} rx={6} fill="white" stroke="#e2e8f0" />
        <circle cx={12} cy={13} r={4} fill="#ef4444" />
        <text x={22} y={16} className="fill-slate-600 text-[10px]">Fake</text>
        <circle cx={12} cy={27} r={4} fill="#22c55e" />
        <text x={22} y={30} className="fill-slate-600 text-[10px]">Real</text>
      </g>
    </svg>
  );
}
