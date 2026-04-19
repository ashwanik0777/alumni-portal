import {
  ArrowUpRight,
  Briefcase,
  Calendar,
  Compass,
  MessageSquare,
  Users,
} from "lucide-react";

const highlights = [
  { label: "Connections", value: "132", hint: "+14 this month", icon: Users },
  { label: "Mentor Sessions", value: "9", hint: "2 upcoming", icon: Compass },
  { label: "Saved Jobs", value: "18", hint: "5 new matches", icon: Briefcase },
  { label: "Unread Messages", value: "6", hint: "3 high priority", icon: MessageSquare },
];

const timeline = [
  { title: "Mentorship call with Ankit", time: "Today, 7:00 PM", type: "Mentorship" },
  { title: "Alumni networking meetup", time: "Sunday, 11:00 AM", type: "Event" },
  { title: "Job referral review", time: "Monday, 10:30 AM", type: "Career" },
];

export default function UserDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">Personal Hub</p>
        <h2 className="mt-1 text-2xl font-black sm:text-3xl">Welcome to your dashboard</h2>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary">
          Track your profile growth, networking updates, mentorship progress, and career opportunities from one place.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {highlights.map((item) => (
          <article key={item.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex items-start justify-between">
              <span className="inline-flex rounded-xl bg-primary/10 p-2 text-primary">
                <item.icon className="h-5 w-5" />
              </span>
              <ArrowUpRight className="h-4 w-4 text-secondary" />
            </div>
            <p className="text-2xl font-black">{item.value}</p>
            <p className="mt-1 text-sm text-text-secondary">{item.label}</p>
            <p className="mt-2 text-xs font-semibold text-primary">{item.hint}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <article className="rounded-2xl border border-border bg-card p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">Upcoming Timeline</h3>
            <button className="text-sm font-semibold text-primary hover:underline">See calendar</button>
          </div>
          <div className="space-y-3">
            {timeline.map((item) => (
              <div key={item.title} className="flex items-center justify-between rounded-xl border border-border bg-background p-3">
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-text-secondary">{item.time}</p>
                </div>
                <span className="rounded-full bg-secondary/20 px-2.5 py-1 text-[11px] font-semibold text-text-primary">
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-lg font-bold">Quick Start</h3>
          <p className="mt-1 text-sm text-text-secondary">Complete these actions to improve your profile reach.</p>
          <div className="mt-4 space-y-2">
            {["Update profile summary", "Upload resume", "Book mentor slot", "Apply to one job"].map((task) => (
              <button
                key={task}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold text-text-primary hover:border-primary/30 hover:text-primary"
              >
                {task}
                <Calendar className="h-4 w-4" />
              </button>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
