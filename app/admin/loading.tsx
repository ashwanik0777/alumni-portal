export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="h-5 w-40 rounded bg-border/60" />
        <div className="mt-3 h-8 w-64 rounded bg-border/60" />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={`admin-top-${i}`} className="h-28 rounded-2xl border border-border bg-card" />
        ))}
      </section>

      <section className="h-64 rounded-2xl border border-border bg-card" />
    </div>
  );
}
