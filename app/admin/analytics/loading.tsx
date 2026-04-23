export default function AdminAnalyticsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="h-5 w-44 rounded bg-border/60" />
        <div className="mt-3 h-8 w-72 rounded bg-border/60" />
        <div className="mt-2 h-4 w-96 max-w-full rounded bg-border/50" />
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={`kpi-${i}`} className="h-24 rounded-2xl border border-border bg-card" />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`chart-${i}`} className="h-52 rounded-2xl border border-border bg-card" />
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="h-5 w-48 rounded bg-border/60" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`trend-${i}`} className="h-28 rounded-xl border border-border bg-background" />
          ))}
        </div>
      </section>
    </div>
  );
}
