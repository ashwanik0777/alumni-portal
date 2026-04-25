"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase, Building2, Clock3, Compass, Filter, MapPin, Search, Sparkles, TrendingUp, Users } from "lucide-react";
import type { ComponentType } from "react";

type PublicJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  mode: string;
  type: string;
  salary: string;
  description: string;
  posted_at: string;
};

type Pagination = { page: number; pageSize: number; total: number; totalPages: number };
type CareerTrack = { id: string; title: string; description: string; growth: string; focus: string; icon_name: string };

const jobIconMap: Record<string, ComponentType<{ className?: string }>> = {
  Briefcase, TrendingUp, Compass, Sparkles,
};

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");
  const [modeFilter, setModeFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 12, total: 0, totalPages: 0 });
  const [locations, setLocations] = useState<string[]>([]);
  const [modes, setModes] = useState<string[]>([]);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [careerTracks, setCareerTracks] = useState<CareerTrack[]>([]);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, location: locationFilter, mode: modeFilter, page: String(page) });
      const res = await fetch(`/api/public/jobs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
        setPagination(data.pagination);
        if (data.locations?.length) setLocations(data.locations);
        if (data.modes?.length) setModes(data.modes);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [search, locationFilter, modeFilter, page]);

  useEffect(() => {
    loadJobs();
    fetch("/api/public/career-tracks")
      .then(r => r.json())
      .then(d => setCareerTracks(d.tracks || []))
      .catch(() => {});
  }, [loadJobs]);

  const handleApply = async (jobId: string) => {
    setApplyingId(jobId);
    setMessage("");

    // Get email from cookie
    const cookieEmail = document.cookie.split(";").map(c => c.trim()).find(c => c.startsWith("auth_user="))?.split("=")[1];
    if (!cookieEmail) {
      router.push("/login?redirect=/jobs");
      setApplyingId(null);
      return;
    }

    const email = decodeURIComponent(cookieEmail);

    try {
      const res = await fetch("/api/user/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, email }),
      });

      if (res.status === 401) {
        router.push("/login?redirect=/jobs");
        return;
      }

      const data = await res.json();
      if (res.ok) {
        setMessage("Application submitted successfully! Track it in your dashboard.");
      } else {
        setMessage(data.message || "Application failed.");
      }
    } catch {
      setMessage("Network error.");
    } finally {
      setApplyingId(null);
    }
  };

  function timeAgo(dateStr: string) {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (days === 0) return "Today";
      if (days === 1) return "1 day ago";
      if (days < 7) return `${days} days ago`;
      if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`;
      return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? "s" : ""} ago`;
    } catch { return dateStr; }
  }

  return (
    <div className="bg-background text-text-primary">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-14 -left-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-6 right-0 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary mb-5">
            <Sparkles className="h-4 w-4" /> Career Opportunities
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl">
            Discover High-Quality Opportunities Through Your Alumni Network
          </h1>
          <p className="mt-5 text-lg text-text-secondary leading-relaxed max-w-2xl">
            Explore curated openings, connect with hiring alumni, and accelerate your next career move with confidence.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <a href="#job-listings" className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
              Browse Openings
            </a>
            <Link href="/register" className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-6 py-3.5 font-semibold text-text-primary hover:border-primary/30 transition-colors">
              Create Candidate Profile
            </Link>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-5 relative">
              <Search className="h-4 w-4 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
              <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by title, company, skill..." className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-3 text-text-primary placeholder:text-text-secondary/75 outline-none focus:border-primary" />
            </div>
            <div className="lg:col-span-3">
              <select value={locationFilter} onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-primary outline-none focus:border-primary">
                <option value="All">All Locations</option>
                {locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="lg:col-span-2">
              <select value={modeFilter} onChange={(e) => { setModeFilter(e.target.value); setPage(1); }} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-text-primary outline-none focus:border-primary">
                <option value="All">All Modes</option>
                {modes.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="lg:col-span-2 text-center text-sm text-text-secondary flex items-center justify-center">
              {pagination.total} job{pagination.total !== 1 ? "s" : ""} found
            </div>
          </div>
        </div>
      </section>

      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary">{message}</div>
        </div>
      )}

      {/* Job Listings */}
      <section id="job-listings" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-14">
        {loading ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="rounded-2xl border border-border bg-card p-6 animate-pulse">
                <div className="h-4 w-20 rounded bg-border/60 mb-4" />
                <div className="h-6 w-3/4 rounded bg-border/60 mb-3" />
                <div className="h-4 w-1/2 rounded bg-border/60 mb-2" />
                <div className="h-4 w-1/3 rounded bg-border/60 mb-2" />
                <div className="h-10 w-full rounded-xl bg-border/60 mt-6" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-16 text-center">
            <Briefcase className="h-10 w-10 text-text-secondary mx-auto mb-3 opacity-50" />
            <p className="text-lg font-bold">No openings found</p>
            <p className="mt-1 text-sm text-text-secondary">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 mb-7">
              <h2 className="text-2xl sm:text-3xl font-bold">Featured Openings</h2>
              <span className="text-sm text-text-secondary">Updated from alumni network</span>
            </div>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <article key={job.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{job.type}</span>
                    <span className="text-xs text-text-secondary">{timeAgo(job.posted_at)}</span>
                  </div>

                  <h3 className="text-xl font-bold leading-snug">{job.title}</h3>
                  <p className="text-sm text-text-secondary mt-1 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" /> {job.company}
                  </p>

                  <div className="mt-4 space-y-2 text-sm text-text-secondary">
                    <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {job.location}</p>
                    <p className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-primary" /> {job.mode}</p>
                    {job.salary && <p className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> {job.salary}</p>}
                  </div>

                  {job.description && (
                    <p className="mt-3 text-xs text-text-secondary line-clamp-2">{job.description}</p>
                  )}

                  <div className="mt-6 grid grid-cols-2 gap-2">
                    <button className="rounded-xl border border-border bg-background py-2.5 text-sm font-semibold text-text-primary hover:border-primary/30 transition-colors cursor-default">
                      View Details
                    </button>
                    <button
                      onClick={() => handleApply(job.id)}
                      disabled={applyingId === job.id}
                      className="rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {applyingId === job.id ? "Applying..." : "Apply"}
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className={`h-9 w-9 rounded-lg text-sm font-semibold transition ${p === page ? "bg-primary text-white" : "border border-border bg-background text-text-secondary hover:text-primary"}`}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* Career Tracks Section */}
      <section className="border-y border-border bg-card/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
          <div className="rounded-3xl border border-border bg-background p-6 sm:p-8 lg:p-10 shadow-sm">
            <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-end">
              <div className="lg:col-span-8">
                <p className="inline-flex items-center gap-2 rounded-full bg-secondary/20 px-3 py-1 text-xs font-semibold text-text-primary mb-4">
                  <TrendingUp className="h-4 w-4 text-primary" /> Career Tracks
                </p>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight max-w-3xl">Choose the right lane for your next career leap</h2>
                <p className="mt-3 text-text-secondary leading-relaxed max-w-2xl">Explore role clusters designed around current market demand and alumni hiring momentum.</p>
              </div>
              <div className="lg:col-span-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-2xl font-black text-primary">{pagination.total}+</p>
                  <p className="text-xs text-text-secondary mt-1">Active openings</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-2xl font-black text-primary">{locations.length}+</p>
                  <p className="text-xs text-text-secondary mt-1">Hiring locations</p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {careerTracks.map((track) => {
                const TrackIcon = jobIconMap[track.icon_name] || Briefcase;
                return (
                  <article key={track.id} className="h-full rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <TrackIcon className="h-5 w-5" />
                      </div>
                      <p className="inline-flex rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary">{track.growth}</p>
                    </div>
                    <h3 className="text-xl font-bold">{track.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed mt-3">{track.description}</p>
                    <div className="mt-5 pt-4 border-t border-border/80 text-xs text-text-secondary">
                      Focus Areas: <span className="text-text-primary font-semibold">{track.focus}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="rounded-3xl border border-primary/20 dark:border-primary/40 bg-linear-to-r from-primary/95 to-primary dark:from-slate-900 dark:to-blue-950 p-8 sm:p-10 text-white relative overflow-hidden">
          <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-white/10" />
          <div className="absolute -left-12 -bottom-16 h-52 w-52 rounded-full bg-secondary/20" />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-medium bg-white/10 px-3 py-1 rounded-full mb-3">
                <Users className="h-4 w-4" /> Alumni Hiring Network
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold">Want faster referrals and better role visibility?</h3>
              <p className="mt-2 text-white/90 max-w-2xl">
                Complete your profile and let recruiters and alumni hiring managers discover your strengths.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/register" className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 font-semibold text-primary hover:bg-white/90 transition-colors">
                Register Now
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 px-6 py-3.5 font-semibold text-white hover:bg-white/10 transition-colors">
                <Compass className="h-4 w-4" /> Request Career Support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
