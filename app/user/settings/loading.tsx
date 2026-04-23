export default function UserSettingsLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="h-5 w-32 rounded bg-border/60" />
        <div className="mt-3 h-7 w-56 max-w-full rounded bg-border/60" />
      </section>
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex gap-2 mb-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`tab-${i}`} className="h-8 w-24 rounded-lg bg-border/40" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`row-${i}`} className="h-12 rounded-lg bg-border/40" />
          ))}
        </div>
      </section>
    </div>
  );
}
