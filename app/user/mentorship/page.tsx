"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, Compass, MessageSquareText, RefreshCw, Sparkles, Users } from "lucide-react";

type MentorProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  focusArea: string;
  nextSession: string;
  hasRequested: boolean;
};

type MentorshipRequest = {
  id: string;
  mentorId: string;
  mentorName: string;
  menteeEmail: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type MentorshipApiResponse = {
  mentors: MentorProfile[];
  requests: MentorshipRequest[];
  summary: {
    totalMentors: number;
    activeMentorships: number;
    pendingRequests: number;
  };
  message?: string;
};

let mentorshipCache: { data: MentorshipApiResponse; expiresAt: number } | null = null;
const MENTORSHIP_CACHE_TTL_MS = 10_000;

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

function MentorshipSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="h-5 w-40 rounded bg-border/60" />
        <div className="mt-3 h-7 w-80 max-w-full rounded bg-border/60" />
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`m-${i}`} className="h-16 rounded-lg border border-border bg-background" />
          ))}
        </div>
      </section>
      <section className="grid gap-4 xl:grid-cols-3">
        <div className="h-64 rounded-xl border border-border bg-card xl:col-span-2" />
        <div className="h-64 rounded-xl border border-border bg-card" />
      </section>
    </div>
  );
}

const suggestedTracks = [
  { title: "Career Mentorship", description: "Role switch planning, interview strategy, and profile positioning.", duration: "6 weeks" },
  { title: "Leadership Mentorship", description: "Ownership mindset, communication, and stakeholder management.", duration: "8 weeks" },
  { title: "Startup Mentorship", description: "Validation, execution planning, and founder decision frameworks.", duration: "10 weeks" },
];

export default function UserMentorshipPage() {
  const profile = useMemo(() => getStoredUserProfile(), []);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<"mentors" | "my-mentorships">("my-mentorships");

  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [summary, setSummary] = useState({ totalMentors: 0, activeMentorships: 0, pendingRequests: 0 });

  const loadData = useCallback(async (forceFresh = false) => {
    if (!profile.email) { setLoading(false); return; }

    if (!forceFresh && mentorshipCache && mentorshipCache.expiresAt > Date.now()) {
      applyData(mentorshipCache.data);
      setLoading(false);
      return;
    }

    try {
      setLoading((prev) => prev || mentors.length === 0);
      const refreshParam = forceFresh ? `?_=${Date.now()}&email=${encodeURIComponent(profile.email)}` : `?email=${encodeURIComponent(profile.email)}`;
      const res = await fetch(`/api/user/mentorship${refreshParam}`, {
        cache: forceFresh ? "no-store" : "default",
      });
      const data = (await res.json()) as MentorshipApiResponse;
      if (!res.ok) { setMessage(data.message || "Unable to load mentorship data."); return; }

      applyData(data);
      mentorshipCache = { data, expiresAt: Date.now() + MENTORSHIP_CACHE_TTL_MS };
      setMessage("");
    } catch {
      setMessage("Network error while loading mentorship data.");
    } finally {
      setLoading(false);
    }
  }, [profile.email]);

  function applyData(data: MentorshipApiResponse) {
    setMentors(data.mentors || []);
    setRequests(data.requests || []);
    setSummary(data.summary || { totalMentors: 0, activeMentorships: 0, pendingRequests: 0 });
  }

  useEffect(() => { void loadData(); }, [loadData]);

  const handleRequest = async (mentorId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/user/mentorship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorId, email: profile.email }),
      });
      const d = await res.json();
      if (!res.ok) { setMessage(d.message || "Unable to request."); return; }
      
      mentorshipCache = null;
      await loadData(true);
      setMessage("Mentorship request submitted successfully!");
    } catch {
      setMessage("Network error while requesting.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <MentorshipSkeleton />;

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <Compass className="h-3.5 w-3.5" /> Mentorship Program
            </p>
            <h2 className="mt-2 text-2xl font-black">Accelerate growth with alumni guidance</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Connect with experienced alumni for 1:1 sessions, career guidance, and portfolio reviews.
            </p>
          </div>
          <button
            onClick={() => { mentorshipCache = null; void loadData(true); }}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-text-secondary hover:text-primary hover:border-primary/30"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Active Sessions" value={String(summary.activeMentorships)} />
          <StatCard label="Pending Requests" value={String(summary.pendingRequests)} />
          <StatCard label="Available Mentors" value={String(summary.totalMentors)} />
          <StatCard label="Completed Sessions" value="0" />
        </div>

        {message && (
          <p className="mt-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-text-secondary">{message}</p>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <article className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="mb-4 inline-flex rounded-xl border border-border bg-background p-1">
              {(["my-mentorships", "mentors"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                    tab === key ? "bg-primary text-white" : "text-text-secondary hover:text-primary"
                  }`}
                >
                  {key === "my-mentorships" ? "My Mentorships" : "Find a Mentor"}
                </button>
              ))}
            </div>

            {tab === "my-mentorships" && (
              <div className="grid gap-3">
                {requests.length === 0 ? (
                  <EmptyState text="You have no active or pending mentorships." />
                ) : (
                  requests.map((req) => (
                    <div key={req.id} className="rounded-lg border border-border bg-background p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-text-primary">{req.mentorName}</p>
                          <p className="text-xs text-text-secondary">Requested on {new Date(req.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                          req.status === "Active" ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
                          req.status === "Pending" ? "border-amber-200 bg-amber-50 text-amber-700" :
                          "border-border bg-card text-text-secondary"
                        }`}>
                          {req.status === "Active" && <CheckCircle2 className="h-3 w-3" />}
                          {req.status}
                        </span>
                      </div>
                      {req.status === "Active" && (
                        <div className="mt-3 flex gap-2">
                          <button className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20">
                            <CalendarDays className="h-3.5 w-3.5" /> Book Session
                          </button>
                          <button className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-primary hover:border-primary/35">
                            <MessageSquareText className="h-3.5 w-3.5" /> Message
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === "mentors" && (
              <div className="grid gap-3">
                {mentors.length === 0 ? (
                  <EmptyState text="No mentors available right now." />
                ) : (
                  mentors.map((mentor) => (
                    <div key={mentor.id} className="rounded-lg border border-border bg-background p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                            {mentor.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-text-primary">{mentor.name}</p>
                            <p className="text-xs text-text-secondary">{mentor.role} at {mentor.company}</p>
                          </div>
                        </div>
                        {mentor.hasRequested ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                            Request Pending
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => void handleRequest(mentor.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
                          >
                            <Sparkles className="h-3 w-3" /> Request Mentor
                          </button>
                        )}
                      </div>
                      <p className="mt-3 text-sm font-medium">Focus: {mentor.focusArea}</p>
                      <p className="mt-1 text-xs text-text-secondary">Next availability: {mentor.nextSession}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </article>
        </div>

        <aside className="space-y-4">
          <article className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-bold">Recommended Tracks</h3>
            <div className="mt-3 space-y-3">
              {suggestedTracks.map((track) => (
                <div key={track.title} className="rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-primary">{track.title}</p>
                    <span className="text-[10px] font-semibold text-text-secondary uppercase">{track.duration}</span>
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">{track.description}</p>
                </div>
              ))}
            </div>
            <button className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text-primary hover:border-primary/35">
              Explore All Tracks <ArrowRight className="h-3.5 w-3.5" />
            </button>
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
