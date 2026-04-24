"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Briefcase, Building2, Check, Clock3, Filter, MapPin, RefreshCw, Search, Star } from "lucide-react";

type JobListing = {
  id: string;
  title: string;
  company: string;
  location: string;
  mode: string;
  type: string;
  salary: string;
  description: string;
  postedBy: string;
  postedAt: string;
  isActive: boolean;
  hasApplied: boolean;
};

type JobApplication = {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  applicantEmail: string;
  stage: string;
  appliedAt: string;
  updatedAt: string;
};

type JobsApiResponse = {
  jobs: JobListing[];
  applications: JobApplication[];
  pipeline: Record<string, number>;
  summary: {
    totalJobs: number;
    totalApplications: number;
    interviewCount: number;
    offerCount: number;
  };
  message?: string;
};

let jobsCache: { data: JobsApiResponse; expiresAt: number } | null = null;
const JOBS_CACHE_TTL_MS = 10_000;

function getStoredUserProfile() {
  if (typeof window === "undefined") return { fullName: "", email: "" };
  try {
    const raw = localStorage.getItem("user_profile_draft_v1");
    if (raw) {
      const p = JSON.parse(raw) as { fullName?: string; email?: string };
      return { fullName: p.fullName?.trim() || "", email: p.email?.trim().toLowerCase() || "" };
    }
  } catch { /* skip */ }
  return { fullName: "Aman Sharma", email: "aman.alumni@jnvportal.in" };
}

function JobsSkeleton() {
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
      <section className="grid gap-4 xl:grid-cols-3">
        <div className="h-72 rounded-xl border border-border bg-card xl:col-span-2" />
        <div className="h-72 rounded-xl border border-border bg-card" />
      </section>
    </div>
  );
}

export default function UserJobsPage() {
  const profile = useMemo(() => getStoredUserProfile(), []);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"explore" | "applied">("explore");

  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [pipeline, setPipeline] = useState<Record<string, number>>({});
  const [summary, setSummary] = useState({ totalJobs: 0, totalApplications: 0, interviewCount: 0, offerCount: 0 });

  const loadData = useCallback(async (forceFresh = false) => {
    if (!profile.email) { setLoading(false); return; }

    if (!forceFresh && jobsCache && jobsCache.expiresAt > Date.now()) {
      applyData(jobsCache.data);
      setLoading(false);
      return;
    }

    try {
      setLoading((prev) => prev || jobs.length === 0);
      const refreshParam = forceFresh ? `&_=${Date.now()}` : "";
      const res = await fetch(`/api/user/jobs?email=${encodeURIComponent(profile.email)}${refreshParam}`, {
        cache: forceFresh ? "no-store" : "default",
      });
      const data = (await res.json()) as JobsApiResponse;
      if (!res.ok) { setMessage(data.message || "Unable to load jobs."); return; }

      applyData(data);
      jobsCache = { data, expiresAt: Date.now() + JOBS_CACHE_TTL_MS };
      setMessage("");
    } catch {
      setMessage("Network error while loading jobs.");
    } finally {
      setLoading(false);
    }
  }, [profile.email]);

  function applyData(data: JobsApiResponse) {
    setJobs(data.jobs || []);
    setApplications(data.applications || []);
    setPipeline(data.pipeline || {});
    setSummary(data.summary || { totalJobs: 0, totalApplications: 0, interviewCount: 0, offerCount: 0 });
  }

  useEffect(() => { void loadData(); }, [loadData]);

  const handleApply = async (jobId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/user/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, email: profile.email }),
      });
      const d = await res.json();
      if (!res.ok) { setMessage(d.message || "Unable to apply."); return; }
      
      jobsCache = null;
      await loadData(true);
      setMessage("Application submitted successfully!");
    } catch {
      setMessage("Network error while applying.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredJobs = useMemo(() => {
    if (!search.trim()) return jobs;
    const q = search.toLowerCase();
    return jobs.filter((j) =>
      j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.location.toLowerCase().includes(q)
    );
  }, [jobs, search]);

  if (loading) return <JobsSkeleton />;

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <Briefcase className="h-3.5 w-3.5" /> Career Hub
            </p>
            <h2 className="mt-2 text-2xl font-black">Explore Alumni Job Referrals</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Discover opportunities shared by the community and track your application pipeline.
            </p>
          </div>
          <button
            onClick={() => { jobsCache = null; void loadData(true); }}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-text-secondary hover:text-primary hover:border-primary/30"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Total Matches" value={String(summary.totalJobs)} />
          <StatCard label="Applications" value={String(summary.totalApplications)} />
          <StatCard label="Interviews" value={String(summary.interviewCount)} />
          <StatCard label="Offers" value={String(summary.offerCount)} />
        </div>

        {message && (
          <p className="mt-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-text-secondary">{message}</p>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <article className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="inline-flex rounded-xl border border-border bg-background p-1">
                {(["explore", "applied"] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTab(key)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                      tab === key ? "bg-primary text-white" : "text-text-secondary hover:text-primary"
                    }`}
                  >
                    {key === "explore" ? "Explore Jobs" : `My Applications (${summary.totalApplications})`}
                  </button>
                ))}
              </div>

              {tab === "explore" && (
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by title, company, location"
                    className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary sm:w-72"
                  />
                </div>
              )}
            </div>

            {tab === "explore" && (
              <div className="mt-4 grid gap-3">
                {filteredJobs.length === 0 ? (
                  <EmptyState text="No jobs match your search criteria." />
                ) : (
                  filteredJobs.map((job) => (
                    <div key={job.id} className="rounded-lg border border-border bg-background p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-card">
                            <Building2 className="h-5 w-5 text-text-secondary" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-text-primary">{job.title}</p>
                            <p className="text-xs text-text-secondary">{job.company}</p>
                          </div>
                        </div>
                        {job.hasApplied ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                            Applied
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                            <Star className="h-3 w-3 fill-primary" /> Hiring
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                        <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-1">{job.mode}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-1">{job.type}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-1 font-medium text-text-primary">{job.salary}</span>
                      </div>
                      <p className="mt-3 line-clamp-2 text-xs text-text-secondary">{job.description}</p>
                      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                        <span className="text-[11px] text-text-secondary">Posted {new Date(job.postedAt).toLocaleDateString()} by {job.postedBy}</span>
                        <button
                          type="button"
                          disabled={actionLoading || job.hasApplied}
                          onClick={() => void handleApply(job.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-text-primary hover:border-primary/35 disabled:opacity-50"
                        >
                          {job.hasApplied ? "Application Submitted" : "Apply via Referral"} <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === "applied" && (
              <div className="mt-4 grid gap-3">
                {applications.length === 0 ? (
                  <EmptyState text="You haven't applied to any jobs yet." />
                ) : (
                  applications.map((app) => (
                    <div key={app.id} className="rounded-lg border border-border bg-background p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-text-primary">{app.jobTitle}</p>
                          <p className="text-xs text-text-secondary">{app.company}</p>
                        </div>
                        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                          app.stage === "Applied" ? "border-amber-200 bg-amber-50 text-amber-700" :
                          app.stage === "Interview" ? "border-blue-200 bg-blue-50 text-blue-700" :
                          app.stage === "Offer" ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
                          "border-rose-200 bg-rose-50 text-rose-700"
                        }`}>
                          {app.stage}
                        </span>
                      </div>
                      <p className="mt-2 text-[11px] text-text-secondary">Applied on {new Date(app.appliedAt).toLocaleDateString()}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </article>
        </div>

        <aside className="space-y-4">
          <article className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-bold">Your Application Pipeline</h3>
            <div className="mt-3 space-y-2">
              {(["Saved", "Applied", "Interview", "Offer"] as const).map((stage) => (
                <div key={stage} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5">
                  <p className="text-xs font-semibold text-text-secondary">{stage}</p>
                  <p className="text-sm font-black text-text-primary">{pipeline[stage] || 0}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-bold">Referral Benefits</h3>
            <div className="mt-3 space-y-3">
              <div className="flex gap-2 text-xs">
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                <p className="text-text-secondary"><strong className="text-text-primary">Skip the queue.</strong> Direct visibility to hiring managers.</p>
              </div>
              <div className="flex gap-2 text-xs">
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                <p className="text-text-secondary"><strong className="text-text-primary">Alumni trust.</strong> Higher interview conversion rates.</p>
              </div>
              <div className="flex gap-2 text-xs">
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                <p className="text-text-secondary"><strong className="text-text-primary">Feedback loop.</strong> Get honest rejection reasons if not selected.</p>
              </div>
            </div>
          </article>
        </aside>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-border bg-background px-3 py-3">
      <p className="text-xl font-black text-primary">{value}</p>
      <p className="mt-1 text-xs text-text-secondary">{label}</p>
    </article>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-background px-4 py-8 text-center">
      <p className="text-sm font-semibold text-text-primary">Nothing to show</p>
      <p className="mt-1 text-xs text-text-secondary">{text}</p>
    </div>
  );
}
