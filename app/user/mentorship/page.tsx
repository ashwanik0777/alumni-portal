import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, Compass, MessageSquareText, Sparkles, Users } from "lucide-react";

const activeMentors = [
  {
    name: "Nidhi Sharma",
    role: "Product Leader, InsightGrid",
    focus: "Career growth and product thinking",
    nextSession: "Tue, 7:30 PM",
    status: "Active",
  },
  {
    name: "Aman Tiwari",
    role: "Senior Engineer, CloudSprint",
    focus: "System design and backend transitions",
    nextSession: "Fri, 8:00 PM",
    status: "Scheduled",
  },
];

const mentorshipTasks = [
  "Finalize your 90-day learning goals",
  "Upload updated resume for review",
  "Complete mock interview checklist",
  "Submit session reflection notes",
];

const suggestedTracks = [
  {
    title: "Career Mentorship",
    description: "Role switch planning, interview strategy, and profile positioning.",
    duration: "6 weeks",
  },
  {
    title: "Leadership Mentorship",
    description: "Ownership mindset, communication, and stakeholder management.",
    duration: "8 weeks",
  },
  {
    title: "Startup Mentorship",
    description: "Validation, execution planning, and founder decision frameworks.",
    duration: "10 weeks",
  },
];

export default function UserMentorshipPage() {
  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          My Mentorship Hub
        </p>
        <h2 className="mt-2 text-2xl font-black">Mentorship that drives measurable growth</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Track active mentors, upcoming sessions, goals, and progress in one place.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <MetricCard label="Active Mentors" value="2" />
          <MetricCard label="Sessions Completed" value="14" />
          <MetricCard label="Upcoming This Month" value="5" />
          <MetricCard label="Goal Completion" value="82%" />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="rounded-xl border border-border bg-card p-4 xl:col-span-2">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold">Active Mentor Relationships</h3>
            <button className="text-xs font-semibold text-primary hover:underline">Request New Mentor</button>
          </div>

          <div className="grid gap-3">
            {activeMentors.map((mentor) => (
              <div key={mentor.name} className="rounded-lg border border-border bg-background p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-text-primary">{mentor.name}</p>
                    <p className="text-xs text-text-secondary">{mentor.role}</p>
                  </div>
                  <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                    {mentor.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-text-secondary">Focus: {mentor.focus}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                  <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-1">
                    <CalendarDays className="h-3.5 w-3.5 text-primary" /> {mentor.nextSession}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-primary hover:border-primary/35">
                    Open Session Notes
                  </button>
                  <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-primary hover:border-primary/35">
                    Message Mentor
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-bold">Quick Plan</h3>
          <p className="mt-1 text-xs text-text-secondary">Complete these items before your next mentor call.</p>
          <div className="mt-3 space-y-2">
            {mentorshipTasks.map((task) => (
              <button
                key={task}
                className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-text-primary hover:border-primary/35"
              >
                {task}
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <h3 className="text-sm font-bold">Suggested Mentorship Tracks</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {suggestedTracks.map((track) => (
            <article key={track.title} className="rounded-lg border border-border bg-background p-4">
              <p className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                <Compass className="h-3.5 w-3.5" /> {track.duration}
              </p>
              <h4 className="mt-2 text-sm font-bold">{track.title}</h4>
              <p className="mt-1 text-xs leading-relaxed text-text-secondary">{track.description}</p>
              <button className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                Enroll Track <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
            <BookOpen className="h-4 w-4 text-primary" />
            Want deeper mentorship support from the program team?
          </p>
          <button className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-background px-4 py-2 text-xs font-semibold text-primary hover:border-primary/60">
            <MessageSquareText className="h-3.5 w-3.5" />
            Raise Support Request
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
