export default function UserOverviewLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="h-5 w-36 rounded bg-border/60" />
        <div className="mt-3 h-8 w-80 max-w-full rounded bg-border/60" />
        <div className="mt-2 h-4 w-96 max-w-full rounded bg-border/50" />
      </section>

      <section className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={`stat-${i}`} className="h-24 rounded-2xl border border-border bg-card" />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="h-72 rounded-2xl border border-border bg-card xl:col-span-2" />
        <div className="h-72 rounded-2xl border border-border bg-card" />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-48 rounded-2xl border border-border bg-card" />
        <div className="h-48 rounded-2xl border border-border bg-card" />
      </section>
    </div>
  );
}
