"use client";

type BarChartProps = {
  title: string;
  data: { label: string; value: number; secondary?: number }[];
  barColor?: string;
  secondaryColor?: string;
  showSecondary?: boolean;
  valuePrefix?: string;
  maxBarWidth?: number;
};

export default function BarChart({ title, data, barColor = "bg-primary", secondaryColor = "bg-secondary", showSecondary, valuePrefix = "", maxBarWidth = 100 }: BarChartProps) {
  const maxVal = Math.max(...data.map((d) => Math.max(d.value, d.secondary || 0)), 1);

  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <h4 className="text-sm font-bold mb-4">{title}</h4>
      {data.length === 0 ? (
        <p className="text-xs text-text-secondary italic">No data available yet.</p>
      ) : (
        <div className="space-y-3">
          {data.map((d) => (
            <div key={d.label}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-text-primary truncate max-w-[60%]">{d.label}</p>
                <p className="text-xs text-text-secondary font-semibold">{valuePrefix}{d.value.toLocaleString("en-IN")}</p>
              </div>
              <div className="h-3 rounded-full bg-border/40 overflow-hidden">
                <div className={`h-full rounded-full ${barColor} transition-all duration-500`}
                  style={{ width: `${Math.max(2, (d.value / maxVal) * maxBarWidth)}%` }} />
              </div>
              {showSecondary && d.secondary !== undefined && (
                <div className="h-2 rounded-full bg-border/30 overflow-hidden mt-1">
                  <div className={`h-full rounded-full ${secondaryColor} transition-all duration-500`}
                    style={{ width: `${Math.max(2, (d.secondary / maxVal) * maxBarWidth)}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
