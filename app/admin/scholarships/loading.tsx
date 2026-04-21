export default function AdminScholarshipsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="h-7 w-60 rounded bg-border/60" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-border/50" />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`scholarship-kpi-${i}`} className="h-28 rounded-2xl border border-border bg-card" />
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={`scholarship-row-${i}`} className="h-20 rounded-xl bg-border/50" />
        ))}
      </section>
    </div>
  );
}
