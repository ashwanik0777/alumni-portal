import { CalendarDays, Clock3, MapPin, Ticket, Users } from "lucide-react";

const upcomingEvents = [
  {
    title: "Alumni Career Circle Meetup",
    date: "25 Apr 2026",
    time: "6:30 PM - 8:00 PM",
    venue: "Lucknow Chapter Hub",
    type: "In Person",
    status: "Registered",
  },
  {
    title: "Tech Leadership AMA",
    date: "03 May 2026",
    time: "7:00 PM - 8:30 PM",
    venue: "Online Session",
    type: "Virtual",
    status: "Interested",
  },
  {
    title: "Batch Networking Evening",
    date: "18 May 2026",
    time: "5:00 PM - 9:00 PM",
    venue: "Delhi Alumni Club",
    type: "Hybrid",
    status: "Registered",
  },
];

const attendanceHistory = [
  { title: "Mentorship Kickoff 2026", date: "Mar 2026", note: "Attended" },
  { title: "Product Career Workshop", date: "Feb 2026", note: "Attended" },
  { title: "Resume Clinic", date: "Jan 2026", note: "Completed" },
];

export default function UserEventsPage() {
  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <CalendarDays className="h-3.5 w-3.5" />
          My Events Dashboard
        </p>
        <h2 className="mt-2 text-2xl font-black">Plan, register, and track alumni events</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Keep your event journey organized from registrations to attendance history.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <MetricCard label="Upcoming Events" value="5" />
          <MetricCard label="Registered" value="3" />
          <MetricCard label="Interested" value="4" />
          <MetricCard label="Attended This Year" value="9" />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="rounded-xl border border-border bg-card p-4 xl:col-span-2">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold">Your Upcoming Events</h3>
            <button className="text-xs font-semibold text-primary hover:underline">Browse all events</button>
          </div>

          <div className="grid gap-3">
            {upcomingEvents.map((event) => (
              <article key={event.title} className="rounded-lg border border-border bg-background p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-text-primary">{event.title}</p>
                    <p className="mt-0.5 text-xs text-text-secondary">{event.type}</p>
                  </div>
                  <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                    {event.status}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                  <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-1">
                    <CalendarDays className="h-3.5 w-3.5" /> {event.date}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-1">
                    <Clock3 className="h-3.5 w-3.5" /> {event.time}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-1">
                    <MapPin className="h-3.5 w-3.5" /> {event.venue}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-primary hover:border-primary/35">
                    View Details
                  </button>
                  <button className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20">
                    Manage Pass
                  </button>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-bold">Attendance History</h3>
          <div className="mt-3 space-y-2">
            {attendanceHistory.map((item) => (
              <div key={item.title} className="rounded-lg border border-border bg-background px-3 py-2.5">
                <p className="text-xs font-semibold text-text-primary">{item.title}</p>
                <p className="mt-1 text-[11px] text-text-secondary">{item.date} • {item.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <p className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
              <Ticket className="h-3.5 w-3.5" /> Event Reminder
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              Add your registered events to calendar for automatic reminders.
            </p>
          </div>
        </article>
      </section>

      <section className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Users className="h-4 w-4 text-primary" />
            Want to host a batch meetup or chapter event?
          </p>
          <button className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-background px-4 py-2 text-xs font-semibold text-primary hover:border-primary/60">
            Request Event Support
          </button>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-border bg-background px-3 py-3">
      <p className="text-xl font-black text-primary">{value}</p>
      <p className="mt-1 text-xs text-text-secondary">{label}</p>
    </article>
  );
}
