export default function UserMessagesLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="h-5 w-36 rounded bg-border/60" />
        <div className="mt-3 h-7 w-64 max-w-full rounded bg-border/60" />
      </section>
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="h-96 rounded-xl border border-border bg-card" />
        <div className="h-96 rounded-xl border border-border bg-card lg:col-span-2" />
      </section>
    </div>
  );
}
