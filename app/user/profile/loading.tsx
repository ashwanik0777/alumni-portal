export default function UserProfileLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-border/60" />
          <div>
            <div className="h-6 w-48 rounded bg-border/60" />
            <div className="mt-2 h-4 w-64 rounded bg-border/50" />
          </div>
        </div>
      </section>
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="h-5 w-36 rounded bg-border/60" />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`f-${i}`} className="h-10 rounded-lg bg-border/40" />
          ))}
        </div>
      </section>
    </div>
  );
}
