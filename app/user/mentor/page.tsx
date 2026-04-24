"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, CheckCircle2, RefreshCw, ShieldCheck, UserCheck, Users } from "lucide-react";
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

type MentorProfile = {
  id: string;
  email: string;
  full_name: string;
  expertise: string;
  max_mentees: number;
  status: string;
};

let mentorCache: { data: { applications: MentorshipApplication[]; mentorProfile: MentorProfile }; expiresAt: number } | null = null;
const CACHE_TTL_MS = 300_000;

export default function UserMentorDashboard() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [applications, setApplications] = useState<MentorshipApplication[]>([]);
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [isNotMentor, setIsNotMentor] = useState(false);

  const loadData = useCallback(async (forceFresh = false) => {
    if (!forceFresh && mentorCache && mentorCache.expiresAt > Date.now()) {
      setApplications(mentorCache.data.applications || []);
      setProfile(mentorCache.data.mentorProfile);
      setLoading(false);
      return;
    }

    try {
      setLoading((prev) => prev || applications.length === 0);
      const res = await fetch(`/api/user/mentor`, {
        cache: forceFresh ? "no-store" : "default",
      });
      const data = await res.json();
      
      if (res.status === 403) {
        setIsNotMentor(true);
        setLoading(false);
        return;
      }

      if (!res.ok) { setMessage(data.message || "Unable to load mentor data."); return; }

      setApplications(data.applications || []);
      setProfile(data.mentorProfile);
      mentorCache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
      setMessage("");
    } catch {
      setMessage("Network error while loading mentor data.");
    } finally {
      setLoading(false);
    }
  }, [applications.length]);

  useEffect(() => { void loadData(); }, [loadData]);

  const updateProgress = async (id: string, action: "start" | "complete") => {
    setActionLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/user/mentor", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const d = await res.json();
      if (!res.ok) { setMessage(d.message || "Unable to update."); return; }
      
      mentorCache = null;
      await loadData(true);
      setMessage(`Successfully marked as ${action === "start" ? "Started" : "Completed"}.`);
    } catch {
      setMessage("Network error.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="h-5 w-40 rounded bg-border/60" />
          <div className="mt-3 h-7 w-80 max-w-full rounded bg-border/60" />
        </section>
      </div>
    );
  }

  if (isNotMentor) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center max-w-2xl mx-auto mt-10 shadow-sm">
        <ShieldCheck className="h-12 w-12 text-text-secondary mx-auto mb-4" />
        <h2 className="text-2xl font-bold">You are not an approved mentor yet.</h2>
        <p className="mt-2 text-text-secondary">If you have applied, please wait for admin approval. If you want to become a mentor, apply now.</p>
        <Link href="/mentorship#mentor-form" className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90 transition-colors">
          Apply to be a Mentor
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> Mentor Dashboard
            </p>
            <h2 className="mt-2 text-2xl font-black">Welcome back, {profile?.full_name}</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Review your assigned mentees, track their progress, and mark sessions as started or completed.
            </p>
          </div>
          <button
            onClick={() => { mentorCache = null; void loadData(true); }}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-text-secondary hover:text-primary hover:border-primary/30"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-background p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Assigned Mentees</p>
            <p className="mt-1 text-2xl font-black text-primary">{applications.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-background p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Capacity</p>
            <p className="mt-1 text-2xl font-black text-text-primary">{profile?.max_mentees}</p>
          </div>
          <div className="rounded-xl border border-border bg-background p-4 md:col-span-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Your Expertise</p>
            <p className="mt-1 text-sm font-semibold text-text-primary truncate">{profile?.expertise}</p>
          </div>
        </div>

        {message && (
          <p className="mt-4 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary">{message}</p>
        )}
      </section>

      <section className="grid gap-4">
        <h3 className="text-lg font-bold">Your Mentees</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {applications.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card px-4 py-8 text-center md:col-span-2">
              <Users className="h-8 w-8 text-text-secondary mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-text-primary">No mentees assigned yet.</p>
              <p className="mt-1 text-xs text-text-secondary">Admins will assign students to you based on your expertise.</p>
            </div>
          ) : (
            applications.map((req) => (
              <div key={req.id} className="rounded-xl border border-border bg-card flex flex-col overflow-hidden">
                <div className="p-5 border-b border-border bg-background/50">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-base text-primary">{req.mentee_name}</h4>
                      <p className="text-xs text-text-secondary">{req.mentee_email}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                      req.status === "Active" || req.status === "Completed" ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
                      req.status === "Assigned" ? "border-blue-200 bg-blue-50 text-blue-700" :
                      "border-border bg-card text-text-secondary"
                    }`}>
                      {(req.status === "Active" || req.status === "Completed") && <CheckCircle2 className="h-3 w-3" />}
                      {req.status}
                    </span>
                  </div>

                  <div className="mt-3 text-xs grid grid-cols-2 gap-2">
                    <p><span className="font-semibold">Track:</span> {req.track}</p>
                    <p><span className="font-semibold">Stage:</span> {req.current_stage}</p>
                    <p className="col-span-2"><span className="font-semibold">Urgency:</span> {req.urgency}</p>
                  </div>
                  
                  <div className="mt-3 p-3 rounded-lg bg-card/50 text-sm border border-border/50">
                    <p className="text-[10px] font-bold text-text-secondary uppercase mb-1">Mentee's Goal</p>
                    <p>{req.goal}</p>
                  </div>
                </div>

                <div className="p-5 bg-card flex-1">
                  <p className="text-xs font-bold text-text-secondary uppercase mb-3 tracking-wider">Mentorship Progress Tracking</p>
                  <div className="grid gap-4">
                    
                    {/* Start Phase */}
                    <div className="rounded-lg border border-border bg-background p-3 flex flex-col items-start gap-2">
                      <div className="flex justify-between items-center w-full">
                        <p className="text-xs font-semibold text-text-primary">Phase 1: Start Mentorship</p>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${req.mentee_started ? 'text-emerald-600' : 'text-amber-600'}`}>
                          <UserCheck className="h-3 w-3"/> {req.mentee_started ? 'Mentee Started' : 'Mentee Pending'}
                        </span>
                      </div>
                      <p className="text-[10px] text-text-secondary">Confirm you have established contact with the mentee and started the sessions.</p>
                      <div className="flex items-center gap-4 mt-1 w-full border-t border-border/50 pt-2">
                        {req.mentor_started ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600"><ShieldCheck className="h-3.5 w-3.5"/> You Started</span>
                        ) : (
                          <button disabled={actionLoading} onClick={() => updateProgress(req.id, "start")} className="rounded-md bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 disabled:opacity-50">Mark as Started</button>
                        )}
                      </div>
                    </div>

                    {/* Completion Phase */}
                    <div className="rounded-lg border border-border bg-background p-3 flex flex-col items-start gap-2">
                      <div className="flex justify-between items-center w-full">
                        <p className="text-xs font-semibold text-text-primary">Phase 2: Complete Mentorship</p>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${req.mentee_completed ? 'text-emerald-600' : 'text-amber-600'}`}>
                          <UserCheck className="h-3 w-3"/> {req.mentee_completed ? 'Mentee Completed' : 'Mentee Pending'}
                        </span>
                      </div>
                      <p className="text-[10px] text-text-secondary">Confirm the mentorship goals have been met or the engagement has concluded.</p>
                      <div className="flex items-center gap-4 mt-1 w-full border-t border-border/50 pt-2">
                        {req.mentor_completed ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600"><ShieldCheck className="h-3.5 w-3.5"/> You Completed</span>
                        ) : (
                          <button disabled={actionLoading || !req.mentee_started || !req.mentor_started} onClick={() => updateProgress(req.id, "complete")} className="rounded-md bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 disabled:opacity-50">Mark Completed</button>
                        )}
                      </div>
                    </div>

                    {req.status === "Completed" && (
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                        <BadgeCheck className="h-4 w-4" /> This mentorship journey has been successfully completed. Thank you for your guidance!
                      </div>
                    )}
                    
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
