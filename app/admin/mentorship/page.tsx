"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, Clock3, Search, ShieldCheck, UserCheck, Users, XCircle } from "lucide-react";

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

type Mentor = {
  id: string;
  email: string;
  full_name: string;
  expertise: string;
  max_mentees: number;
  status: "Pending" | "Approved" | "Rejected";
  created_at: string;
};

const mentorshipResponseCache = new Map<string, { expiresAt: number; data: any }>();
const mentorsResponseCache = new Map<string, { expiresAt: number; data: any }>();
const CACHE_TTL_MS = 300_000;

export default function AdminMentorshipPage() {
  const [tab, setTab] = useState<"mentees" | "mentors">("mentees");
  const [message, setMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Mentees State
  const [applications, setApplications] = useState<MentorshipApplication[]>([]);
  const [appSearch, setAppSearch] = useState("");
  const [appStatus, setAppStatus] = useState("All");
  const [appPage, setAppPage] = useState(1);
  const [appTotal, setAppTotal] = useState(0);
  const [appSummary, setAppSummary] = useState({ pendingCount: 0, activeCount: 0, completedCount: 0 });
  const [appLoading, setAppLoading] = useState(false);

  // Mentors State
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [mentorSearch, setMentorSearch] = useState("");
  const [mentorStatus, setMentorStatus] = useState("All");
  const [mentorSummary, setMentorSummary] = useState({ pendingCount: 0, approvedCount: 0, rejectedCount: 0 });
  const [mentorLoading, setMentorLoading] = useState(false);

  const loadApplications = useCallback(async (forceFresh = false) => {
    const params = new URLSearchParams({ search: appSearch, status: appStatus, page: String(appPage) });
    const cacheKey = params.toString();
    const cached = forceFresh ? undefined : mentorshipResponseCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      setApplications(cached.data.rows);
      setAppTotal(cached.data.pagination.total);
      setAppSummary(cached.data.summary);
      return;
    }

    setAppLoading(true);
    try {
      const res = await fetch(`/api/admin/mentorship/applications?${cacheKey}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.rows);
        setAppTotal(data.pagination.total);
        setAppSummary(data.summary);
        mentorshipResponseCache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, data });
      }
    } finally {
      setAppLoading(false);
    }
  }, [appSearch, appStatus, appPage]);

  const loadMentors = useCallback(async (forceFresh = false) => {
    const params = new URLSearchParams({ search: mentorSearch, status: mentorStatus });
    const cacheKey = params.toString();
    const cached = forceFresh ? undefined : mentorsResponseCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      setMentors(cached.data.rows);
      setMentorSummary(cached.data.summary);
      return;
    }

    setMentorLoading(true);
    try {
      const res = await fetch(`/api/admin/mentorship/mentors?${cacheKey}`);
      if (res.ok) {
        const data = await res.json();
        setMentors(data.rows);
        setMentorSummary(data.summary);
        mentorsResponseCache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, data });
      }
    } finally {
      setMentorLoading(false);
    }
  }, [mentorSearch, mentorStatus]);

  useEffect(() => {
    if (tab === "mentees") loadApplications();
    else loadMentors();
  }, [tab, loadApplications, loadMentors]);

  const updateAppStatus = async (id: string, status: string, mentorEmail?: string) => {
    if (status === "Assigned" && !mentorEmail) {
      mentorEmail = prompt("Enter Mentor's Email Address:") || undefined;
      if (!mentorEmail) return; // cancelled
    }
    
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/mentorship/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, mentor_email: mentorEmail }),
      });
      if (res.ok) {
        setMessage("Application updated successfully!");
        loadApplications(true);
      } else {
        setMessage((await res.json()).message || "Update failed.");
      }
    } catch {
      setMessage("Network error.");
    } finally {
      setActionLoading(false);
    }
  };

  const updateMentorStatus = async (id: string, status: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/mentorship/mentors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setMessage("Mentor updated successfully!");
        loadMentors(true);
      } else {
        setMessage((await res.json()).message || "Update failed.");
      }
    } catch {
      setMessage("Network error.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black sm:text-3xl">Mentorship Management</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Review and match student mentorship requests with approved alumni mentors.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTab("mentees")}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${tab === "mentees" ? "bg-primary text-white" : "border border-border bg-background text-text-secondary hover:text-primary"}`}
            >
              Mentees Queue
            </button>
            <button
              onClick={() => setTab("mentors")}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${tab === "mentors" ? "bg-primary text-white" : "border border-border bg-background text-text-secondary hover:text-primary"}`}
            >
              Approved Mentors
            </button>
          </div>
        </div>
        {message && <p className="mt-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-text-secondary">{message}</p>}
      </section>

      {/* Mentees Tab */}
      {tab === "mentees" && (
        <div className="space-y-6">
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Pending Requests</p>
              <p className="mt-2 text-2xl font-black text-amber-600">{appSummary.pendingCount}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Active Mentorships</p>
              <p className="mt-2 text-2xl font-black text-blue-600">{appSummary.activeCount}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Completed</p>
              <p className="mt-2 text-2xl font-black text-emerald-600">{appSummary.completedCount}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 mb-5">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                <input value={appSearch} onChange={(e) => setAppSearch(e.target.value)} placeholder="Search by name or email..." className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary" />
              </div>
              <select value={appStatus} onChange={(e) => setAppStatus(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary">
                <option>All</option>
                <option>Pending</option>
                <option>Assigned</option>
                <option>Active</option>
                <option>Completed</option>
                <option>Closed</option>
              </select>
            </div>

            {appLoading ? (
              <div className="space-y-3 animate-pulse">{[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-border/40" />)}</div>
            ) : applications.length === 0 ? (
              <p className="text-sm text-text-secondary text-center p-5">No requests found.</p>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <article key={app.id} className="rounded-xl border border-border bg-background p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm">{app.mentee_name} <span className="font-normal text-text-secondary">({app.mentee_email})</span></h4>
                        <p className="text-xs text-text-secondary mt-1">Track: {app.track} • Stage: {app.current_stage}</p>
                      </div>
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${app.status === 'Pending' ? 'border-amber-200 bg-amber-50 text-amber-700' : app.status === 'Completed' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-blue-200 bg-blue-50 text-blue-700'}`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="mt-3 p-3 rounded-lg bg-card/50 text-xs">
                      <p><span className="font-semibold">Goal:</span> {app.goal}</p>
                      <p className="mt-1"><span className="font-semibold">Urgency:</span> <span className={app.urgency === 'Urgent' ? 'text-rose-600 font-bold' : ''}>{app.urgency}</span></p>
                      {app.mentor_email && <p className="mt-1"><span className="font-semibold text-primary">Assigned Mentor:</span> {app.mentor_email}</p>}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {app.status === 'Pending' && (
                        <button disabled={actionLoading} onClick={() => updateAppStatus(app.id, 'Assigned')} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-50">Assign Mentor</button>
                      )}
                      {(app.status === 'Pending' || app.status === 'Assigned' || app.status === 'Active') && (
                        <button disabled={actionLoading} onClick={() => updateAppStatus(app.id, 'Closed')} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-background disabled:opacity-50">Close Request</button>
                      )}
                    </div>
                    {(app.status === 'Assigned' || app.status === 'Active' || app.status === 'Completed') && (
                      <div className="mt-3 text-[11px] flex gap-4 text-text-secondary border-t border-border pt-3">
                        <span className="flex items-center gap-1"><UserCheck className="h-3 w-3"/> Mentee Started: {app.mentee_started ? "Yes" : "No"}</span>
                        <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3"/> Mentor Started: {app.mentor_started ? "Yes" : "No"}</span>
                        <span className="flex items-center gap-1"><BadgeCheck className="h-3 w-3"/> Both Complete: {(app.mentee_completed && app.mentor_completed) ? "Yes" : "No"}</span>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Mentors Tab */}
      {tab === "mentors" && (
        <div className="space-y-6">
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Pending Approval</p>
              <p className="mt-2 text-2xl font-black text-amber-600">{mentorSummary.pendingCount}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Approved Mentors</p>
              <p className="mt-2 text-2xl font-black text-emerald-600">{mentorSummary.approvedCount}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Rejected</p>
              <p className="mt-2 text-2xl font-black text-rose-600">{mentorSummary.rejectedCount}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 mb-5">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                <input value={mentorSearch} onChange={(e) => setMentorSearch(e.target.value)} placeholder="Search by name or email..." className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary" />
              </div>
              <select value={mentorStatus} onChange={(e) => setMentorStatus(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary">
                <option>All</option>
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
              </select>
            </div>

            {mentorLoading ? (
              <div className="space-y-3 animate-pulse">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-border/40" />)}</div>
            ) : mentors.length === 0 ? (
              <p className="text-sm text-text-secondary text-center p-5">No mentors found.</p>
            ) : (
              <div className="space-y-3">
                {mentors.map((mentor) => (
                  <article key={mentor.id} className="rounded-xl border border-border bg-background p-4 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-sm">{mentor.full_name}</h4>
                      <p className="text-xs text-text-secondary">{mentor.email} • Max Mentees: {mentor.max_mentees}</p>
                      <p className="text-xs text-text-secondary mt-1"><span className="font-semibold">Expertise:</span> {mentor.expertise}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded-full border ${mentor.status === 'Approved' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : mentor.status === 'Rejected' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                        {mentor.status}
                      </span>
                      {mentor.status === 'Pending' && (
                        <>
                          <button disabled={actionLoading} onClick={() => updateMentorStatus(mentor.id, 'Approved')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"><BadgeCheck className="w-4 h-4"/></button>
                          <button disabled={actionLoading} onClick={() => updateMentorStatus(mentor.id, 'Rejected')} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"><XCircle className="w-4 h-4"/></button>
                        </>
                      )}
                      {mentor.status === 'Approved' && (
                        <button disabled={actionLoading} onClick={() => updateMentorStatus(mentor.id, 'Rejected')} className="text-xs px-2 py-1 border border-rose-200 text-rose-700 rounded-lg hover:bg-rose-50">Revoke</button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
