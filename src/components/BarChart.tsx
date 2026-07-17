interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

export function BarChart({ data, height = 200, maxVal }: { data: BarDatum[]; height?: number; maxVal?: number }) {
  const max = maxVal ?? Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="w-full">
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((d, i) => {
          const h = (d.value / max) * (height - 30);
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs font-semibold text-slate-600">{d.value}</span>
              <div
                className="w-full rounded-t-md transition-all duration-500"
                style={{
                  height: Math.max(h, 2),
                  background: d.color ?? '#0f766e',
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-xs text-slate-500">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
