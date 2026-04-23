export default function UserJobsLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="h-5 w-36 rounded bg-border/60" />
        <div className="mt-3 h-7 w-80 max-w-full rounded bg-border/60" />
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`m-${i}`} className="h-16 rounded-lg border border-border bg-background" />
          ))}
        </div>
      </section>
      <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-12">
          <div className="h-10 rounded-lg bg-border/40 lg:col-span-6" />
          <div className="h-10 rounded-lg bg-border/40 lg:col-span-3" />
          <div className="h-10 rounded-lg bg-border/40 lg:col-span-3" />
        </div>
      </section>
      <section className="grid gap-4 xl:grid-cols-3">
        <div className="h-72 rounded-xl border border-border bg-card xl:col-span-2" />
        <div className="h-72 rounded-xl border border-border bg-card" />
      </section>
    </div>
  );
}
