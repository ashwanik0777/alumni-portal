import { ArrowUpRight, Briefcase, Building2, Clock3, Filter, MapPin, Search, Star } from "lucide-react";

const matchedJobs = [
  {
    title: "Frontend Engineer",
    company: "PixelNest Labs",
    location: "Bengaluru",
    mode: "Hybrid",
    posted: "2 days ago",
    fit: "92% match",
  },
  {
    title: "Product Analyst",
    company: "ScaleBridge",
    location: "Gurugram",
    mode: "Onsite",
    posted: "4 days ago",
    fit: "87% match",
  },
  {
    title: "Data Engineer",
    company: "InsightGrid",
    location: "Remote",
    mode: "Remote",
    posted: "1 week ago",
    fit: "84% match",
  },
];

const applicationPipeline = [
  { stage: "Saved", count: 18 },
  { stage: "Applied", count: 7 },
  { stage: "Interview", count: 3 },
  { stage: "Offer", count: 1 },
];

export default function UserJobsPage() {
  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Briefcase className="h-3.5 w-3.5" />
          My Jobs Workspace
        </p>
        <h2 className="mt-2 text-2xl font-black">Personalized opportunities and application tracking</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Discover matched roles, track your pipeline, and improve conversion with alumni referrals.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <MetricCard label="Matched Jobs" value="26" />
          <MetricCard label="Saved Roles" value="18" />
          <MetricCard label="Applications" value="7" />
          <MetricCard label="Interviews" value="3" />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="relative lg:col-span-6">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <input
              placeholder="Search title, company, skill"
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="lg:col-span-3">
            <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
              <option>All Locations</option>
              <option>Remote</option>
              <option>Bengaluru</option>
              <option>Gurugram</option>
              <option>Hyderabad</option>
            </select>
          </div>
          <div className="lg:col-span-3">
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-text-primary hover:border-primary/35">
              <Filter className="h-4 w-4" /> Apply Filters
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="rounded-xl border border-border bg-card p-4 xl:col-span-2">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold">Top Matches for You</h3>
            <button className="text-xs font-semibold text-primary hover:underline">View all matches</button>
          </div>

          <div className="grid gap-3">
            {matchedJobs.map((job) => (
              <article key={`${job.title}-${job.company}`} className="rounded-lg border border-border bg-background p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-text-primary">{job.title}</p>
                    <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-text-secondary">
                      <Building2 className="h-3.5 w-3.5 text-primary" /> {job.company}
                    </p>
                  </div>
                  <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                    {job.fit}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                  <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-1">
                    <MapPin className="h-3.5 w-3.5" /> {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-1">
                    <Clock3 className="h-3.5 w-3.5" /> {job.mode}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-1">
                    <ArrowUpRight className="h-3.5 w-3.5" /> {job.posted}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-primary hover:border-primary/35">
                    View Details
                  </button>
                  <button className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20">
                    Apply Now
                  </button>
                  <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-primary hover:border-primary/35">
                    Ask For Referral
                  </button>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-bold">Application Pipeline</h3>
          <div className="mt-3 space-y-2">
            {applicationPipeline.map((item) => (
              <div key={item.stage} className="rounded-lg border border-border bg-background px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-text-primary">{item.stage}</p>
                  <p className="text-sm font-black text-primary">{item.count}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <p className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
              <Star className="h-3.5 w-3.5" /> Pro Tip
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              Complete your profile and portfolio links to improve role match quality and recruiter response.
            </p>
          </div>
        </article>
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
