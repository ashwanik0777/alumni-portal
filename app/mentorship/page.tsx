import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Briefcase,
  Compass,
  Lightbulb,
  MessageSquareText,
  Sparkles,
  Users,
} from "lucide-react";

const mentorshipTracks = [
  {
    icon: Briefcase,
    title: "Career Mentorship",
    text: "Get role-specific guidance on interviews, transitions, and long-term career planning.",
    audience: "Students & Early Professionals",
  },
  {
    icon: Compass,
    title: "Leadership Mentorship",
    text: "Learn decision making, stakeholder influence, and growth into senior leadership roles.",
    audience: "Mid-Career Alumni",
  },
  {
    icon: Lightbulb,
    title: "Startup Mentorship",
    text: "Work with founders and operators on idea validation, execution, and fundraising readiness.",
    audience: "Builders & Entrepreneurs",
  },
];

const process = [
  {
    title: "Share Your Goals",
    text: "Tell us your career stage, interests, and what outcomes you want from mentorship.",
  },
  {
    title: "Smart Mentor Match",
    text: "We pair you with relevant alumni mentors based on domain, role, and growth goals.",
  },
  {
    title: "Structured Sessions",
    text: "Follow a guided session plan with milestones, action items, and progress feedback.",
  },
  {
    title: "Continuous Growth",
    text: "Track outcomes and expand your network with peer circles and advanced mentor groups.",
  },
];

const impact = [
  { value: "1,300+", label: "Mentorship sessions" },
  { value: "420+", label: "Active mentors" },
  { value: "89%", label: "Goal completion rate" },
];

export default function MentorshipPage() {
  return (
    <div className="bg-background text-text-primary">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -left-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-8 right-0 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary mb-5">
            <Sparkles className="h-4 w-4" />
            Mentorship Program
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl">
            Learn Faster With Mentors Who Have Already Walked Your Path
          </h1>
          <p className="mt-5 text-lg text-text-secondary leading-relaxed max-w-2xl">
            Connect with alumni mentors for focused guidance on career growth, leadership, and entrepreneurial
            outcomes through structured mentorship journeys.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <a
              href="#mentor-form"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
            >
              Apply For Mentorship
            </a>
            <Link
              href="/directory"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-6 py-3.5 font-semibold text-text-primary hover:border-primary/30 transition-colors"
            >
              Explore Alumni Directory
            </Link>
          </div>

          <div className="mt-9 grid sm:grid-cols-3 gap-3 max-w-3xl">
            {impact.map((item) => (
              <div key={item.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <p className="text-2xl font-black text-primary">{item.value}</p>
                <p className="text-xs text-text-secondary mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-14">
        <div className="flex items-center justify-between gap-4 mb-7">
          <h2 className="text-2xl sm:text-3xl font-bold">Mentorship Tracks</h2>
          <span className="text-sm text-text-secondary">Built for different growth stages</span>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {mentorshipTracks.map((track) => (
            <article
              key={track.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <track.icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold">{track.title}</h3>
              <p className="text-text-secondary text-sm mt-2 leading-relaxed">{track.text}</p>
              <p className="mt-4 inline-flex rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-text-secondary">
                {track.audience}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
          <div className="rounded-4xl border border-border bg-background p-6 sm:p-8 lg:p-10 shadow-sm">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              <div className="lg:col-span-4">
                <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary mb-4">
                  <BookOpen className="h-4 w-4" />
                  Program Blueprint
                </p>
                <h2 className="text-2xl sm:text-3xl font-black leading-tight">How mentorship turns into measurable growth</h2>
                <p className="mt-3 text-text-secondary leading-relaxed">
                  A structured journey with clear checkpoints, progress visibility, and practical outcomes.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-2xl font-black text-primary">4</p>
                    <p className="text-xs text-text-secondary mt-1">Core phases</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-2xl font-black text-primary">1:1</p>
                    <p className="text-xs text-text-secondary mt-1">Mentor guidance</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 relative">
                <div className="hidden sm:block absolute left-4 top-3 bottom-3 w-px bg-primary/20" />
                <ol className="space-y-4 sm:space-y-5">
                  {process.map((step, index) => (
                    <li key={step.title} className="relative sm:pl-11">
                      <span className="hidden sm:inline-flex absolute left-0 top-5 h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-xs font-bold ring-4 ring-background">
                        {index + 1}
                      </span>

                      <article className="group rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-lg sm:text-xl font-bold">{step.title}</h3>
                          <span className="inline-flex rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-text-secondary">
                            Step 0{index + 1}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-text-secondary leading-relaxed">{step.text}</p>

                        <div className="mt-4 h-1.5 w-full rounded-full bg-primary/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-linear-to-r from-primary to-secondary"
                            style={{ width: `${(index + 1) * 25}%` }}
                          />
                        </div>
                      </article>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="mentor-form" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 lg:p-10 shadow-sm">
          <div className="flex items-center gap-2 text-primary mb-3">
            <MessageSquareText className="h-5 w-5" />
            <span className="text-sm font-semibold">Mentorship Request</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">Apply in under 2 minutes</h2>
          <p className="mt-2 text-text-secondary">
            Share your current stage and goals. We will match you with relevant mentors from the alumni network.
          </p>

          <form className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label>
              <span className="mb-1.5 block text-sm font-medium">Full Name</span>
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-primary placeholder:text-text-secondary/75 outline-none focus:border-primary"
              />
            </label>

            <label>
              <span className="mb-1.5 block text-sm font-medium">Email Address</span>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-primary placeholder:text-text-secondary/75 outline-none focus:border-primary"
              />
            </label>

            <label>
              <span className="mb-1.5 block text-sm font-medium">Current Stage</span>
              <select className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-primary outline-none focus:border-primary">
                <option>Student</option>
                <option>Early Career</option>
                <option>Mid Career</option>
                <option>Founder</option>
              </select>
            </label>

            <label>
              <span className="mb-1.5 block text-sm font-medium">Preferred Track</span>
              <select className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-primary outline-none focus:border-primary">
                <option>Career Mentorship</option>
                <option>Leadership Mentorship</option>
                <option>Startup Mentorship</option>
              </select>
            </label>

            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium">Your Goal</span>
              <textarea
                rows={4}
                placeholder="Describe what you want to achieve through mentorship"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-primary placeholder:text-text-secondary/75 outline-none focus:border-primary resize-y"
              />
            </label>

            <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
              <p className="inline-flex items-center gap-2 text-xs text-text-secondary">
                <BadgeCheck className="h-4 w-4 text-primary" />
                Mentor matching is managed by a verified alumni moderation team.
              </p>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90 transition-colors"
              >
                Submit Request
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 lg:pb-16">
        <div className="rounded-3xl border border-primary/20 dark:border-primary/40 bg-linear-to-r from-primary/95 to-primary dark:from-slate-900 dark:to-blue-950 p-8 sm:p-10 text-white relative overflow-hidden">
          <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-white/10" />
          <div className="absolute -left-12 -bottom-16 h-52 w-52 rounded-full bg-secondary/20" />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-medium bg-white/10 px-3 py-1 rounded-full mb-3">
                <Users className="h-4 w-4" />
                Alumni Mentors Ready
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold">Ready to accelerate your next chapter?</h3>
              <p className="mt-2 text-white/90 max-w-2xl">
                Join mentorship circles and get practical guidance from alumni who understand your journey.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 font-semibold text-primary hover:bg-white/90 transition-colors"
            >
              Talk To Program Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
