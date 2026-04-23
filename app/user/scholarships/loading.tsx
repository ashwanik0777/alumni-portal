export default function UserScholarshipsLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="h-5 w-40 rounded bg-border/60" />
        <div className="mt-3 h-7 w-72 max-w-full rounded bg-border/60" />
        <div className="mt-3 flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`tab-${i}`} className="h-8 w-32 rounded-lg bg-border/40" />
          ))}
        </div>
      </section>
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`m-${i}`} className="h-16 rounded-lg border border-border bg-card" />
        ))}
      </section>
      <section className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={`row-${i}`} className="h-40 rounded-xl border border-border bg-card" />
        ))}
      </section>
    </div>
  );
}
