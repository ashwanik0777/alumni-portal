import {
  Activity,
  ArrowUpRight,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  GraduationCap,
  IndianRupee,
  Users,
} from "lucide-react";
import { type ComponentType } from "react";

type Stat = {
  label: string;
  value: string;
  delta: string;
  icon: ComponentType<{ className?: string }>;
};

const stats: Stat[] = [
  { label: "Registered Alumni", value: "4,284", delta: "+8.2%", icon: Users },
  { label: "Active Mentorship", value: "326", delta: "+5.1%", icon: GraduationCap },
  { label: "Monthly Donations", value: "₹3.4L", delta: "+12.4%", icon: IndianRupee },
  { label: "Weekly Activity", value: "1,942", delta: "+3.6%", icon: Activity },
];

const feed = [
  { title: "25 new alumni profiles approved", time: "10 minutes ago", status: "success" },
  { title: "Mentorship request batch assigned", time: "45 minutes ago", status: "success" },
  { title: "2 profile verification checks pending", time: "1 hour ago", status: "pending" },
  { title: "Monthly donation summary generated", time: "2 hours ago", status: "success" },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">Control Center</p>
            <h2 className="mt-1 text-2xl font-black sm:text-3xl">Welcome back, Admin</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Track community health, approvals, and operations from one workspace.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl border border-border bg-background px-3 py-2 font-semibold">FY 2026</div>
            <div className="rounded-xl border border-border bg-background px-3 py-2 font-semibold">Live Sync</div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <article key={item.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex items-start justify-between">
              <span className="inline-flex rounded-xl bg-primary/10 p-2 text-primary">
                <item.icon className="h-5 w-5" />
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-2.5 py-1 text-xs font-bold text-text-primary">
                {item.delta}
                <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
            <p className="text-2xl font-black">{item.value}</p>
            <p className="mt-1 text-sm text-text-secondary">{item.label}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <article className="rounded-2xl border border-border bg-card p-5 xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-bold">Recent Admin Activity</h3>
            <button className="text-sm font-semibold text-primary hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {feed.map((item) => (
              <div key={item.title} className="flex items-center justify-between rounded-xl border border-border bg-background p-3">
                <div className="flex items-center gap-3">
                  {item.status === "success" ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <Clock3 className="h-4 w-4 text-secondary" />
                  )}
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-text-secondary">{item.time}</p>
                  </div>
                </div>
                <CalendarCheck className="h-4 w-4 text-text-secondary" />
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-lg font-bold">Quick Actions</h3>
          <p className="mt-1 text-sm text-text-secondary">Use these shortcuts for daily operations.</p>
          <div className="mt-4 space-y-2">
            {["Approve Members", "Assign Mentors", "Publish Event", "Review Donations"].map((action) => (
              <button
                key={action}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold text-text-primary hover:border-primary/30 hover:text-primary"
              >
                {action}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
