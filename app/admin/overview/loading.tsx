export default function AdminOverviewLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="h-5 w-40 rounded bg-border/60" />
        <div className="mt-3 h-8 w-72 rounded bg-border/60" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-border/50" />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <article key={`overview-stat-${i}`} className="rounded-2xl border border-border bg-card p-5">
            <div className="h-10 w-10 rounded-xl bg-border/60" />
            <div className="mt-4 h-6 w-24 rounded bg-border/60" />
            <div className="mt-2 h-4 w-32 rounded bg-border/50" />
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <article className="rounded-2xl border border-border bg-card p-5 xl:col-span-2 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`feed-${i}`} className="h-16 rounded-xl bg-border/50" />
          ))}
        </article>

        <article className="rounded-2xl border border-border bg-card p-5 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`action-${i}`} className="h-11 rounded-xl bg-border/50" />
          ))}
        </article>
      </section>
    </div>
  );
}
