"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Award, CalendarDays, CheckCircle2, Clock3, ExternalLink, FileCheck, GraduationCap,
  IndianRupee, Plus, ShieldCheck, Trash2, UserCheck,
} from "lucide-react";

type Scholarship = {
  id: string;
  scholarshipName: string;
  providerNames: string[];
  amountInr: number;
  seats: number;
  deadlineDate: string;
  eligibilityCriteria: string[];
  description: string;
  contactEmail: string;
  isActive: boolean;
};

type Application = {
  id: string;
  scholarshipName: string;
  status: "Pending" | "Verified" | "Completed";
  appliedAt: string;
  completedAt: string | null;
  documentLinks: string[];
};

type FormState = {
  scholarshipId: string;
  fullName: string;
  email: string;
  mobile: string;
  passingYear: string;
  currentCourse: string;
  currentYear: string;
  percentage: string;
  annualIncome: string;
  statement: string;
  documentLinks: string[];
  consent: boolean;
};

const emptyForm: FormState = {
  scholarshipId: "", fullName: "", email: "", mobile: "", passingYear: "",
  currentCourse: "", currentYear: "", percentage: "", annualIncome: "",
  statement: "", documentLinks: [""], consent: false,
};

function appStatusBadge(s: string) {
  if (s === "Completed") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (s === "Verified") return "border-blue-200 bg-blue-50 text-blue-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}

export default function UserScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [myApps, setMyApps] = useState<Application[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<"browse" | "apply" | "my">("browse");

  // Load profile from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("user_profile_draft_v1");
      if (!saved) return;
      const p = JSON.parse(saved) as Record<string, string>;
      setForm((prev) => ({
        ...prev,
        fullName: p.fullName || prev.fullName,
        email: p.email || prev.email,
        mobile: p.mobile || prev.mobile,
        passingYear: p.passingYear || prev.passingYear,
        currentCourse: p.studentCourse || p.currentCourse || prev.currentCourse,
        currentYear: p.studentYearOrSemester || prev.currentYear,
      }));
    } catch { /* skip */ }
  }, []);

  const loadScholarships = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/scholarships");
      const data = await res.json();
      if (res.ok) {
        setScholarships(data.scholarships || []);
        if (data.scholarships?.length > 0 && !form.scholarshipId) {
          setForm((prev) => ({ ...prev, scholarshipId: data.scholarships[0].id }));
        }
      }
    } catch { setMessage("Failed to load scholarships."); }
    finally { setLoading(false); }
  }, []);

  const loadMyApps = useCallback(async () => {
    if (!form.email?.trim()) return;
    try {
      const res = await fetch(`/api/user/scholarships?type=my-applications&email=${encodeURIComponent(form.email)}`);
      const data = await res.json();
      if (res.ok) setMyApps(data.applications || []);
    } catch { /* skip */ }
  }, [form.email]);

  useEffect(() => { loadScholarships(); }, [loadScholarships]);
  useEffect(() => { if (tab === "my") loadMyApps(); }, [tab, loadMyApps]);

  const selectedScholarship = scholarships.find((s) => s.id === form.scholarshipId);

  const updateField = <K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setMessage("");
  };

  const addDocLink = () => setForm((prev) => ({ ...prev, documentLinks: [...prev.documentLinks, ""] }));
  const removeDocLink = (i: number) => setForm((prev) => ({ ...prev, documentLinks: prev.documentLinks.filter((_, idx) => idx !== i) }));
  const updateDocLink = (i: number, v: string) => setForm((prev) => ({ ...prev, documentLinks: prev.documentLinks.map((item, idx) => (idx === i ? v : item)) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.consent) { setMessage("Please accept the consent."); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/user/scholarships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          documentLinks: form.documentLinks.filter((l) => l.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setMessage(data.message || "Error submitting."); return; }
      setMessage("Application submitted successfully! Admin will review after verification.");
      setForm((prev) => ({ ...prev, statement: "", documentLinks: [""], consent: false }));
      setTab("my");
      loadMyApps();
    } catch { setMessage("Network error."); }
    finally { setSubmitting(false); }
  };

  const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";

  if (loading) return <div className="space-y-4 animate-pulse">{[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-border/40" />)}</div>;

  return (
    <div className="space-y-5">
      {/* Header */}
      <section className="rounded-xl border border-border bg-card p-5">
        <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Award className="h-3.5 w-3.5" /> Scholarship Portal
        </p>
        <h2 className="mt-2 text-2xl font-black">Explore & Apply for Scholarships</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["browse", "apply", "my"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${tab === t ? "bg-primary text-white" : "border border-border bg-background text-text-secondary hover:text-primary"}`}>
              {t === "browse" ? "Browse Scholarships" : t === "apply" ? "Apply Now" : "My Applications"}
            </button>
          ))}
        </div>
        {message && <p className="mt-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-text-secondary">{message}</p>}
      </section>

      {/* Browse */}
      {tab === "browse" && (
        <section className="space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricCard label="Open Scholarships" value={String(scholarships.length)} />
            <MetricCard label="Total Seats" value={String(scholarships.reduce((a, s) => a + s.seats, 0))} />
            <MetricCard label="Max Amount" value={scholarships.length > 0 ? `₹${Math.max(...scholarships.map(s => s.amountInr)).toLocaleString("en-IN")}` : "—"} />
            <MetricCard label="Criteria Based" value="Yes" />
          </div>

          {scholarships.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-text-secondary">No active scholarships right now. Check back later!</div>
          ) : (
            scholarships.map((s) => (
              <article key={s.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">{s.scholarshipName}</h3>
                    <p className="mt-0.5 text-xs text-text-secondary">{s.providerNames.join(" • ")}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                    <IndianRupee className="h-3.5 w-3.5" /> ₹{s.amountInr.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-text-secondary">
                  <span className="inline-flex items-center gap-1 rounded-full bg-background px-2 py-1"><CalendarDays className="h-3.5 w-3.5" /> Deadline: {s.deadlineDate}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-background px-2 py-1"><UserCheck className="h-3.5 w-3.5" /> Seats: {s.seats}</span>
                </div>
                <div className="mt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary mb-1">Eligibility Criteria</p>
                  <ul className="space-y-1">
                    {s.eligibilityCriteria.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">{i+1}</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="mt-2 text-xs text-text-secondary">{s.description}</p>
                <button onClick={() => { updateField("scholarshipId", s.id); setTab("apply"); }}
                  className="mt-3 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:opacity-90">
                  Apply for this Scholarship
                </button>
              </article>
            ))
          )}
        </section>
      )}

      {/* Apply Form */}
      {tab === "apply" && (
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <h3 className="text-sm font-bold mb-1">Scholarship Application Form</h3>
          {selectedScholarship && (
            <p className="text-xs text-text-secondary mb-3">Applying for: <span className="font-semibold text-primary">{selectedScholarship.scholarshipName}</span></p>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-secondary">Scholarship *</span>
              <select value={form.scholarshipId} onChange={(e) => updateField("scholarshipId", e.target.value)} className={inputCls} required>
                {scholarships.map((s) => <option key={s.id} value={s.id}>{s.scholarshipName}</option>)}
              </select>
            </label>
            <InputField label="Full Name" value={form.fullName} onChange={(v) => updateField("fullName", v)} required />
            <InputField label="Email" value={form.email} onChange={(v) => updateField("email", v)} required type="email" />
            <InputField label="Mobile" value={form.mobile} onChange={(v) => updateField("mobile", v)} required />
            <InputField label="Passing Year" value={form.passingYear} onChange={(v) => updateField("passingYear", v)} required />
            <InputField label="Current Course" value={form.currentCourse} onChange={(v) => updateField("currentCourse", v)} required placeholder="e.g. B.Tech" />
            <InputField label="Current Year" value={form.currentYear} onChange={(v) => updateField("currentYear", v)} required placeholder="1 / 2 / 3 / 4" />
            <InputField label="Latest Percentage" value={form.percentage} onChange={(v) => updateField("percentage", v)} required />
            <InputField label="Annual Family Income (INR)" value={form.annualIncome} onChange={(v) => updateField("annualIncome", v)} required />

            <label className="sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-secondary">Statement of Purpose *</span>
              <textarea rows={3} value={form.statement} onChange={(e) => updateField("statement", e.target.value)}
                className={inputCls} placeholder="Why are you applying and how will scholarship help you?" required />
            </label>

            {/* Document Links */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Document Links (Google Drive, etc.)</p>
                <button type="button" onClick={addDocLink} className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/5">
                  <Plus className="h-3 w-3" /> Add Link
                </button>
              </div>
              <div className="space-y-2">
                {form.documentLinks.map((link, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-text-secondary shrink-0" />
                    <input value={link} onChange={(e) => updateDocLink(i, e.target.value)}
                      placeholder="https://drive.google.com/..." className={`${inputCls} flex-1`} />
                    {form.documentLinks.length > 1 && (
                      <button type="button" onClick={() => removeDocLink(i)} className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-1 text-[10px] text-text-secondary">Upload your documents to Google Drive and paste the share links here (marksheet, ID proof, income certificate, etc.)</p>
            </div>

            <label className="sm:col-span-2 inline-flex items-start gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-secondary">
              <input type="checkbox" checked={form.consent} onChange={(e) => updateField("consent", e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
              I confirm all information is correct and I agree that admin has final decision authority.
            </label>

            <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3">
              <p className="inline-flex items-center gap-2 text-xs text-text-secondary">
                <ShieldCheck className="h-4 w-4 text-primary" /> All fields are required for submission.
              </p>
              <button type="submit" disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-55">
                <GraduationCap className="h-4 w-4" /> {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* My Applications */}
      {tab === "my" && (
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <h3 className="text-sm font-bold mb-3">My Applications</h3>
          {!form.email?.trim() ? (
            <p className="text-xs text-text-secondary">Please fill your email in the Apply form first to see your applications.</p>
          ) : myApps.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-background p-6 text-center text-sm text-text-secondary">You have not applied for any scholarships yet.</div>
          ) : (
            <div className="space-y-3">
              {myApps.map((app) => (
                <article key={app.id} className="rounded-xl border border-border bg-background p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-text-primary">{app.scholarshipName}</h4>
                      <p className="text-xs text-text-secondary">Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${appStatusBadge(app.status)}`}>
                      {app.status === "Completed" ? <CheckCircle2 className="h-3.5 w-3.5" /> : app.status === "Verified" ? <FileCheck className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
                      {app.status}
                    </span>
                  </div>
                  {app.status === "Pending" && <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">Your application is under review. Admin will verify your documents.</p>}
                  {app.status === "Verified" && <p className="mt-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">Your documents have been verified! Waiting for fund disbursement.</p>}
                  {app.status === "Completed" && <p className="mt-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">Congratulations! Scholarship amount has been disbursed. Completed on {app.completedAt ? new Date(app.completedAt).toLocaleDateString() : "—"}.</p>}
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-border bg-card px-3 py-3">
      <p className="text-xl font-black text-primary">{value}</p>
      <p className="mt-1 text-xs text-text-secondary">{label}</p>
    </article>
  );
}

function InputField({ label, value, onChange, required, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string; type?: string;
}) {
  return (
    <label>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-secondary">{label}{required ? " *" : ""}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
    </label>
  );
}
