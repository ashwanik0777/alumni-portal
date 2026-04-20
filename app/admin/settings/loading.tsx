export default function AdminSettingsLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="h-5 w-48 rounded bg-border/60" />
        <div className="mt-3 h-8 w-80 rounded bg-border/60" />
      </section>

      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={`tab-${i}`} className="h-9 rounded-xl bg-border/50" />
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-border bg-card p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`field-left-${i}`} className="h-11 rounded-xl bg-border/50" />
          ))}
        </article>
        <article className="rounded-2xl border border-border bg-card p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`field-right-${i}`} className="h-11 rounded-xl bg-border/50" />
          ))}
        </article>
      </section>
    </div>
  );
}
