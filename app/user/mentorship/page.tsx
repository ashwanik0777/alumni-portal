"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, ShieldCheck, Compass, CheckCircle2, UserCheck, RefreshCw } from "lucide-react";
import Link from "next/link";

type MentorshipApplication = {
  id: string;
  mentee_email: string;
  mentee_name: string;
  current_stage: string;
  track: string;
  goal: string;
  urgency: string;
  status: "Pending" | "Assigned" | "Active" | "Completed" | "Closed";
  mentor_email: string | null;
  mentee_started: boolean;
  mentor_started: boolean;
  mentee_completed: boolean;
  mentor_completed: boolean;
  created_at: string;
};

let mentorshipCache: { data: { applications: MentorshipApplication[] }; expiresAt: number } | null = null;
const CACHE_TTL_MS = 300_000;

function MentorshipSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="h-5 w-40 rounded bg-border/60" />
        <div className="mt-3 h-7 w-80 max-w-full rounded bg-border/60" />
      </section>
      <section className="grid gap-4">
        <div className="h-64 rounded-xl border border-border bg-card" />
      </section>
    </div>
  );
}

export default function UserMentorshipPage() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [applications, setApplications] = useState<MentorshipApplication[]>([]);

  const loadData = useCallback(async (forceFresh = false) => {
    if (!forceFresh && mentorshipCache && mentorshipCache.expiresAt > Date.now()) {
      setApplications(mentorshipCache.data.applications || []);
      setLoading(false);
      return;
    }

    try {
      setLoading((prev) => prev || applications.length === 0);
      const res = await fetch(`/api/user/mentorship`, {
        cache: forceFresh ? "no-store" : "default",
      });
      const data = await res.json();
      if (!res.ok) { setMessage(data.message || "Unable to load mentorship data."); return; }

      setApplications(data.applications || []);
      mentorshipCache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
      setMessage("");
    } catch {
      setMessage("Network error while loading mentorship data.");
    } finally {
      setLoading(false);
    }
  }, [applications.length]);

  useEffect(() => { void loadData(); }, [loadData]);

  const updateProgress = async (id: string, action: "start" | "complete") => {
    setActionLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/user/mentorship", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const d = await res.json();
      if (!res.ok) { setMessage(d.message || "Unable to update."); return; }
      
      mentorshipCache = null;
      await loadData(true);
      setMessage(`Successfully marked as ${action === "start" ? "Started" : "Completed"}.`);
    } catch {
      setMessage("Network error.");
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
              <Compass className="h-3.5 w-3.5" /> My Mentorships
            </p>
            <h2 className="mt-2 text-2xl font-black">Accelerate growth with alumni guidance</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Track your mentorship progress and communicate with your assigned mentors.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { mentorshipCache = null; void loadData(true); }}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-text-secondary hover:text-primary hover:border-primary/30"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
            <Link
              href="/mentorship"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90"
            >
              Apply For Mentorship
            </Link>
          </div>
        </div>

        {message && (
          <p className="mt-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary">{message}</p>
        )}
      </section>

      <section className="grid gap-4">
        <article className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <h3 className="text-lg font-bold mb-4">My Applications</h3>
          <div className="grid gap-3">
            {applications.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-background px-4 py-8 text-center">
                <p className="text-sm font-semibold text-text-primary">No active mentorships.</p>
                <p className="mt-1 text-xs text-text-secondary">You haven't requested any mentorship yet.</p>
                <Link href="/mentorship" className="mt-3 inline-block rounded-lg bg-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/20">Apply Now</Link>
              </div>
            ) : (
              applications.map((req) => (
                <div key={req.id} className="rounded-xl border border-border bg-background p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-text-primary">Track: {req.track}</p>
                      <p className="text-xs text-text-secondary mt-1">Requested on {new Date(req.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                      req.status === "Active" || req.status === "Completed" ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
                      req.status === "Pending" ? "border-amber-200 bg-amber-50 text-amber-700" :
                      req.status === "Assigned" ? "border-blue-200 bg-blue-50 text-blue-700" :
                      "border-border bg-card text-text-secondary"
                    }`}>
                      {(req.status === "Active" || req.status === "Completed") && <CheckCircle2 className="h-3 w-3" />}
                      {req.status}
                    </span>
                  </div>

                  <div className="mt-3 p-3 rounded-lg bg-card text-sm">
                    <p><span className="font-semibold">Your Goal:</span> {req.goal}</p>
                    {req.mentor_email && (
                      <p className="mt-2 text-primary font-bold">Assigned Mentor: {req.mentor_email}</p>
                    )}
                  </div>

                  {/* Actions based on status */}
                  {(req.status === "Assigned" || req.status === "Active") && (
                    <div className="mt-4 border-t border-border pt-4">
                      <p className="text-xs font-bold text-text-secondary uppercase mb-3 tracking-wider">Mentorship Progress Tracking</p>
                      <div className="grid sm:grid-cols-2 gap-4">
                        
                        {/* Start Phase */}
                        <div className="rounded-lg border border-border p-3 flex flex-col items-start gap-2">
                          <p className="text-xs font-semibold text-text-primary">Phase 1: Start Mentorship</p>
                          <p className="text-[10px] text-text-secondary">Acknowledge that you have connected with your mentor and started your sessions.</p>
                          <div className="flex items-center gap-4 mt-1 w-full">
                            {req.mentee_started ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600"><UserCheck className="h-3.5 w-3.5"/> You Started</span>
                            ) : (
                              <button disabled={actionLoading} onClick={() => updateProgress(req.id, "start")} className="rounded-md bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 disabled:opacity-50">Mark as Started</button>
                            )}
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${req.mentor_started ? 'text-emerald-600' : 'text-amber-600'}`}>
                              <ShieldCheck className="h-3.5 w-3.5"/> {req.mentor_started ? 'Mentor Started' : 'Mentor Pending'}
                            </span>
                          </div>
                        </div>

                        {/* Completion Phase */}
                        <div className="rounded-lg border border-border p-3 flex flex-col items-start gap-2">
                          <p className="text-xs font-semibold text-text-primary">Phase 2: Complete Mentorship</p>
                          <p className="text-[10px] text-text-secondary">Mark this mentorship as completed once your goals are met or sessions conclude.</p>
                          <div className="flex items-center gap-4 mt-1 w-full">
                            {req.mentee_completed ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600"><UserCheck className="h-3.5 w-3.5"/> You Completed</span>
                            ) : (
                              <button disabled={actionLoading || !req.mentee_started || !req.mentor_started} onClick={() => updateProgress(req.id, "complete")} className="rounded-md bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 disabled:opacity-50">Mark Completed</button>
                            )}
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${req.mentor_completed ? 'text-emerald-600' : 'text-amber-600'}`}>
                              <ShieldCheck className="h-3.5 w-3.5"/> {req.mentor_completed ? 'Mentor Completed' : 'Mentor Pending'}
                            </span>
                          </div>
                        </div>
                        
                      </div>
                    </div>
                  )}

                  {req.status === "Completed" && (
                    <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                      <BadgeCheck className="h-4 w-4" /> This mentorship journey has been successfully completed. Great job!
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
