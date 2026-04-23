"use client";

import { CheckCircle2, Clock3, FileCheck } from "lucide-react";

type Application = {
  name: string;
  scholarship: string;
  status: string;
  date: string;
};

function statusBadge(s: string) {
  if (s === "Completed") return { cls: "border-emerald-200 bg-emerald-50 text-emerald-700", icon: CheckCircle2 };
  if (s === "Verified") return { cls: "border-blue-200 bg-blue-50 text-blue-700", icon: FileCheck };
  return { cls: "border-amber-200 bg-amber-50 text-amber-700", icon: Clock3 };
}

export default function RecentActivity({ applications }: { applications: Application[] }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <h4 className="text-sm font-bold mb-4">Recent Applications</h4>
      {applications.length === 0 ? (
        <p className="text-xs text-text-secondary italic">No recent applications.</p>
      ) : (
        <div className="space-y-3">
          {applications.map((a, i) => {
            const badge = statusBadge(a.status);
            return (
              <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-text-primary truncate">{a.name}</p>
                  <p className="text-[11px] text-text-secondary truncate">{a.scholarship}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${badge.cls}`}>
                    <badge.icon className="h-3 w-3" /> {a.status}
                  </span>
                  <p className="text-[10px] text-text-secondary hidden sm:block">{new Date(a.date).toLocaleDateString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}
