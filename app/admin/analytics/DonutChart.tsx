"use client";

type DonutProps = {
  title: string;
  data: { label: string; value: number; color: string }[];
};

export default function DonutChart({ title, data }: DonutProps) {
  const total = data.reduce((a, d) => a + d.value, 0);
  if (total === 0) {
    return (
      <article className="rounded-2xl border border-border bg-card p-5">
        <h4 className="text-sm font-bold mb-4">{title}</h4>
        <p className="text-xs text-text-secondary italic">No data available yet.</p>
      </article>
    );
  }

  // Build conic gradient segments
  let cumulative = 0;
  const segments = data.map((d) => {
    const start = cumulative;
    const pct = (d.value / total) * 100;
    cumulative += pct;
    return { ...d, start, end: cumulative, pct };
  });

  const gradient = segments
    .map((s) => `${s.color} ${s.start.toFixed(1)}% ${s.end.toFixed(1)}%`)
    .join(", ");

  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <h4 className="text-sm font-bold mb-4">{title}</h4>
      <div className="flex items-center gap-6">
        {/* Donut */}
        <div className="relative shrink-0">
          <div className="h-28 w-28 rounded-full" style={{ background: `conic-gradient(${gradient})` }} />
          <div className="absolute inset-3 rounded-full bg-card flex items-center justify-center">
            <p className="text-lg font-black text-text-primary">{total}</p>
          </div>
        </div>
        {/* Legend */}
        <div className="space-y-1.5 flex-1 min-w-0">
          {segments.map((s) => (
            <div key={s.label} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                <p className="text-xs text-text-secondary truncate">{s.label}</p>
              </div>
              <p className="text-xs font-bold text-text-primary shrink-0">{s.value} ({s.pct.toFixed(0)}%)</p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
