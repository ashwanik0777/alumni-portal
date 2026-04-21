export default function AdminEventsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="h-7 w-56 rounded bg-border/60" />
        <div className="mt-3 h-4 w-80 max-w-full rounded bg-border/50" />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={`event-kpi-${i}`} className="h-28 rounded-2xl border border-border bg-card" />
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={`event-row-${i}`} className="h-16 rounded-xl bg-border/50" />
        ))}
      </section>
    </div>
  );
}
