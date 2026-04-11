import Link from "next/link";
import {
  Briefcase,
  Building2,
  Clock3,
  Compass,
  Filter,
  MapPin,
  Search,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

const featuredRoles = [
  {
    title: "Senior Frontend Engineer",
    company: "Microsoft",
    location: "Bengaluru",
    mode: "Hybrid",
    type: "Full Time",
    posted: "2 days ago",
  },
  {
    title: "Product Manager - Growth",
    company: "Flipkart",
    location: "Mumbai",
    mode: "Onsite",
    type: "Full Time",
    posted: "4 days ago",
  },
  {
    title: "Data Scientist",
    company: "Amazon",
    location: "Hyderabad",
    mode: "Hybrid",
    type: "Full Time",
    posted: "1 week ago",
  },
  {
    title: "UX Designer",
    company: "Adobe",
    location: "Pune",
    mode: "Remote",
    type: "Full Time",
    posted: "3 days ago",
  },
  {
    title: "DevOps Engineer",
    company: "Infosys",
    location: "Noida",
    mode: "Hybrid",
    type: "Full Time",
    posted: "5 days ago",
  },
  {
    title: "Business Analyst",
    company: "Deloitte",
    location: "Gurugram",
    mode: "Onsite",
    type: "Full Time",
    posted: "6 days ago",
  },
];

const careerTracks = [
  {
    icon: Briefcase,
    title: "Tech Roles",
    text: "Engineering, data, cloud, and platform opportunities from trusted alumni teams.",
    growth: "High Demand",
    focus: "Engineering, Data, Cloud",
  },
  {
    icon: TrendingUp,
    title: "Product & Strategy",
    text: "Openings across product management, analytics, consulting, and growth functions.",
    growth: "Fast Growth",
    focus: "Product, Analytics, Consulting",
  },
  {
    icon: Compass,
    title: "Design & Research",
    text: "User experience, visual design, and research positions in high-impact organizations.",
    growth: "Rising Opportunities",
    focus: "UX, Visual Design, Research",
  },
];

export default function JobsPage() {
  return (
    <div className="bg-background text-text-primary">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-14 -left-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-6 right-0 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary mb-5">
            <Sparkles className="h-4 w-4" />
            Career Opportunities
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl">
            Discover High-Quality Opportunities Through Your Alumni Network
          </h1>
          <p className="mt-5 text-lg text-text-secondary leading-relaxed max-w-2xl">
            Explore curated openings, connect with hiring alumni, and accelerate your next career move with
            confidence.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <a
              href="#featured-openings"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
            >
              Browse Openings
            </a>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-6 py-3.5 font-semibold text-text-primary hover:border-primary/30 transition-colors"
            >
              Create Candidate Profile
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-6 relative">
              <Search className="h-4 w-4 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, company, skill..."
                className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-3 text-text-primary placeholder:text-text-secondary/75 outline-none focus:border-primary"
              />
            </div>
            <div className="lg:col-span-3">
              <select className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-primary outline-none focus:border-primary">
                <option>All Locations</option>
                <option>Bengaluru</option>
                <option>Mumbai</option>
                <option>Hyderabad</option>
                <option>Remote</option>
              </select>
            </div>
            <div className="lg:col-span-3">
              <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-white hover:bg-primary/90 transition-colors">
                <Filter className="h-4 w-4" />
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="featured-openings" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-14">
        <div className="flex items-center justify-between gap-4 mb-7">
          <h2 className="text-2xl sm:text-3xl font-bold">Featured Openings</h2>
          <span className="text-sm text-text-secondary">Updated weekly by alumni recruiters</span>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {featuredRoles.map((role) => (
            <article
              key={`${role.title}-${role.company}`}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {role.type}
                </span>
                <span className="text-xs text-text-secondary">{role.posted}</span>
              </div>

              <h3 className="text-xl font-bold leading-snug">{role.title}</h3>
              <p className="text-sm text-text-secondary mt-1 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                {role.company}
              </p>

              <div className="mt-4 space-y-2 text-sm text-text-secondary">
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {role.location}
                </p>
                <p className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-primary" />
                  {role.mode}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2">
                <button className="rounded-xl border border-border bg-background py-2.5 text-sm font-semibold text-text-primary hover:border-primary/30 transition-colors">
                  View Details
                </button>
                <button className="rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
                  Apply
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
          <div className="rounded-3xl border border-border bg-background p-6 sm:p-8 lg:p-10 shadow-sm">
            <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-end">
              <div className="lg:col-span-8">
                <p className="inline-flex items-center gap-2 rounded-full bg-secondary/20 px-3 py-1 text-xs font-semibold text-text-primary mb-4">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Career Tracks
                </p>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight max-w-3xl">
                  Choose the right lane for your next career leap
                </h2>
                <p className="mt-3 text-text-secondary leading-relaxed max-w-2xl">
                  Explore role clusters designed around current market demand and alumni hiring momentum.
                </p>
              </div>

              <div className="lg:col-span-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-2xl font-black text-primary">120+</p>
                  <p className="text-xs text-text-secondary mt-1">Active openings</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-2xl font-black text-primary">35+</p>
                  <p className="text-xs text-text-secondary mt-1">Hiring partners</p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {careerTracks.map((track) => (
                <article
                  key={track.title}
                  className="h-full rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col"
                >
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <track.icon className="h-5 w-5" />
                    </div>
                    <p className="inline-flex rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary">
                      {track.growth}
                    </p>
                  </div>

                  <h3 className="text-xl font-bold">{track.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed mt-3">{track.text}</p>

                  <div className="mt-5 pt-4 border-t border-border/80 text-xs text-text-secondary">
                    Focus Areas: <span className="text-text-primary font-semibold">{track.focus}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="rounded-3xl border border-primary/20 dark:border-primary/40 bg-linear-to-r from-primary/95 to-primary dark:from-slate-900 dark:to-blue-950 p-8 sm:p-10 text-white relative overflow-hidden">
          <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-white/10" />
          <div className="absolute -left-12 -bottom-16 h-52 w-52 rounded-full bg-secondary/20" />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-medium bg-white/10 px-3 py-1 rounded-full mb-3">
                <Users className="h-4 w-4" />
                Alumni Hiring Network
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold">Want faster referrals and better role visibility?</h3>
              <p className="mt-2 text-white/90 max-w-2xl">
                Complete your profile and let recruiters and alumni hiring managers discover your strengths.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 font-semibold text-primary hover:bg-white/90 transition-colors"
              >
                Register Now
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 px-6 py-3.5 font-semibold text-white hover:bg-white/10 transition-colors"
              >
                <Compass className="h-4 w-4" />
                Request Career Support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
